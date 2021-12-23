import * as packageJson from '../../../../../package.json'
// eslint-disable-next-line no-unused-vars
import { basicLogo } from '../ui/svgLogo'
import ReactDOM from 'react-dom'
import React from 'react' // eslint-disable-line
// eslint-disable-next-line no-unused-vars
import { RemixUiVerticalIconsPanel } from '@remix-ui/vertical-icons-panel'
import Registry from '../state/registry'
// var helper = require('../../lib/helper')
const { Plugin } = require('@remixproject/engine')
const EventEmitter = require('events')

const profile = {
  name: 'menuicons',
  displayName: 'Vertical Icons',
  description: '',
  version: packageJson.version,
  methods: ['select']
}

// TODO merge with side-panel.js. VerticalIcons should not be a plugin
export class VerticalIcons extends Plugin {
  constructor (appManager) {
    super(profile)
    this.events = new EventEmitter()
    this.appManager = appManager
    this.htmlElement = document.createElement('div')
    this.htmlElement.setAttribute('id', 'icon-panel')
    this.icons = {}
    this.iconKind = {}
    this.iconStatus = {}
    this.defaultProfile = profile
    this.targetProfileForChange = {}
    this.targetProfileForRemoval = {}
    this.registry = Registry.getInstance()
    this.keys = ['succeed', 'edited', 'none', 'loading', 'failed']
    this.types = ['error', 'warning', 'success', 'info', '']
  }

  renderComponent () {
    ReactDOM.render(
      <RemixUiVerticalIconsPanel
        verticalIconsPlugin={this}
      />,
      this.htmlElement)
  }

  onActivation () {
    this.renderComponent()
  }

  linkContent (profile) {
    if (!profile.icon) return
    if (!profile.kind) profile.kind = 'none'
    this.targetProfileForChange[profile.name] = profile
    this.listenOnStatus(profile)
    this.renderComponent()
  }

  unlinkContent (profile) {
    this.targetProfileForRemoval = profile
    this.removeIcon(profile)
  }

  listenOnStatus (profile) {

  }

  /**
   * Remove an icon from the map
   * @param {ModuleProfile} profile The profile of the module
   */
  removeIcon ({ name }) {
    if (this.targetProfileForChange[name]) delete this.targetProfileForChange[name]
    setTimeout(() => {
      this.renderComponent()
    }, 150)
  }

  /**
   * Set an icon as active
   * @param {string} name Name of profile of the module to activate
   */
  select (name) {
    // TODO: Only keep `this.emit` (issue#2210)
    this.emit('showContent', name)
    this.events.emit('showContent', name)
  }

  onThemeChanged (themeType) {
    const invert = themeType === 'dark' ? 1 : 0
    const active = this.view.querySelector('.active')
    if (active) {
      const image = active.querySelector('.image')
      image.style.setProperty('filter', `invert(${invert})`)
    }
  }

  /**
   * Toggles the side panel for plugin
   * @param {string} name Name of profile of the module to activate
   */
  toggle (name) {
    // TODO: Only keep `this.emit` (issue#2210)
    this.emit('toggleContent', name)
    this.events.emit('toggleContent', name)
  }

  render () {
    return this.htmlElement
  }
}
