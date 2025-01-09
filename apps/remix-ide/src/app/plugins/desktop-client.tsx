/* eslint-disable prefer-const */
import React from 'react';
import { desktopConnection, desktopConnextionType } from '@remix-api';
import { Blockchain, Provider } from '../../blockchain/blockchain';
import { AppAction, AppModal, ModalTypes } from '@remix-ui/app';
import { ViewPlugin } from '@remixproject/engine-web';
import { PluginViewWrapper } from '@remix-ui/helper';
import { QueryParams } from '@remix-project/remix-lib';
import cbor from 'cbor';
import isElectron from 'is-electron';
import DesktopClientUI from './DesktopClientUI'; // Import the UI component

const _paq = (window._paq = window._paq || []);

const profile = {
  name: 'desktopClient',
  displayName: 'desktopClient',
  description: '',
  methods: ['init', 'sendAsync'],
  events: ['connected'],
  maintainedBy: 'Remix',
  location: 'mainPanel',
};

interface DesktopClientState {
  connected: desktopConnection;
  providers: Provider[];
  disableconnect: boolean;
  currentContext: string;
}

export class DesktopClient extends ViewPlugin {
  blockchain: Blockchain;
  ws: WebSocket;
  dispatch: React.Dispatch<any> = () => {};
  state: DesktopClientState;
  appStateDispatch: React.Dispatch<AppAction>;
  queryParams: QueryParams;
  params: any;

  constructor(blockchain: Blockchain) {
    super(profile);
    this.blockchain = blockchain;
    this.state = {
      connected: desktopConnextionType.disconnected,
      providers: [],
      disableconnect: false,
      currentContext: '',
    };
    this.queryParams = new QueryParams();

    this.params = this.queryParams.get();
    console.log('DesktopClient params', this.params);
  }

  onActivation() {
    console.log('DesktopClient activated');
    _paq.push(['trackEvent', 'plugin', 'activated', 'DesktopClient']);

    this.connectToWebSocket();

    const updateProviders = async () => {
      const providersObj: { [key: string]: Provider } = await this.call('blockchain', 'getAllProviders');
      const providers: Provider[] = Object.values(providersObj);
      this.state.providers = providers;
      this.renderComponent();
      console.log('providers', providers);
    };

    this.on('udapp', 'providerAdded', updateProviders);
    window.addEventListener('eip6963:announceProvider', (event: CustomEvent) => updateProviders());
    if (!isElectron()) window.dispatchEvent(new Event('eip6963:requestProvider'));
    this.call('layout', 'minimizeSidePanel');
    this.blockchain.event.register('networkStatus', this.handleNetworkStatus.bind(this));
    this.blockchain.event.register('contextChanged', this.handleContextChanged.bind(this));
  }

  handleContextChanged(context: any) {
    console.log('contextChanged handled', context);
  }

  onDeactivation() {}

  setDispatch(dispatch: React.Dispatch<any>): void {
    this.dispatch = dispatch;
    this.renderComponent();
  }

  setAppStateDispatch(appStateDispatch: React.Dispatch<AppAction>) {
    console.log('setAppStateDispatch', appStateDispatch);
    this.appStateDispatch = appStateDispatch;
  }

  renderComponent() {
    this.dispatch({
      ...this.state,
    });
  }

  async handleProviderConnect(provider: Provider) {
    console.log('handleProviderConnect', provider);
    this.state.disableconnect = true;
    this.renderComponent();
    this.blockchain.changeExecutionContext({ context: provider.name, fork: '' }, null, null, () => {
      console.log('setFinalContext');
      this.state.disableconnect = false;
      this.renderComponent();
    });
  }

  setConnectionState = (state: desktopConnection) => {
    this.state.connected = state;

    this.renderComponent();
  };

  async handleNetworkStatus(context: any) {
    console.log('networkStatus handled', context);
    this.state.currentContext = this.blockchain.executionContext.executionContext;
    this.renderComponent();
    this.debouncedSendContextChanged();
  }

  // Debounced function to send context changed event
  debouncedSendContextChanged = debounce(() => {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('Sending context changed event to server');
      this.ws.send(stringifyWithBigInt({ type: 'contextChanged', payload: null }));
    }
  }, 500); // Adjust the debounce wait time as needed

  async checkConnection() {
    console.log('Checking connection', this.ws);
    if (this.ws && this.ws.readyState === this.ws.OPEN) {
      console.log('OK Connected to server');
    } else {
      console.log('NOT Connected to server');
      this.connectToWebSocket();
    }
  }

  async openDesktopApp() {
    console.log('openDesktopApp');
    this.ws.send(stringifyWithBigInt({ type: 'focus', payload: null }));
  }

  updateComponent(state: DesktopClientState) {
    return (
      <>
        <DesktopClientUI
          openDesktopApp={this.openDesktopApp.bind(this)}
          currentContext={state.currentContext}
          providers={state.providers}
          disableconnect={state.disableconnect}
          connected={state.connected}
          onConnect={this.handleProviderConnect.bind(this)}
        />
      </>
    );
  }

  render() {
    return (
      <div className="bg-dark" id="desktopClient">
        <PluginViewWrapper useAppContext={true} plugin={this} />
      </div>
    );
  }

  async connectToWebSocket() {
    console.log('Connecting to server');
    try {
      this.ws = new WebSocket(`ws://localhost:${this.params.desktopClientPort}`);
      this.ws.binaryType = 'arraybuffer';
    } catch (e) {
      console.error('CATCH WebSocket error:', e);
      return;
    }
    this.ws.onopen = () => {
      console.log('Connected to server');
      this.emit('connected', true);
      this.setConnectionState(desktopConnextionType.connected);
      this.call('terminal', 'log', {
        value: 'Connected to the desktop application.',
        type: 'info',
      });
      //this.blockchain.event.register('contextChanged', this.handleNetworkStatus.bind(this));
    };

    this.ws.onmessage = async (event) => {
      const parsed = JSON.parse(event.data);
      console.log('Message from server:', parsed.method);
      if (parsed && parsed.type === 'error') {
        if (parsed.payload === 'ALREADY_CONNECTED') {
          console.log('ALREADY_CONNECTED');
          this.setConnectionState(desktopConnextionType.alreadyConnected);
          const modalContent: AppModal = {
            id: this.profile.name,
            title: 'Another tab or window is already connected.',
            message: 'Another tab or window is already connected to the desktop application. Please close this tab or window.',
            modalType: ModalTypes.fixed,
            okLabel: null,
          };

          this.call('notification', 'modal' as any, modalContent);
          return;
        }
      }
      if (parsed.method === 'eth_sendTransaction' || parsed.method === 'eth_getTransactionReceipt') {
        this.call('terminal', 'log', {
          value: 'Transaction from desktop client: ' + event.data,
          type: 'info',
        });
      }
      if (parsed.method === 'eth_sendTransaction' || parsed.method === 'eth_getTransactionReceipt') {
        console.log('Sending message to web3:', parsed);
      }

      let receipt;
      if (parsed.method === 'eth_getTransactionReceipt') {
        let receipt = await this.tryTillReceiptAvailable(parsed.params[0]);
        console.log('Receipt:', receipt);
        console.log('Sending receipt back to server', parsed.params[0], receipt);
        this.ws.send(
          stringifyWithBigInt({
            jsonrpc: '2.0',
            result: receipt,
            id: parsed.id,
          })
        );
      } else {
        const provider = this.blockchain.web3().currentProvider;
        let result = await provider.sendAsync(parsed);
        if (parsed.method === 'eth_sendTransaction') {
          console.log('Sending result back to server', result);
        }
        this.ws.send(stringifyWithBigInt(result));
      }
    };

    this.ws.onclose = () => {
      console.log('Disconnected from server');
      this.ws = null;

      this.emit('connected', false);
      if (this.state.connected !== desktopConnextionType.alreadyConnected) {
        this.setConnectionState(desktopConnextionType.disconnected);

        setTimeout(() => {
          this.connectToWebSocket();
        }, 5000);
      }
    };
  }

  async init() {}

  async sendAsync(payload: any) {}

  async tryTillReceiptAvailable(txhash) {
    try {
      const receipt = await this.call('blockchain', 'getTransactionReceipt', txhash);
      if (receipt) return receipt;
    } catch (e) {
      // do nothing
    }
    await this.pause();
    return await this.tryTillReceiptAvailable(txhash);
  }
  async pause() {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, 500);
    });
  }
}

function stringifyWithBigInt(obj) {
  return cbor.encode(obj);
  console.log('stringifyWithBigInt', obj);
  const r = JSON.stringify(obj, (key, value) => (typeof value === 'bigint' ? value.toString() : value));
  console.log('stringifyWithBigInt', r);
  return r;
}

function debounce(func: (...args: any[]) => void, wait: number) {
  let timeout: NodeJS.Timeout;
  return function (...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}