import { PluginClient } from '@remixproject/plugin';
import { createClient } from '@remixproject/plugin-iframe';
import WalletConnectProvider from "@walletconnect/web3-provider";
import Torus from "@toruslabs/torus-embed";
import Authereum from "authereum";
import Web3Modal from "web3modal";
import BurnerConnectProvider from "@burner-wallet/burner-connect-provider";
import MewConnect from "@myetherwallet/mewconnect-web-client";
import EventManager from "events"


export class RemixClient extends PluginClient {

    constructor() {
        super();
        this.methods = ["sendAsync"];
        this.internalEvents = new EventManager()
        createClient(this);
        this.onload()

        this.web3Modal = new Web3Modal({
          providerOptions: this.getProviderOptions() // required
        });
    }

    async init() {
      const currentTheme = await this.call('theme', 'currentTheme')
      console.log('theme', currentTheme)
      this.web3Modal.updateTheme(currentTheme.quality)

      this.on('theme', 'themeChanged', (theme) => { 
        this.web3Modal.updateTheme(theme.quality)
        console.log('theme', theme)
      })

    }

    /**
     * Connect wallet button pressed.
     */
    async onConnect() {

      console.log("Opening a dialog", this.web3Modal);
      try {
        this.provider = await this.web3Modal.connect();
      } catch(e) {
        console.log("Could not get a wallet connection", e);
        return;
      }

      this.internalEvents.emit('accountsChanged', this.provider.accounts || [])
      this.internalEvents.emit('chainChanged', this.provider.chainId)

      // Subscribe to accounts change
      this.provider.on("accountsChanged", (accounts) => {
        this.internalEvents.emit('accountsChanged', accounts || [])
      });

      // Subscribe to chainId change
      this.provider.on("chainChanged", (chainId) => {
        this.internalEvents.emit('chainChanged', chainId)
      });

      // Subscribe to networkId change
      this.provider.on("networkChanged", (networkId) => {
        this.internalEvents.emit('networkChanged', networkId)
      });

      // Subscribe to networkId change
      this.provider.on("disconnect", () => {
        this.internalEvents.emit('disconnect')
      });
    }

    getProviderOptions () {
        const providerOptions = {
          walletconnect: {
            package: WalletConnectProvider,
            options: {
              infuraId: '83d4d660ce3546299cbe048ed95b6fad'
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
              infuraId: "83d4d660ce3546299cbe048ed95b6fad" // required
            }
          }
          /*,
          fortmatic: {
            package: Fortmatic,
            options: {
              key: process.env.REACT_APP_FORTMATIC_KEY
            }
          },
          authereum: {
            package: Authereum
          },
          portis: {
            package: Portis, // required
            options: {
              id: "PORTIS_ID" // required
            }
          },
          squarelink: {
            package: Squarelink, // required
            options: {
              id: "SQUARELINK_ID" // required
            }
          },
          arkane: {
            package: Arkane, // required
            options: {
              clientId: "ARKANE_CLIENT_ID" // required
            }
          },
          dcentwallet: {
            package: DcentProvider, // required
            options: {
              rpcUrl: "INSERT_RPC_URL" // required
            }
          }*/
        };
        return providerOptions;
    };

    sendAsync = (data) => {
        return new Promise((resolve, reject) => {
            if (this.provider) {
              this.provider.sendAsync(data, (error, message) => {
                // console.log('in plugin', data, error, message)
                if (error) return reject(error)
                resolve(message)
            })
            } else {
              return reject('Provider not loaded')
            }
        })
    }
  }
