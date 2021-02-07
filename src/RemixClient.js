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
              display: {
		  logo: "data:image/png;base64,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",
		  name: "Remix",
		  description: "The Ethereum IDE"
            },
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
