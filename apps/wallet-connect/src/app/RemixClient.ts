import {
    PluginClient
  } from '@remixproject/plugin';
  import {
    createClient
  } from '@remixproject/plugin-webview';
  import WalletConnectProvider from "@walletconnect/web3-provider";
  import Torus from "@toruslabs/torus-embed";
  import Authereum from "authereum";
  import Web3Modal, { local } from "web3modal";
  import BurnerConnectProvider from "@burner-wallet/burner-connect-provider";
  import MewConnect from "@myetherwallet/mewconnect-web-client";
  import EventManager from "events"
  
  export const INFURA_ID_KEY = 'INFURA_ID_KEY'
  
  export class RemixClient extends PluginClient {
    provider: any
    web3Modal: Web3Modal
    internalEvents: EventManager
    infuraId: string
    constructor() {
      super();
      createClient(this);
      this.methods = ["sendAsync"];
      this.internalEvents = new EventManager()
      this.infuraId = ''
      this.onload()
    }
  
    /**
     * Connect wallet button pressed.
     */
    async onConnect(infuraId: string) {
      // set infura id
      this.infuraId = infuraId
      try {
        this.web3Modal = new Web3Modal({
          providerOptions: this.getProviderOptions() // required
        })
        this.provider = await this.web3Modal.connect();
      } catch (e) {
        console.error("Could not get a wallet connection", e);
        return;
      }
  
      this.internalEvents.emit('accountsChanged', this.provider.accounts || [])
      this.internalEvents.emit('chainChanged', await this.detectNetwork(this.provider.chainId))
  
      // Subscribe to accounts change
      this.provider.on("accountsChanged", (accounts: Array<string>) => {
        this.internalEvents.emit('accountsChanged', accounts || [])
      });
  
      // Subscribe to chainId change
      this.provider.on("chainChanged", async (chainId: string) => {
        this.internalEvents.emit('chainChanged', await this.detectNetwork(chainId))
      });
  
      // Subscribe to networkId change
      this.provider.on("networkChanged", (networkId: string) => {
        this.internalEvents.emit('networkChanged', networkId)
      });
  
      // Subscribe to networkId change
      this.provider.on("disconnect", () => {
        this.internalEvents.emit('disconnect')
      });
    }
  
    async detectNetwork(id: string) {
  
      let networkName = null;
      let idNumber = parseInt(id)
      // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md
      if (idNumber === 1) networkName = "Main";
      else if (idNumber === 2) networkName = "Morden (deprecated)";
      else if (idNumber === 3) networkName = "Ropsten";
      else if (idNumber === 4) networkName = "Rinkeby";
      else if (idNumber === 5) networkName = "Goerli";
      else if (idNumber === 42) networkName = "Kovan";
      else networkName = "Custom";
      return networkName
    }
  
    getInfuraId () {
      return this.infuraId
    }
  
    /**
     * Disconnect wallet button pressed.
     */
    async onDisconnect() {
      
      // TODO: Which providers have close method?
      if (this.provider && this.provider.close) {
        await this.provider.close();
  
        // If the cached provider is not cleared,
        // WalletConnect will default to the existing session
        // and does not allow to re-scan the QR code with a new wallet.
        // Depending on your use case you may want or want not his behavir.
        await this.web3Modal.clearCachedProvider();
        this.provider = null;
      } else {
        this.internalEvents.emit('disconnect')
      }
      this.web3Modal = null
    }
  
    getProviderOptions() {
      const providerOptions = {
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            infuraId: this.getInfuraId(),
            bridge: 'https://wallet-connect-bridge.dyn.plugin.remixproject.org:8080/'
          }
        },
        torus: {
          package: Torus, // required
          options: {}
        },
        authereum: {
          package: Authereum
        },
        burnerconnect: {
          package: BurnerConnectProvider, // required
          options: {
            defaultNetwork: "100"
          }
        },
        mewconnect: {
          package: MewConnect, // required
          options: {
            infuraId: this.getInfuraId() // required
          }
        }        
      };
      return providerOptions;
    };
  
    sendAsync = (data: any) => {
      return new Promise(async (resolve, reject) => {
        if (this.provider) {
          this.provider.sendAsync(data, (error: any, message: any) => {
            if (error) return reject(error)
            resolve(message)
          })
        } else {
          const infuraKey = window.localStorage.getItem(INFURA_ID_KEY)
          if (infuraKey) {
            await this.onConnect(infuraKey)
            if (this.provider) {
              this.provider.sendAsync(data, (error: any, message: any) => {
                if (error) return reject(error)
                resolve(message)
              })
            } else {
              resolve({"jsonrpc": "2.0", "result": [], "id": data.id})
            }
          } else {
            resolve({"jsonrpc": "2.0", "result": [], "id": data.id})
          }
        }
      })
    }
  }
  