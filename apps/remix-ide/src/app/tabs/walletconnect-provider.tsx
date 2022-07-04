import * as packageJson from '../../../../../package.json'
import { ViewPlugin } from '@remixproject/engine-web'
import React from 'react' // eslint-disable-line
import { RemixUiWalletConnect, INFURA_ID_KEY } from '@remix-ui/wallet-connect'
import WalletConnectProvider from "@walletconnect/web3-provider";
import Torus from "@toruslabs/torus-embed";
import Web3Modal, { local } from "web3modal";
import BurnerConnectProvider from "@burner-wallet/burner-connect-provider";
import MewConnect from "@myetherwallet/mewconnect-web-client";
import EventManager from "events"

const profile = {
  name: 'walletconnect',
  displayName: 'Wallet Connect',
  kind: 'provider',
  description: 'Wallet Connect',
  methods: ['sendAsync'],
  location: 'mainPanel',
  version: packageJson.version
}

export class WalletConnectProviderPlugin extends ViewPlugin {
  provider: any
  infuraId: string
  internalEvents: EventManager
  web3Modal: Web3Modal | null
  constructor() {
    super(profile);
    this.methods = ["sendAsync"];
    this.internalEvents = new EventManager()
    this.infuraId = ''
  }

  render () {
    return (
      <RemixUiWalletConnect {...this} />
    );
  }

  /**
   * Connect wallet button pressed.
   */
  async onConnect(infuraId) {
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
      if (this.web3Modal) await this.web3Modal.clearCachedProvider();
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
    return new Promise(async (resolve, reject) => {
      if (this.provider) {
        this.provider.sendAsync(data, (error, message) => {
          if (error) return reject(error)
          resolve(message)
        })
      } else {
        const infuraKey = window.localStorage.getItem(INFURA_ID_KEY)
        if (infuraKey) {
          await this.onConnect(infuraKey)
          if (this.provider) {
            this.provider.sendAsync(data, (error, message) => {
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