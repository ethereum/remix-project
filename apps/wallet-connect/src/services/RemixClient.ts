import { PluginClient } from '@remixproject/plugin'
import { createClient } from '@remixproject/plugin-webview'
import EthereumProvider from '@walletconnect/ethereum-provider'

export class RemixClient extends PluginClient {
    #walletConnectClient: EthereumProvider

    constructor() {
        super()
        createClient(this)
        this.methods = ["sendAsync", "init"]
        this.onload()
    }

    init () {
        console.log('initialzing...')
    }

    set walletConnectClient (value: EthereumProvider) {
        this.#walletConnectClient = value
    }

    sendAsync = (data: { id: string, method: string, params: any[] }) => {
        return new Promise((resolve, reject) => {
            if (this.#walletConnectClient) {
                if (data.method === 'eth_chainId') data.method = 'eth_chainId'
                this.#walletConnectClient.sendAsync(data, (error, message) => {
                    console.log('method: ', data.method)
                    if (error) return reject(error)
                    console.log('message: ', message)
                    resolve({"jsonrpc": "2.0", "result": message, "id": data.id})
                })
            } else {
                console.error('Remix Client is not connected to WalletConnect Client.')
                resolve({"jsonrpc": "2.0", "result": [], "id": data.id})
            }
        })
    }
}
