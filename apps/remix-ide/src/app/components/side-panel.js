import React from 'react' // eslint-disable-line
import { AbstractPanel } from './panel'
import ReactDOM from 'react-dom' // eslint-disable-line
import { RemixUiSidePanel } from '@remix-ui/side-panel' // eslint-disable-line
import { RemixUiAbstractPanel } from '@remix-ui/abstract-panel'
import * as packageJson from '../../../../../package.json'
// const csjs = require('csjs-inject')
const yo = require('yo-yo')

const sidePanel = {
  name: 'sidePanel',
  displayName: 'Side Panel',
  description: '',
  version: packageJson.version,
  methods: ['addView', 'removeView']
}

// TODO merge with vertical-icons.js
export class SidePanel extends AbstractPanel {
  constructor (appManager, verticalIcons) {
    super(sidePanel)
    this.appManager = appManager
    this.header = yo`<header></header>`
    this.sideelement = this.element
    // this.sideelement.setAttribute('class', 'panel')
    this.verticalIcons = verticalIcons

    // Toggle content
    verticalIcons.events.on('toggleContent', (name) => {
      if (!this.contents[name]) return
      if (this.active === name) {
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
      if (!this.contents[name]) return
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
  }

  render () {
    return this.sideelement
  }

  renderComponent () {
    ReactDOM.render(
      <RemixUiSidePanel
        plugin={this}
      />
      ,
      this.sideelement
    )
  }
}
