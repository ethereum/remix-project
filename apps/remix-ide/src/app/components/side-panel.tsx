// eslint-disable-next-line no-use-before-define
import React from 'react'
import { AbstractPanel } from './panel'
import { RemixPluginPanel } from '@remix-ui/panel'
import packageJson from '../../../../../package.json'
import RemixUIPanelHeader from 'libs/remix-ui/panel/src/lib/plugins/panel-header'
import { PluginViewWrapper } from '@remix-ui/helper'
// const csjs = require('csjs-inject')

const sidePanel = {
  name: 'sidePanel',
  displayName: 'Side Panel',
  description: '',
  version: packageJson.version,
  methods: ['addView', 'removeView']
}

export class SidePanel extends AbstractPanel {
  sideelement: any
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
    if (this.plugins[profile.name].active) this.call('menuicons', 'select', 'filePanel')
    super.removeView(profile)
    this.emit('pluginDisabled', profile.name)
    this.call('menuicons', 'unlinkContent', profile)
    this.renderComponent()
  }

  addView(profile, view) {
    super.addView(profile, view)
    this.call('menuicons', 'linkContent', profile)
    this.renderComponent()
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

  setDispatch (dispatch: React.Dispatch<any>) {
    this.dispatch = dispatch
  }

  render() {      
    return (
      <section className='panel plugin-manager'> <PluginViewWrapper plugin={this} /></section>
    );
  }

  updateComponent(state: any) {
    return <RemixPluginPanel header={<RemixUIPanelHeader plugins={state.plugins}></RemixUIPanelHeader>} plugins={state.plugins} />
  }

  renderComponent() {
    this.dispatch({
      plugins: this.plugins
    })
  }
}
