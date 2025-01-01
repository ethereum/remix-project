/* eslint-disable prefer-const */
import React, { useContext, useEffect } from 'react'
import { Plugin } from '@remixproject/engine'
import { CustomRemixApi, desktopConnection, desktopConnextionType } from '@remix-api'
import { Blockchain } from '../../blockchain/blockchain'
import { AppAction, appActionTypes, AppContext, AppModal, ModalTypes } from '@remix-ui/app'
import { ViewPlugin } from '@remixproject/engine-web'
import { PluginViewWrapper } from '@remix-ui/helper'

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
  location: 'hiddenPanel',
}

interface DesktopClientState {
  connected: desktopConnection
}

const DesktopClientUI = (props: DesktopClientState) => {
  const appContext = useContext(AppContext)
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
      <h1>Desktop Client</h1>
      <p>{props.connected}</p>
    </div>
  )
}

export class DesktopClient extends ViewPlugin {
  blockchain: Blockchain
  ws: WebSocket
  dispatch: React.Dispatch<any> = () => {}
  state: DesktopClientState
  appStateDispatch: React.Dispatch<AppAction>

  constructor(blockchain: Blockchain) {
    super(profile)
    this.blockchain = blockchain
    this.state = {
      connected: desktopConnextionType.disconnected,
    }
  }

  onActivation() {
    console.log('DesktopClient activated')
    _paq.push(['trackEvent', 'plugin', 'activated', 'DesktopClient'])

    this.connectToWebSocket()
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

  updateComponent(state: DesktopClientState) {
    return (
      <>
        <DesktopClientUI connected={state.connected} />
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

  setConnectionState = (state: desktopConnection) => {
    this.state.connected = state

    this.renderComponent()
  }

  async handleNetworkStatus(context: any) {
    console.log('networkStatus', context)
    this.ws.send(JSON.stringify({ type: 'contextChanged', payload: null }))
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

  async connectToWebSocket() {
    this.call('menuicons', 'select', 'udapp')
    this.call('manager', 'activatePlugin', 'environmentExplorer').then(() => this.call('tabs' as any, 'focus', 'environmentExplorer'))
    console.log('Connecting to server')
    try {
      this.ws = new WebSocket('ws://localhost:8546')
    } catch (e) {
      console.error('CATCH WebSocket error:', e)
      return
    }
    this.ws.onopen = () => {
      console.log('Connected to server')
      this.emit('connected', true)
      this.setConnectionState(desktopConnextionType.connected)

      this.blockchain.event.register('networkStatus', this.handleNetworkStatus.bind(this))
    }

    this.ws.onmessage = async (event) => {
      const parsed = JSON.parse(event.data)
      console.log('Message from server:', parsed)
      if (parsed && parsed.type === 'error') {
        if (parsed.payload === 'ALREADY_CONNECTED') {
          console.log('ALREADY_CONNECTED')
          this.setConnectionState(desktopConnextionType.alreadyConnected)
          const modalContent: AppModal = {
            id: this.profile.name,
            title: 'Another tab or window is already connected.',
            message: 'Another tab or window is already connected to the desktop application. Please close this tab or window.',	
            modalType: ModalTypes.fixed,
            okLabel: null
          }
          
          this.call('notification', 'modal' as any, modalContent)
          return
        }
      }
      const result = await this.call('web3Provider', 'sendAsync', JSON.parse(event.data))
      if (parsed.method === 'eth_sendTransaction') {
        console.log('Message from server:', parsed)
        console.log('Result:', result)
        this.ws.send(JSON.stringify({ type: 'focus' }))
      }
      this.ws.send(JSON.stringify(result))
      return result
    }

    this.ws.onclose = () => {
      console.log('Disconnected from server')
      this.blockchain.event.unregister('networkStatus', this.handleNetworkStatus.bind(this), null)
      this.ws = null
      /*
      const modalContent: AppModal = {
        id: this.profile.name,
        title: this.profile.displayName,
        message: 'Connection to the desktop client has been lost. Please restart the desktop client.',	
        modalType: ModalTypes.confirm,
        okLabel: 'Reconnect now',
        cancelLabel: 'Cancel',
       
        okFn: () => {
          this.connectToWebSocket()
        },
        cancelFn: () => {
         
        },
        hideFn: () => {
          
        },
      }
      
      this.call('notification', 'modal' as any, modalContent)
      */

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
}
