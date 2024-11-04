import React from 'react' // eslint-disable-line
import { AbstractPanel } from './panel'
import { PluginRecord, RemixPluginPanel } from '@remix-ui/panel'
import packageJson from '../../../../../package.json'
import { PluginViewWrapper } from '@remix-ui/helper'
import { EventEmitter } from 'events'
import { AppState } from 'libs/remix-ui/app/src/lib/remix-app/interface'
import { AppAction, appActionTypes } from '@remix-ui/app'

const profile = {
  name: 'popupPanel',
  displayName: 'Popup Panel',
  description: 'Remix IDE popup panel',
  version: packageJson.version,
  events: [],
  methods: ['addView', 'removeView', 'showContent', 'showPopupPanel']
}
type popupPanelState = {
  plugins: Record<string, PluginRecord>
}

export class PopupPanel extends AbstractPanel {
  element: HTMLDivElement
  dispatch: React.Dispatch<any> = () => { }
  appStateDispatch: React.Dispatch<AppAction> = () => { }

  constructor(config) {
    super(profile)
    this.event = new EventEmitter()
  }

  setDispatch(dispatch: React.Dispatch<any>) {
    this.dispatch = dispatch
  }

  setAppStateDispatch(appStateDispatch: React.Dispatch<AppAction>) {
    this.appStateDispatch = appStateDispatch
  }

  onActivation() {
    this.renderComponent()
  }

  focus(name) {
    this.emit('focusChanged', name)
    super.focus(name)
    this.renderComponent()
  }

  addView(profile, view) {
    super.addView(profile, view)
    this.renderComponent()
    this.showContent(profile.name) // should be handled by some click
  }

  removeView(profile) {
    super.removeView(profile)
    this.renderComponent()
  }

  async showContent(name) {
    super.showContent(name)
    this.renderComponent()
  }

  async showPopupPanel(show) {

    this.appStateDispatch({
      type: appActionTypes.setShowPopupPanel,
      payload: show
    })
    this.renderComponent()
  }

  renderComponent() {
    this.dispatch({
      plugins: this.plugins
    })
  }

  render() {
    return (
      <PluginViewWrapper plugin={this} />
    )
  }

  updateComponent(state: popupPanelState & Partial<AppState>) {
    return (
      <div
        className={'px-0 bg-light border-info ' + (!state.showPopupPanel ? 'd-none' : 'd-flex')}
        style={{
          maxHeight: '40rem',
          maxWidth: '25rem',
          width: 'max-content',
          height: '40rem',
          position: 'fixed',
          bottom: '2rem',
          right: '3.5rem',
          zIndex: 200,
          boxShadow: '3px 3px var(--secondary), -0.1em 0 1.4em var(--secondary)'
        }}
        data-id="popupPanelPluginsContainer"
      >
        <div className='d-flex flex-column'>
          <RemixPluginPanel
            header={
              <span id='popupPanelToggle' className='pb-2 d-flex flex-row'>
                <button
                  className='btn fas fa-angle-double-down'
                  onClick={async () => {
                    await this.showPopupPanel(false)
                  }}
                >
                </button>
              </span>
            }
            plugins={state.plugins} />
        </div>
      </div>
    )
  }
}
