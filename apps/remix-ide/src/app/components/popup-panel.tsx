import React from 'react' // eslint-disable-line
import { AbstractPanel } from './panel'
import { RemixPluginPanel } from '@remix-ui/panel'
import packageJson from '../../../../../package.json'
import { PluginViewWrapper } from '@remix-ui/helper'

const profile = {
  name: 'popupPanel',
  displayName: 'Popup Panel',
  description: 'Remix IDE popup panel',
  version: packageJson.version,
  methods: ['addView', 'removeView', 'showContent']
}

export class PopupPanel extends AbstractPanel {
  element: HTMLDivElement
  dispatch: React.Dispatch<any> = () => {}
  constructor(config) {
    super(profile)
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

  renderComponent() {
    this.dispatch({
      plugins: this.plugins
    })
  }

  render() {
    return (
      <div style={{ height: '200', width: '200', position: 'fixed', bottom: 0, left: 0 }} data-id="popupPanelPluginsContainer">
        <PluginViewWrapper plugin={this} />
      </div>
    )
  }

  updateComponent(state: any) {
    return <RemixPluginPanel header={<></>} plugins={state.plugins} />
  }
}
