import { PluginClient } from '@remixproject/plugin'
import { createClient } from '@remixproject/plugin-webview'
import { w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { configureChains, createConfig } from 'wagmi'
import { arbitrum, arbitrumGoerli, mainnet, polygon, polygonMumbai, optimism, optimismGoerli, Chain, goerli, sepolia } from 'wagmi/chains'
import { EthereumClient } from '@web3modal/ethereum'
import EventManager from "events"
import { PROJECT_ID } from './constant'

export class RemixClient extends PluginClient {
    wagmiClient
    ethereumClient: EthereumClient
    chains: Chain[]
    currentChain: number
    internalEvents: EventManager

    constructor() {
        super()
        createClient(this)
        this.internalEvents = new EventManager()
        this.methods = ["sendAsync", "init", "deactivate"]
        this.onload()
    }

    onActivation () {
        this.subscribeToEvents()
        this.call('theme', 'currentTheme').then((theme: any) => {
            this.internalEvents.emit('themeChanged', theme.quality.toLowerCase())
        })
    }

    init () {
        console.log('initializing walletconnect plugin...')
    }

    async initClient () {
        try {
            this.chains = [arbitrum, arbitrumGoerli, mainnet, polygon, polygonMumbai, optimism, optimismGoerli, goerli, sepolia]
            const { chains, publicClient } = configureChains(this.chains, [w3mProvider({ projectId: PROJECT_ID })])
            
            this.wagmiClient = createConfig({
              autoConnect: false,
              connectors: w3mConnectors({ projectId: PROJECT_ID, version: 2, chains: this.chains }),
              publicClient
            })
            this.ethereumClient = new EthereumClient(this.wagmiClient, this.chains)
        } catch (e) {
            return console.error("Could not get a wallet connection", e)
        }
    }

    subscribeToEvents () {
        this.wagmiClient.subscribe((event) => {
            if (event.status === 'connected') {
                this.emit('accountsChanged', [event.data.account])
                if (this.currentChain !== event.data.chain.id) {
                    this.currentChain = event.data.chain.id
                    this.emit('chainChanged', event.data.chain.id)
                }
            } else if (event.status === 'disconnected') {
                this.emit('accountsChanged', [])
                this.emit('chainChanged', 0)
                this.currentChain = 0
            }
        })
        this.on('theme', 'themeChanged', (theme: any) => {
            this.internalEvents.emit('themeChanged', theme.quality)
        })
    }

    sendAsync (data: { method: string, params: string, id: string }) {
        return new Promise((resolve, reject) => {
            if (this.wagmiClient) {
                if (this.wagmiClient.data && this.wagmiClient.data.provider && this.wagmiClient.data.provider.sendAsync) {
                    this.wagmiClient.data.provider.sendAsync(data, (error, message) => {
                        if (error) return reject(error)
                        resolve(message)
                    })
                } else if (this.wagmiClient.data && this.wagmiClient.data.provider && this.wagmiClient.data.provider.jsonRpcFetchFunc) {
                    if (data.method === 'net_version' || data.method === 'eth_chainId') {
                        resolve({"jsonrpc": "2.0", "result": this.currentChain, "id": data.id})
                    } else {
                        this.wagmiClient.data.provider.jsonRpcFetchFunc(data.method, data.params).then((message) => {
                            resolve({"jsonrpc": "2.0", "result": message, "id": data.id})
                        }).catch((error) => {
                            reject(error)
                        })
                    }
                } else if (this.wagmiClient.provider) {
                    this.wagmiClient.provider.send(data.method, data.params).then((message) => {
                        resolve({"jsonrpc": "2.0", "result": message, "id": data.id})
                    }).catch((error) => {
                        reject(error)
                    })
                } else if (this.wagmiClient.connector && this.wagmiClient.connector.getProvider) {
                    this.wagmiClient.connector.getProvider().then((provider) => {
                        provider.request({ method: data.method, params: data.params }).then((message) => {
                            const result = message.jsonrpc ? message.result : message
                            resolve({"jsonrpc": "2.0", "result": result, "id": data.id})
                        }).catch((error) => {
                            reject(error)
                        })
                    }).catch((error) => {
                        reject(error)
                    })
                } else {
                    reject(new Error('wallet connect not connected'))
                }
            } else {
                console.error(`Cannot make ${data.method} request. Remix client is not connect to walletconnect client`)
                resolve({"jsonrpc": "2.0", "result": [], "id": data.id})
            }
        })
    }

    async deactivate(){
        console.log('deactivating walletconnect plugin...')
        await this.ethereumClient.disconnect()
    }
}