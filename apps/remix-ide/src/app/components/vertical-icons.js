import * as packageJson from '../../../../../package.json'
// eslint-disable-next-line no-unused-vars
import { basicLogo } from '../ui/svgLogo'
import ReactDOM from 'react-dom'
import React from 'react' // eslint-disable-line
// eslint-disable-next-line no-unused-vars
import { RemixUiVerticalIconsPanel } from '@remix-ui/vertical-icons-panel'
var helper = require('../../lib/helper')
const globalRegistry = require('../../global/registry')
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
    this.registry = globalRegistry
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
    // the list of supported keys. 'none' will remove the status
    // const keys = ['edited', 'succeed', 'none', 'loading', 'failed']
    // const types = ['error', 'warning', 'success', 'info', '']
    // const fn = (status) => {
    //   if (!this.types.includes(status.type) && status.type) throw new Error(`type should be ${this.keys.join()}`)
    //   if (status.key === undefined) throw new Error('status key should be defined')

    //   if (typeof status.key === 'string' && (!this.keys.includes(status.key))) {
    //     throw new Error('key should contain either number or ' + this.keys.join())
    //   }
    //   this.setIconStatus(profile.name, status)
    // }
    // this.iconStatus[profile.name] = fn
    // this.on(profile.name, 'statusChanged', this.iconStatus[profile.name])
  }

  /**
   * resolve a classes list for @arg key
   * @param {Object} key
   * @param {Object} type
   */
  resolveClasses (key, type) {
    let classes = 'remixui_status'

    switch (key) {
      case 'succeed':
        classes += ' fas fa-check-circle text-' + type + ' ' + 'remixui_statusCheck'
        break
      case 'edited':
        classes += ' fas fa-sync text-' + type + ' ' + 'remixui_statusCheck'
        break
      case 'loading':
        classes += ' fas fa-spinner text-' + type + ' ' + 'remixui_statusCheck'
        break
      case 'failed':
        classes += ' fas fa-exclamation-triangle text-' + type + ' ' + 'remixui_statusCheck'
        break
      default: {
        classes += ' badge badge-pill badge-' + type
      }
    }
    return classes
  }

  /**
   * Set a new status for the @arg name
   * @param {String} name
   * @param {Object} status
   */
  setIconStatus (name, status) {
    const el = this.icons[name]
    // eslint-disable-next-line no-debugger
    debugger
    if (!el) return
    const statusEl = el.querySelector('i')
    if (statusEl) {
      el.removeChild(statusEl)
    }
    if (status.key === 'none') return // remove status

    let text = ''
    let key = ''
    if (typeof status.key === 'number') {
      key = status.key.toString()
      text = key
    } else key = helper.checkSpecialChars(status.key) ? '' : status.key

    let type = ''
    if (status.type === 'error') {
      type = 'danger' // to use with bootstrap
    } else type = helper.checkSpecialChars(status.type) ? '' : status.type
    const title = helper.checkSpecialChars(status.title) ? '' : status.title

    el.appendChild(`<i
    title="${title}"
      class="${this.resolveClasses(key, type)}"
      aria-hidden="true"
    >
    ${text}
    </i>`)

    el.classList.add('remixui_icon')
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
