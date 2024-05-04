// eslint-disable-next-line no-use-before-define
import React from 'react'
import { AbstractPanel } from './panel'
import { PluginRecord, RemixPluginPanel } from '@remix-ui/panel'
import packageJson from '../../../../../package.json'
import { RemixUIPanelHeader } from '@remix-ui/panel'
import { PluginViewWrapper } from '@remix-ui/helper'

const pinnedPanel = {
  name: 'pinnedPanel',
  displayName: 'Pinned Panel',
  description: 'Remix IDE pinned panel',
  version: packageJson.version,
  methods: ['addView', 'removeView', 'currentFocus', 'pinView', 'unPinView']
}

export class PinnedPanel extends AbstractPanel {
  sideelement: any
  dispatch: React.Dispatch<any> = () => {}
  loggedState: any

  constructor() {
    super(pinnedPanel)
  }

  onActivation() {
    this.renderComponent()
  }

  async pinView (profile, view) {
    const activePlugin = this.currentFocus()

    if (activePlugin === profile.name) throw new Error(`Plugin ${profile.name} already pinned`) 
    if (activePlugin) this.remove(activePlugin)
    this.loggedState = await this.call('pluginStateLogger', 'getPluginState', profile.name)
    this.addView(profile, view)
    this.plugins[profile.name].pinned = true
    this.plugins[profile.name].active = true
    this.renderComponent()
    this.events.emit('pinnedPlugin', profile.name)
  }

  unPinView (profile) {
    const activePlugin = this.currentFocus()

    if (activePlugin !== profile.name) throw new Error(`Plugin ${profile.name} already pinned`)
    this.call('sidePanel', 'unPinView', profile, this.plugins[profile.name].view)
    super.remove(profile.name)
    this.renderComponent()
    this.events.emit('unPinnedPlugin', profile.name)
  }

  setDispatch (dispatch: React.Dispatch<any>) {
    this.dispatch = dispatch
  }

  render() {
    return (
      <section className='panel pinned-panel'> <PluginViewWrapper plugin={this} /></section>
    )
  }

  updateComponent(state: any) {
    return <RemixPluginPanel header={<RemixUIPanelHeader plugins={state.plugins} pinView={this.pinView.bind(this)} unPinView={this.unPinView.bind(this)}></RemixUIPanelHeader>} plugins={state.plugins} pluginState={state.pluginState} />
  }

  renderComponent() {
    this.dispatch({
      plugins: this.plugins,
      pluginState: this.loggedState
    })
  }
}
