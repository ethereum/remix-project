import {PluginClient} from '@remixproject/plugin'
import {createClient} from '@remixproject/plugin-webview'
import {defaultWagmiConfig, createWeb3Modal} from '@web3modal/wagmi/react'
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
  sepolia,
  ronin,
  saigon
} from 'viem/chains'
import EventManager from 'events'
import {PROJECT_ID as projectId, METADATA as metadata} from './constant'
import { Config, disconnect, getAccount, watchAccount } from '@wagmi/core'
import { EIP1193Provider, RequestArguments } from '../types'

export class WalletConnectRemixClient extends PluginClient {
  web3modal: ReturnType<typeof createWeb3Modal>
  wagmiConfig: Config
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

  initClient() {
    try {
      const chains = [
        mainnet,
        arbitrum,
        arbitrumGoerli,
        polygon,
        polygonMumbai,
        optimism,
        optimismGoerli,
        goerli,
        sepolia,
        ronin,
        saigon
      ] as [Chain, ...Chain[]]

      const wagmiConfig = defaultWagmiConfig({
        chains,
        projectId,
        metadata,
        //ssr: true
      })

      this.web3modal = createWeb3Modal({ wagmiConfig, projectId, chains })
      this.wagmiConfig = wagmiConfig
      this.chains = chains
    } catch (e) {
      return console.error('Could not get a wallet connection', e)
    }
  }

  subscribeToEvents() {
    watchAccount(this.wagmiConfig, {
      onChange(account) {
        if(account.isConnected){
          if (account.address !== this.currentAcount) {
            this.currentAcount = account.address
            this.emit('accountsChanged', [account.address])          
          }
          if (this.currentChain !== account.chainId) {
            this.currentChain = account.chainId
            this.emit('chainChanged', account.chainId)
          }
        }else{
          this.emit('accountsChanged', [])
          this.currentAcount = ''
          this.emit('chainChanged', 0)
          this.currentChain = 0
        }
      },
    })
    this.on('theme', 'themeChanged', (theme: any) => {
      this.web3modal.setThemeMode(theme.quality)
    })
  }

  async sendAsync(data: RequestArguments) {
    const account = getAccount(this.wagmiConfig)
    if (account.isConnected) {
      if (data.method === 'eth_accounts') {
        return {
          jsonrpc: '2.0',
          result: [account.address],
          id: data.id
        }
      } else {
        const provider = await account.connector.getProvider() as EIP1193Provider

        if (provider) {
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
    await disconnect(this.wagmiConfig)
  }
}
