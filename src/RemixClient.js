import { PluginClient } from '@remixproject/plugin';
import { createClient } from '@remixproject/plugin-iframe';
import WalletConnectProvider from "@walletconnect/web3-provider";
import Torus from "@toruslabs/torus-embed";
import Authereum from "authereum";
import Web3Modal from "web3modal";
import UniLogin from "@unilogin/provider";
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
    }

    async initModal () {
      try {
        const currentTheme = await this.call('theme', 'currentTheme')
        console.log('theme', currentTheme)
        this.web3Modal.updateTheme(currentTheme.quality)
        
        this.on('theme', 'themeChanged', (theme) => { 
          this.web3Modal.updateTheme(theme.quality)
          console.log('theme', theme)
        })

        this.web3Modal.on('connect', (provider) => {
          this.provider = provider
          this.internalEvents.emit('accountsChanged', provider.accounts || [])
          this.internalEvents.emit('chainChanged', provider.chainId)
          this.provider.on("accountsChanged", (accounts) => {
            this.internalEvents.emit('accountsChanged', accounts || [])
          });
          
          this.provider.on("chainChanged", (chain) => {
            this.internalEvents.emit('chainChanged', chain)
          });
        })
      } catch (e) {
        console.log(e)
      }
    }

    async openModal () {
      if (!this.web3Modal) {
        this.web3Modal = new Web3Modal({
          providerOptions: this.getProviderOptions() // required
        });
        await this.initModal()
      }
      if (!this.web3Modal.show) {
        this.web3Modal.toggleModal()
      }
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
          unilogin: {
            package: UniLogin // required
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
