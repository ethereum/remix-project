import { PluginClient } from '@remixproject/plugin'
import { createClient } from '@remixproject/plugin-webview'
import { w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { configureChains, createClient as wagmiCreateClient } from 'wagmi'
import { arbitrum, mainnet, polygon, Chain } from 'wagmi/chains'
import EventManager from 'events'
import { PROJECT_ID } from './constant'

export class RemixClient extends PluginClient {
    internalEvents: EventManager
    wagmiClient
    chains: Chain[]

    constructor() {
        super()
        createClient(this)
        this.methods = ["sendAsync"]
        this.internalEvents = new EventManager()
        this.onload()
    }

    /**
     * Connect wallet button pressed.
     */
    async onConnect() {
        try {
            this.chains = [arbitrum, mainnet, polygon]
          
            const { provider } = configureChains(this.chains, [w3mProvider({ projectId: PROJECT_ID })])
            this.wagmiClient = wagmiCreateClient({
              autoConnect: true,
              connectors: w3mConnectors({ projectId: PROJECT_ID, version: 1, chains: this.chains }),
              provider
            })

            this.internalEvents.emit('accountsChanged', this.wagmiClient.provider.accounts || [])
            this.internalEvents.emit('chainChanged', await this.detectNetwork(this.wagmiClient.provider.chainId))
    
            // Subscribe to accounts change
            this.wagmiClient.provider.on("accountsChanged", (accounts) => {
                this.internalEvents.emit('accountsChanged', accounts || [])
            })
    
            // Subscribe to chainId change
            this.wagmiClient.provider.on("chainChanged", async (chainId) => {
                this.internalEvents.emit('chainChanged', await this.detectNetwork(chainId))
            })
    
            // Subscribe to networkId change
            this.wagmiClient.provider.on("networkChanged", (networkId) => {
                this.internalEvents.emit('networkChanged', networkId)
            })
    
            // Subscribe to networkId change
            this.wagmiClient.provider.on("disconnect", () => {
                this.internalEvents.emit('disconnect')
            })
        } catch (e) {
            return console.error("Could not get a wallet connection", e)
        }
    }

    async detectNetwork(id) {
        let networkName = null

        id = parseInt(id)
        // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md
        if (id === 1) networkName = "Main"
        else if (id === 2) networkName = "Morden (deprecated)"
        else if (id === 3) networkName = "Ropsten"
        else if (id === 4) networkName = "Rinkeby"
        else if (id === 5) networkName = "Goerli"
        else if (id === 42) networkName = "Kovan"
        else networkName = "Custom"
        return networkName
    }

    /**
     * Disconnect wallet button pressed.
     */
    async onDisconnect() {
        // TODO: Which providers have close method?
        if (this.wagmiClient.provider && this.wagmiClient.provider.close) {
            await this.wagmiClient.provider.close()
            this.wagmiClient.provider = null
        } else {
            this.internalEvents.emit('disconnect')
        }
    }

    sendAsync = (data) => {
        return new Promise((resolve, reject) => {
            if (this.wagmiClient.provider) {
                this.wagmiClient.provider.sendAsync(data, (error, message) => {
                    if (error) return reject(error)
                    resolve(message)
                })
            } else {
                resolve({"jsonrpc": "2.0", "result": [], "id": data.id})
            }
        })
    }
}
