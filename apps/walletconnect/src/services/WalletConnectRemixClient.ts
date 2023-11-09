import {PluginClient} from '@remixproject/plugin'
import {createClient} from '@remixproject/plugin-webview'
import {w3mConnectors, w3mProvider} from '@web3modal/ethereum'
import {createConfig, configureChains} from 'wagmi'
import {
  arbitrum,
  arbitrumGoerli,
  mainnet,
  polygon,
  polygonMumbai,
  optimism,
  optimismGoerli,
  Chain,
  goerli,
  sepolia
} from 'viem/chains'
import {EthereumClient} from '@web3modal/ethereum'
import EventManager from 'events'
import {PROJECT_ID} from './constant'

export class WalletConnectRemixClient extends PluginClient {
  wagmiConfig
  ethereumClient: EthereumClient
  chains: Chain[]
  currentChain: number
  internalEvents: EventManager
  currentAcount: string

  constructor() {
    super()
    createClient(this)
    this.internalEvents = new EventManager()
    this.methods = ['sendAsync', 'init', 'deactivate']
    this.onload()
  }

  onActivation() {
    this.subscribeToEvents()
    this.call('theme', 'currentTheme').then((theme: any) => {
      this.internalEvents.emit('themeChanged', theme.quality.toLowerCase())
    })
  }

  init() {
    console.log('initializing walletconnect plugin...')
  }

  async initClient() {
    try {
      this.chains = [
        mainnet,
        arbitrum,
        arbitrumGoerli,
        polygon,
        polygonMumbai,
        optimism,
        optimismGoerli,
        goerli,
        sepolia
      ]
      const {publicClient} = configureChains(this.chains, [
        w3mProvider({projectId: PROJECT_ID})
      ], {
        pollingInterval: 5000
      })

      this.wagmiConfig = createConfig({
        autoConnect: false,
        connectors: w3mConnectors({projectId: PROJECT_ID, chains: this.chains}),
        publicClient
      })
      this.ethereumClient = new EthereumClient(this.wagmiConfig, this.chains)
    } catch (e) {
      return console.error('Could not get a wallet connection', e)
    }
  }

  subscribeToEvents() {
    this.wagmiConfig.subscribe((event) => {
      if (event.status === 'connected') {
        if (event.data.account !== this.currentAcount) {
          this.currentAcount = event.data.account
          this.emit('accountsChanged', [event.data.account])          
        }
        if (this.currentChain !== event.data.chain.id) {
          this.currentChain = event.data.chain.id
          this.emit('chainChanged', event.data.chain.id)
        }
      } else if (event.status === 'disconnected') {
        this.emit('accountsChanged', [])
        this.currentAcount = ''
        this.emit('chainChanged', 0)
        this.currentChain = 0
      }
    })
    this.on('theme', 'themeChanged', (theme: any) => {
      this.internalEvents.emit('themeChanged', theme.quality)
    })
  }

  async sendAsync(data: {method: string; params: string; id: string}) {
    if (this.wagmiConfig.status === 'connected') {
      if (data.method === 'eth_accounts') {
        return {
          jsonrpc: '2.0',
          result: [this.wagmiConfig.data.account],
          id: data.id
        }
      } else {
        const provider = await this.wagmiConfig.connector.getProvider({
          chainId: this.wagmiConfig.data.chain.id
        })

        if (provider.isMetaMask) {
          return new Promise((resolve) => {
            provider.sendAsync(data, (error, response) => {
              if (error) {
                if (error.data && error.data.originalError && error.data.originalError.data) {
                  resolve({
                    jsonrpc: '2.0',
                    error: error.data.originalError,
                    id: data.id
                  })
                } else if (error.data && error.data.message) {
                  resolve({
                    jsonrpc: '2.0',
                    error: error.data && error.data,
                    id: data.id
                  })
                } else {
                  resolve({
                    jsonrpc: '2.0',
                    error,
                    id: data.id
                  })
                }                
              }
              return resolve(response)
            })
          })
        } else {
          try {
            const message = await provider.request(data)
            return {jsonrpc: '2.0', result: message, id: data.id}
          } catch (e) {
            return {jsonrpc: '2.0', error: { message: e.message, code: -32603 }, id: data.id}
          }
        }
      }
    } else {
      const err = `Cannot make ${data.method} request. Remix client is not connected to walletconnect client`
      console.error(err)
      return {jsonrpc: '2.0', error: { message: err, code: -32603 }, id: data.id}
    }
  }

  async deactivate() {
    console.log('deactivating walletconnect plugin...')
    await this.ethereumClient.disconnect()
  }
}
