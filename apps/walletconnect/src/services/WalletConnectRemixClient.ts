import { PluginClient } from '@remixproject/plugin'
import { createClient } from '@remixproject/plugin-webview'
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5/react'
import { constants } from '../utils/constants'
import EventManager from 'events'
import { PROJECT_ID as projectId, METADATA as metadata } from './constant'
import { Chain, RequestArguments } from '../types'

export class WalletConnectRemixClient extends PluginClient {
  web3modal: ReturnType<typeof createWeb3Modal>
  ethersConfig: ReturnType<typeof defaultConfig>
  chains: Chain[]
  currentChain: number
  internalEvents: EventManager
  currentAccount: string

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
      const ethersConfig = defaultConfig({
        metadata,
        rpcUrl: 'https://cloudflare-eth.com'
      })

      this.web3modal = createWeb3Modal({ projectId, chains: constants.chains, metadata, ethersConfig })
      this.ethersConfig = ethersConfig
      this.chains = constants.chains
    } catch (e) {
      return console.error('Could not get a wallet connection', e)
    }
  }

  subscribeToEvents() {
    this.web3modal.subscribeProvider(({ address, isConnected, chainId })=>{
      if (isConnected){
        if (address !== this.currentAccount) {
          this.currentAccount = address
          this.emit('accountsChanged', [address])
        }
        if (this.currentChain !== chainId) {
          this.currentChain = chainId
          this.emit('chainChanged', chainId)
        }
      } else {
        this.emit('accountsChanged', [])
        this.currentAccount = ''
        this.emit('chainChanged', 0)
        this.currentChain = 0
      }
    },)
    this.on('theme', 'themeChanged', (theme: any) => {
      this.web3modal.setThemeMode(theme.quality)
    })
  }

  async sendAsync(data: RequestArguments) {
    const address = this.web3modal.getAddress()
    const provider = this.web3modal.getWalletProvider()
    if (address && provider) {
      if (data.method === 'eth_accounts') {
        return {
          jsonrpc: '2.0',
          result: [address],
          id: data.id
        }
      } else {
        //@ts-expect-error this flag does not correspond to EIP-1193 but was introduced by MetaMask
        if (provider.isMetamask && provider.sendAsync) {
          return new Promise((resolve) => {
            //@ts-expect-error sendAsync is a legacy function we know MetaMask supports it
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
            return { jsonrpc: '2.0', result: message, id: data.id }
          } catch (e) {
            return { jsonrpc: '2.0', error: { message: e.message, code: -32603 }, id: data.id }
          }
        }
      }
    } else {
      const err = `Cannot make ${data.method} request. Remix client is not connected to walletconnect client`
      console.error(err)
      return { jsonrpc: '2.0', error: { message: err, code: -32603 }, id: data.id }
    }
  }

  async deactivate() {
    console.log('deactivating walletconnect plugin...')
    await this.web3modal.disconnect()
  }
}
