import React from 'react' // eslint-disable-line
import { AbstractPanel } from './panel'
import ReactDOM from 'react-dom' // eslint-disable-line
import { RemixPanel } from '@remix-ui/side-panel'
import packageJson from '../../../../../package.json'
import { RemixAppManager } from '../../remixAppManager'
import { VerticalIcons } from 'libs/remix-ui/vertical-icons-panel/types/vertical-icons-panel'
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
  sideelement: HTMLDivElement
  verticalIcons: VerticalIcons;
  constructor (appManager: RemixAppManager, verticalIcons: VerticalIcons) {
    super(sidePanel)
    this.appManager = appManager
    this.sideelement = document.createElement('div')
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
    this.verticalIcons.unlinkContent(profile)
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
    console.log('render side panel')
    ReactDOM.render(<RemixPanel plugins={this.plugins}/>, this.sideelement)
  }
}
