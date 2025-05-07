import { createAppKit, Provider } from '@reown/appkit'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { mainnet, sepolia, arbitrum, arbitrumSepolia, optimism, optimismSepolia, solana, solanaTestnet, bitcoin, bitcoinTestnet, bsc, bscTestnet, polygon } from "@reown/appkit/networks"
import { constants } from './constants'
import { EventEmitter } from 'events'

export interface RequestArguments {
    readonly method: string
    readonly params?: readonly unknown[] | object
    readonly id?: number
}

export type Chain = {
  chainId: number
  name: string
  currency: string
  explorerUrl: string
  rpcUrl: string
}

export class WalletConnect {
  appkit: ReturnType<typeof createAppKit>
  chains: Chain[]
  currentChain: string | number
  currentAccount: string
  events: EventEmitter

  constructor () {
    this.appkit = createAppKit({
      adapters: [new EthersAdapter()],
      projectId: constants.PROJECT_ID,
      metadata: constants.METADATA,
      networks: [mainnet, sepolia, arbitrum, arbitrumSepolia, optimism, optimismSepolia, solana, solanaTestnet, bitcoin, bitcoinTestnet, bsc, bscTestnet, polygon]
    })
    this.chains = constants.chains
    this.events = new EventEmitter()
  }

  onActivation() {
    this.subscribeToEvents()
  }

  async init() {
    console.log('initializing walletconnect plugin...')
  }

  async openModal() {
    if (this.isWalletConnected()) return await this.appkit.open()
    await this.appkit.open()
  }

  isWalletConnected() {
    const isConnected = this.appkit.getIsConnectedState()

    return isConnected
  }

  subscribeToEvents() {
    this.appkit.subscribeState(async (state) => {
      if (!state.open) {
        this.events.emit('closeModal')
        try {
          const provider = await this.appkit.getProvider(this.appkit.chainNamespaces[0])
          if (provider) {
            this.events.emit('connectionSuccessful')
          }
        } catch (error) {
          this.events.emit('connectionFailed', error.message)
        }
      }
    })

    this.appkit.subscribeNetwork((network) => {
      const address = this.appkit.getAddress()
      if (this.isWalletConnected()) {
        if (address !== this.currentAccount) {
          this.currentAccount = address
          this.events.emit('accountsChanged', [address])
        }
        if (this.currentChain !== network.chainId) {
          this.currentChain = network.chainId
          this.events.emit('chainChanged', network.chainId)
        }
      } else {
        this.events.emit('accountsChanged', [])
        this.currentAccount = ''
        this.events.emit('chainChanged', 0)
        this.currentChain = 0
      }
    })

    this.appkit.subscribeEvents((eventPayload) => {
      if (eventPayload.data.event === 'CONNECT_SUCCESS') {
        this.events.emit('connectionSuccessful', 'Connection successful')
      } else if (eventPayload.data.event === 'CONNECT_ERROR') {
        this.events.emit('connectionFailed', 'Connection failed')
      } else if (eventPayload.data.event === 'DISCONNECT_SUCCESS') {
        this.events.emit('connectionDisconnected', 'Connection disconnected')
      }
    })
  }

  async sendAsync(data: RequestArguments): Promise<{ jsonrpc: string, result?: any, error?: any, id: number }> {
    const providerType = this.appkit.getProviderType(this.appkit.chainNamespaces[0])

    if (providerType === 'ANNOUNCED') {
      return this.sendAnnouncedRequest(data)
    } else if (providerType === 'WALLET_CONNECT') {
      return this.sendWalletConnectRequest(data)
    } else {
      const err = `Cannot make ${data.method} request. Remix client is not connected to walletconnect client`
      console.error(err)
      return { jsonrpc: '2.0', error: { message: err, code: -32603 }, id: data.id }
    }

  }

  async sendAnnouncedRequest(data: RequestArguments): Promise<{ jsonrpc: string, result?: any, error?: any, id: number }> {
    const address = this.appkit.getAddress()
    const provider = this.appkit.getProvider<Provider>(this.appkit.chainNamespaces[0])

    if (data.method === 'eth_accounts') {
      return {
        jsonrpc: '2.0',
        result: [address],
        id: data.id
      }
    }
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
  }

  async sendWalletConnectRequest(data: RequestArguments): Promise<{ jsonrpc: string, result?: any, error?: any, id: number }> {
    const provider = this.appkit.getProvider<Provider>(this.appkit.chainNamespaces[0])
    const address = this.appkit.getAddress()

    if (data.method === 'eth_accounts') {
      return {
        jsonrpc: '2.0',
        result: [address],
        id: data.id
      }
    }

    try {
      const message = await provider.request(data)
      return { jsonrpc: '2.0', result: message, id: data.id }
    } catch (e) {
      return { jsonrpc: '2.0', error: { message: e.message, code: -32603 }, id: data.id }
    }
  }

  async deactivate() {
    console.log('deactivating walletconnect plugin...')
  }
}

export default new WalletConnect()