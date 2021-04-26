import {
  PluginClient
} from '@remixproject/plugin';
import {
  createClient
} from '@remixproject/plugin-webview';
import WalletConnectProvider from "@walletconnect/web3-provider";
import Torus from "@toruslabs/torus-embed";
import Authereum from "authereum";
import Web3Modal from "web3modal";
import BurnerConnectProvider from "@burner-wallet/burner-connect-provider";
import MewConnect from "@myetherwallet/mewconnect-web-client";
import EventManager from "events"


export class RemixClient extends PluginClient {
  provider
  constructor() {
    super();
    createClient(this);
    this.methods = ["sendAsync"];
    this.internalEvents = new EventManager()
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
    } catch (e) {
      console.log("Could not get a wallet connection", e);
      return;
    }

    this.internalEvents.emit('accountsChanged', this.provider.accounts || [])
    this.internalEvents.emit('chainChanged', await this.detectNetwork(this.provider.chainId))

    // Subscribe to accounts change
    this.provider.on("accountsChanged", (accounts) => {
      this.internalEvents.emit('accountsChanged', accounts || [])
    });

    // Subscribe to chainId change
    this.provider.on("chainChanged", async (chainId) => {
      this.internalEvents.emit('chainChanged', await this.detectNetwork(chainId))
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

  async detectNetwork(id) {

    let networkName = null;
    id = parseInt(id)
    // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md
    if (id === 1) networkName = "Main";
    else if (id === 2) networkName = "Morden (deprecated)";
    else if (id === 3) networkName = "Ropsten";
    else if (id === 4) networkName = "Rinkeby";
    else if (id === 5) networkName = "Goerli";
    else if (id === 42) networkName = "Kovan";
    else networkName = "Custom";
    return networkName

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

  }

  getProviderOptions() {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: '83d4d660ce3546299cbe048ed95b6fad',
          bridge: 'https://static.225.91.181.135.clients.your-server.de:9090/'
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
          if (error) return reject(error)
          resolve(message)
        })
      } else {
        resolve({"jsonrpc": "2.0", "result": [], "id": data.id})
      }
    })
  }
}