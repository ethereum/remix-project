// eslint-disable-next-line no-use-before-define
import React from 'react'
import { AbstractPanel } from './panel'
import { RemixPluginPanel } from '@remix-ui/panel'
import packageJson from '../../../../../package.json'
import { RemixUIPanelHeader } from '@remix-ui/panel'
import { PluginViewWrapper } from '@remix-ui/helper'
// const csjs = require('csjs-inject')

const sidePanel = {
  name: 'sidePanel',
  displayName: 'Side Panel',
  description: 'Remix IDE side panel',
  version: packageJson.version,
  methods: ['addView', 'removeView', 'currentFocus', 'pinView', 'unPinView']
}

export class SidePanel extends AbstractPanel {
  sideelement: any
  loggedState: any
  dispatch: React.Dispatch<any> = () => {}

  constructor() {
    super(sidePanel)
    this.sideelement = document.createElement('section')
    this.sideelement.setAttribute('class', 'panel plugin-manager')
  }

  onActivation() {
    this.renderComponent()
    // Toggle content
    this.on('menuicons', 'toggleContent', (name) => {
      if (!this.plugins[name]) return
      if (this.plugins[name].active) {
        // TODO: Only keep `this.emit` (issue#2210)
        this.emit('toggle', name)
        this.events.emit('toggle', name)
        return
      }
      this.showContent(name)
      // TODO: Only keep `this.emit` (issue#2210)
      this.emit('showing', name)
      this.events.emit('showing', name)
    })
    // Force opening
    this.on('menuicons', 'showContent', (name) => {
      if (!this.plugins[name]) return
      this.showContent(name)
      // TODO: Only keep `this.emit` (issue#2210)
      this.emit('showing', name)
      this.events.emit('showing', name)
    })
  }

  focus(name) {
    this.emit('focusChanged', name)
    super.focus(name)
  }

  removeView(profile) {
    if (this.plugins[profile.name] && this.plugins[profile.name].active) this.call('menuicons', 'select', 'filePanel')
    super.removeView(profile)
    this.renderComponent()
  }

  addView(profile, view) {
    super.addView(profile, view)
    this.call('menuicons', 'linkContent', profile)
    this.renderComponent()
  }

  async pinView (profile) {
    await this.call('pinnedPanel', 'pinView', profile, this.plugins[profile.name].view)
    if (this.plugins[profile.name].active) this.call('menuicons', 'select', 'filePanel')
    super.remove(profile.name)
    this.renderComponent()
  }

  async unPinView (profile, view) {
    const activePlugin = this.currentFocus()

    if (activePlugin === profile.name) throw new Error(`Plugin ${profile.name} already unpinned`)
    this.loggedState = await this.call('pluginStateLogger', 'getPluginState', profile.name)
    super.addView(profile, view)
    this.plugins[activePlugin].active = false
    this.plugins[profile.name].active = true
    this.showContent(profile.name)
  }

  /**
   * Display content and update the header
   * @param {String} name The name of the plugin to display
   */
  async showContent(name) {
    super.showContent(name)
    this.emit('focusChanged', name)
    this.renderComponent()
  }

  setDispatch(dispatch: React.Dispatch<any>) {
    this.dispatch = dispatch
  }

  render() {
    return (
      <section className="panel plugin-manager">
        {' '}
        <PluginViewWrapper plugin={this} />
      </section>
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
