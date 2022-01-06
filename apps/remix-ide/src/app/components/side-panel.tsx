// eslint-disable-next-line no-use-before-define
import React from 'react'
import ReactDOM from 'react-dom'
import { AbstractPanel } from './panel'
import { RemixPluginPanel } from '@remix-ui/panel'
import packageJson from '../../../../../package.json'
import { RemixAppManager } from '../../remixAppManager'
import { VerticalIcons } from 'libs/remix-ui/vertical-icons-panel/types/vertical-icons-panel'
import RemixUIPanelHeader from 'libs/remix-ui/panel/src/lib/plugins/panel-header'
// const csjs = require('csjs-inject')

const sidePanel = {
  name: 'sidePanel',
  displayName: 'Side Panel',
  description: '',
  version: packageJson.version,
  methods: ['addView', 'removeView']
}

// TODO merge with vertical-icons.js
export class SidePanel extends AbstractPanel {
  appManager: RemixAppManager
  sideelement: any
  verticalIcons: VerticalIcons;
  constructor (appManager: RemixAppManager, verticalIcons: VerticalIcons) {
    super(sidePanel)
    this.appManager = appManager
    this.sideelement = document.createElement('section')
    this.sideelement.setAttribute('class', 'panel plugin-manager')
    this.verticalIcons = verticalIcons

    // Toggle content
    verticalIcons.events.on('toggleContent', (name) => {
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
    verticalIcons.events.on('showContent', (name) => {
      if (!this.plugins[name]) return
      this.showContent(name)
      // TODO: Only keep `this.emit` (issue#2210)
      this.emit('showing', name)
      this.events.emit('showing', name)
    })
  }

  onActivation () {
    this.renderComponent()
  }

  focus (name) {
    this.emit('focusChanged', name)
    super.focus(name)
  }

  removeView (profile) {
    super.removeView(profile)
    this.emit('pluginDisabled', profile.name)
    this.call('menuicons', 'unlinkContent', profile)
    this.renderComponent()
  }

  addView (profile, view) {
    super.addView(profile, view)
    this.verticalIcons.linkContent(profile)
    this.renderComponent()
  }

  /**
   * Display content and update the header
   * @param {String} name The name of the plugin to display
   */
  async showContent (name) {
    super.showContent(name)
    this.emit('focusChanged', name)
    this.renderComponent()
  }

  render () {
    return this.sideelement
  }

  renderComponent () {
    ReactDOM.render(<RemixPluginPanel header={<RemixUIPanelHeader plugins={this.plugins}></RemixUIPanelHeader>} plugins={this.plugins}/>, this.sideelement)
  }
}
