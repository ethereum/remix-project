/* eslint-disable prefer-const */
import React, { useContext, useEffect } from 'react'
import { Plugin } from '@remixproject/engine'
import { CustomRemixApi, desktopConnection, desktopConnextionType } from '@remix-api'
import { Blockchain, Provider } from '../../blockchain/blockchain'
import { AppAction, appActionTypes, AppContext, AppModal, ModalTypes } from '@remix-ui/app'
import { ViewPlugin } from '@remixproject/engine-web'
import { PluginViewWrapper } from '@remix-ui/helper'
import { QueryParams } from '@remix-project/remix-lib'
import cbor from 'cbor'
import isElectron from 'is-electron'
import { providerLogos } from '../udapp/run-tab'
import { DesktopStatus } from '@remix-ui/statusbar'

const _paq = (window._paq = window._paq || [])

/* TODO: Metamask
- open metamask by default
- handle canceled transactions
- send network updates : contextChanged
- send account updates
- socket disconnect
*/

const profile = {
  name: 'desktopClient',
  displayName: 'desktopClient',
  description: '',
  methods: ['init', 'sendAsync'],
  events: ['connected'],
  maintainedBy: 'Remix',
  location: 'mainPanel',
}

interface DesktopClientState {
  connected: desktopConnection
  providers: Provider[]
  disableconnect: boolean,
  currentContext: string,
}

const DesktopClientUI = (props: DesktopClientState & { openDesktopApp: () => {}} & { onConnect: (providerName: Provider) => void }) => {
  const appContext = useContext(AppContext)
  const { connected, providers, onConnect, disableconnect, currentContext } = props

  useEffect(() => {
    console.log('connected', props.connected)
    appContext.appStateDispatch({
      type: appActionTypes.setConnectedToDesktop,
      payload: props.connected,
    })
    appContext.appStateDispatch({
      type: appActionTypes.setShowPopupPanel,
      payload: false,
    })
  }, [props.connected])

  return (
    <div>
      <div className="d-flex p-4 bg-light flex-column">
        <h3>MetaMask for Desktop</h3>
        {connected === desktopConnextionType.connected && (
            <div className="d-flex align-items-center mt-3">
            <button className="btn btn-primary" onClick={props.openDesktopApp}>
              Switch to Desktop App
            </button>
            </div>
        )}
      </div>
      
      <div>
        <div className="row">
            {providers && providers.length > 0 ? (
            providers
              .filter((provider) => provider.isInjected)
              .map((provider, index) => (
              <div key={index} className="col-md-4 mb-4">
                <div className="provider-item card h-100">
                <div className="card-body d-flex flex-column align-items-center">
                  <div className="d-flex mb-2">
                  {providerLogos[provider.name] &&
                    providerLogos[provider.name].map((logo, index) => (
                    <img
                      key={index}
                      src={logo}
                      style={{ width: '2rem', height: '2rem', marginRight: '0.5rem' }}
                    />
                    ))}
                  </div>
                  <h5 className="card-title">{provider.displayName}</h5>
                  <p className="card-text">{provider.description}</p>
                  <button
                  disabled={disableconnect || currentContext === provider.name}
                  className="btn btn-primary mt-auto"
                  onClick={() => onConnect(provider)}
                  >
                  {disableconnect
                    ? 'please wait  ...'
                    : currentContext === provider.name
                    ? 'Connected'
                    : 'Connect'}
                  </button>
                </div>
                </div>
              </div>
              ))
            ) : (
            <div className="col-12">
              <div className="alert alert-warning" role="alert">
              No injected providers found. Please install MetaMask or another browser wallet.
              </div>
            </div>
            )}
        </div>
      </div>
    </div>
  )
}

export class DesktopClient extends ViewPlugin {
  blockchain: Blockchain
  ws: WebSocket
  dispatch: React.Dispatch<any> = () => {}
  state: DesktopClientState
  appStateDispatch: React.Dispatch<AppAction>
  queryParams: QueryParams
  params: any

  constructor(blockchain: Blockchain) {
    super(profile)
    this.blockchain = blockchain
    this.state = {
      connected: desktopConnextionType.disconnected,
      providers: [],
      disableconnect: false,
      currentContext: '',
    }
    this.queryParams = new QueryParams()

    this.params = this.queryParams.get()
    console.log('DesktopClient params', this.params)
  }

  onActivation() {
    console.log('DesktopClient activated')
    _paq.push(['trackEvent', 'plugin', 'activated', 'DesktopClient'])

    this.connectToWebSocket()

    const updateProviders = async () => {
      const providersObj: { [key: string]: Provider } = await this.call('blockchain', 'getAllProviders')
      const providers: Provider[] = Object.values(providersObj)
      this.state.providers = providers
      this.renderComponent()
      console.log('providers', providers)
    }

    this.on('udapp', 'providerAdded', updateProviders)
    window.addEventListener('eip6963:announceProvider', (event: CustomEvent) => updateProviders())
    if (!isElectron()) window.dispatchEvent(new Event('eip6963:requestProvider'))
    this.call('layout', 'minimizeSidePanel')
  }

  onDeactivation() {}

  setDispatch(dispatch: React.Dispatch<any>): void {
    this.dispatch = dispatch
    this.renderComponent()
  }

  setAppStateDispatch(appStateDispatch: React.Dispatch<AppAction>) {
    console.log('setAppStateDispatch', appStateDispatch)
    this.appStateDispatch = appStateDispatch
  }

  renderComponent() {
    this.dispatch({
      ...this.state,
    })
  }

  async handleProviderConnect(provider: Provider) {
    console.log('handleProviderConnect', provider)
    this.state.disableconnect = true
    this.renderComponent()
    this.blockchain.changeExecutionContext({ context: provider.name, fork: '' }, null, null, () => {
      console.log('setFinalContext')
      this.state.disableconnect = false
      this.renderComponent()
    })
  }

  setConnectionState = (state: desktopConnection) => {
    this.state.connected = state

    this.renderComponent()
  }

  async handleNetworkStatus(context: any) {
    console.log('networkStatus', context)
    this.state.currentContext = context
    this.renderComponent()
    this.ws.send(stringifyWithBigInt({ type: 'contextChanged', payload: null }))
  }

  async checkConnection() {
    console.log('Checking connection', this.ws)
    if (this.ws && this.ws.readyState === this.ws.OPEN) {
      console.log('OK Connected to server')
    } else {
      console.log('NOT Connected to server')
      this.connectToWebSocket()
    }
  }

  async openDesktopApp() {
    console.log('openDesktopApp')
    this.ws.send(stringifyWithBigInt({ type: 'focus', payload: null }))
  }

  updateComponent(state: DesktopClientState) {
    return (
      <>
        <DesktopClientUI openDesktopApp={this.openDesktopApp.bind(this)} currentContext={state.currentContext} providers={state.providers} disableconnect={state.disableconnect} connected={state.connected} onConnect={this.handleProviderConnect.bind(this)} />
      </>
    )
  }

  render() {
    return (
      <div className="bg-dark" id="desktopClient">
        <PluginViewWrapper useAppContext={true} plugin={this} />
      </div>
    )
  }

  async connectToWebSocket() {
    //this.call('menuicons', 'select', 'udapp')
    //this.call('manager', 'activatePlugin', 'environmentExplorer').then(() => this.call('tabs' as any, 'focus', 'environmentExplorer'))
    console.log('Connecting to server')
    try {
      this.ws = new WebSocket(`ws://localhost:${this.params.desktopClientPort}`)
      this.ws.binaryType = 'arraybuffer'
    } catch (e) {
      console.error('CATCH WebSocket error:', e)
      return
    }
    this.ws.onopen = () => {
      console.log('Connected to server')
      this.emit('connected', true)
      this.setConnectionState(desktopConnextionType.connected)
      this.call('terminal', 'log', {
        value: 'Connected to the desktop application.',
        type: 'info',
      })
      this.blockchain.event.register('contextChanged', this.handleNetworkStatus.bind(this))
    }

    this.ws.onmessage = async (event) => {
      const parsed = JSON.parse(event.data)
      console.log('Message from server:', parsed.method)
      if (parsed && parsed.type === 'error') {
        if (parsed.payload === 'ALREADY_CONNECTED') {
          console.log('ALREADY_CONNECTED')
          this.setConnectionState(desktopConnextionType.alreadyConnected)
          const modalContent: AppModal = {
            id: this.profile.name,
            title: 'Another tab or window is already connected.',
            message: 'Another tab or window is already connected to the desktop application. Please close this tab or window.',
            modalType: ModalTypes.fixed,
            okLabel: null,
          }

          this.call('notification', 'modal' as any, modalContent)
          return
        }
      }
      if (parsed.method === 'eth_sendTransaction' || parsed.method === 'eth_getTransactionReceipt') {
        this.call('terminal', 'log', {
          value: 'Transaction from desktop client: ' + event.data,
          type: 'info',
        })
      }
      if (parsed.method === 'eth_sendTransaction' || parsed.method === 'eth_getTransactionReceipt') {
        console.log('Sending message to web3:', parsed)
      }

      let receipt
      //const result = await this.call('web3Provider', 'sendAsync', parsed)
      if (parsed.method === 'eth_getTransactionReceipt') {
        let receipt = await this.tryTillReceiptAvailable(parsed.params[0])
        console.log('Receipt:', receipt)
        console.log('Sending receipt back to server', parsed.params[0], receipt)
        this.ws.send(
          stringifyWithBigInt({
            jsonrpc: '2.0',
            result: receipt,
            id: parsed.id,
          })
        )
      } else {
        const provider = this.blockchain.web3().currentProvider
        //console.log('provider', provider)
        let result = await provider.sendAsync(parsed)
        if (parsed.method === 'eth_sendTransaction') {
          //console.log('Result:', result)
          console.log('Sending result back to server', result)
        }
        this.ws.send(stringifyWithBigInt(result))
      }

      /*
      if (parsed.method === 'eth_sendTransaction' || parsed.method === 'eth_getTransactionReceipt') {
        console.log('Message from server:', parsed)
        console.log('Result:', result)
        this.call('terminal', 'log', {
          value: 'Result: ' + JSON.stringify(result),
          type: 'info',
        })
      }
      return result
      */
    }

    this.ws.onclose = () => {
      console.log('Disconnected from server')
      this.blockchain.event.unregister('networkStatus', this.handleNetworkStatus.bind(this), null)
      this.ws = null

      this.emit('connected', false)
      if (this.state.connected !== desktopConnextionType.alreadyConnected) {
        this.setConnectionState(desktopConnextionType.disconnected)

        setTimeout(() => {
          this.connectToWebSocket()
        }, 5000)
      }
    }

    //this.ws.onerror = (error) => {
    // console.error('WebSocket error:', error)
    //}
  }

  async init() {}

  async sendAsync(payload: any) {}

  async tryTillReceiptAvailable(txhash) {
    try {
      //console.log('tryTillReceiptAvailable', txhash)
      const receipt = await this.call('blockchain', 'getTransactionReceipt', txhash)
      if (receipt) return receipt
    } catch (e) {
      // do nothing
    }
    await this.pause()
    return await this.tryTillReceiptAvailable(txhash)
  }
  async pause() {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, 500)
    })
  }
}

function stringifyWithBigInt(obj) {
  return cbor.encode(obj)
  console.log('stringifyWithBigInt', obj)
  const r = JSON.stringify(obj, (key, value) => (typeof value === 'bigint' ? value.toString() : value))
  console.log('stringifyWithBigInt', r)
  return r
}
