import React from 'react' // eslint-disable-line
import { AbstractPanel } from './panel'
import { RemixPluginPanel } from '@remix-ui/panel'
import packageJson from '../../../../../package.json'
import { PluginViewWrapper } from '@remix-ui/helper'
import {EventEmitter} from 'events'

const profile = {
  name: 'popupPanel',
  displayName: 'Popup Panel',
  description: 'Remix IDE popup panel',
  version: packageJson.version,
  events: ['popupPanelShown'],
  methods: ['addView', 'removeView', 'showContent', 'showPopupPanel']
}

export class PopupPanel extends AbstractPanel {
  element: HTMLDivElement
  dispatch: React.Dispatch<any> = () => {}
  showPanel: boolean
  
  constructor(config) {
    super(profile)
    this.event = new EventEmitter()
    this.showPanel = true
  }

  setDispatch(dispatch: React.Dispatch<any>) {
    this.dispatch = dispatch
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
    console.log("hide in popup-panel =", show)
    this.showPanel = show
    this.event.emit('popupPanelShown', show)
    this.renderComponent()
  }

  renderComponent() {
    this.dispatch({
      plugins: this.plugins,
      showPpPanel: this.showPanel
    })
  }

  render() {
    return (
      <div
        className={'px-0 bg-light border-info ' + (!this.showPanel ? 'd-none' : 'd-flex')}
        style={{
          maxHeight: '40rem',
          maxWidth: '25rem',
          width: 'max-content',
          height: '40rem',
          position: 'fixed',
          bottom: '2rem',
          right: '3.5rem',
          zIndex: 2000,
          boxShadow: '3px 3px var(--secondary), -0.1em 0 1.4em var(--secondary)'
        }}
        data-id="popupPanelPluginsContainer"
      >
        {this.showPanel && <PluginViewWrapper plugin={this} />}
      </div>
    )
  }

  updateComponent(state: any) {
    return (
      <div className={!state.showPpPanel ? 'd-none' : 'd-flex'}>
        <RemixPluginPanel
          header={
            <span id='menubarAIChat' className='pb-2 d-flex flex-row'>
              <button
                className='btn fas fa-angle-double-down'
                onClick={async () => {
                  console.log("hide")
                  await this.showPopupPanel(false)
                }}
              >
              </button>
            </span>
          }
          plugins={state.plugins} />
      </div>)
  }
}
