import { PluginClient } from '@remixproject/plugin'
import { createClient } from '@remixproject/plugin-webview'
import { w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { createConfig, configureChains } from 'wagmi'
import { arbitrum, arbitrumGoerli, mainnet, polygon, polygonMumbai, optimism, optimismGoerli, Chain, goerli, sepolia } from 'viem/chains'
import { EthereumClient } from '@web3modal/ethereum'
import EventManager from "events"
import { PROJECT_ID } from './constant'

export class WalletConnectRemixClient extends PluginClient {
    wagmiConfig
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
            const { publicClient } = configureChains(this.chains, [w3mProvider({ projectId: PROJECT_ID })])

            this.wagmiConfig = createConfig({
                autoConnect: false,
                connectors: w3mConnectors({ projectId: PROJECT_ID, chains: this.chains }),
                publicClient
            })
            this.ethereumClient = new EthereumClient(this.wagmiConfig, this.chains)
        } catch (e) {
            return console.error("Could not get a wallet connection", e)
        }
    }

    subscribeToEvents () {
        this.wagmiConfig.subscribe((event) => {
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
            if (this.wagmiConfig) {
                this.wagmiConfig.publicClient.request(data).then((message) => {
                    resolve({"jsonrpc": "2.0", "result": message, "id": data.id})
                }).catch((error) => {
                    reject(error)
                })
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