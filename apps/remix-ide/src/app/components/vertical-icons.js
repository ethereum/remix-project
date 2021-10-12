import * as packageJson from '../../../../../package.json'
// eslint-disable-next-line no-unused-vars
import { basicLogo } from '../ui/svgLogo'
import ReactDOM from 'react-dom'
import React from 'react' // eslint-disable-line
// eslint-disable-next-line no-unused-vars
import { RemixUiVerticalIconsPanel } from '@remix-ui/vertical-icons-panel'
var yo = require('yo-yo')
var csjs = require('csjs-inject')
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
    const keys = ['edited', 'succeed', 'none', 'loading', 'failed']
    const types = ['error', 'warning', 'success', 'info', '']
    const fn = (status) => {
      if (!types.includes(status.type) && status.type) throw new Error(`type should be ${keys.join()}`)
      if (status.key === undefined) throw new Error('status key should be defined')

      if (typeof status.key === 'string' && (!keys.includes(status.key))) {
        throw new Error('key should contain either number or ' + keys.join())
      }
      this.setIconStatus(profile.name, status)
    }
    this.iconStatus[profile.name] = fn
    this.on(profile.name, 'statusChanged', this.iconStatus[profile.name])
  }

  /**
   * Set a new status for the @arg name
   * @param {String} name
   * @param {Object} status
   */
  setIconStatus (name, status) {
    const el = this.icons[name]
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

    el.appendChild(yo`<i
    title="${title}"
      class="${this.resolveClasses(key, type)}"
      aria-hidden="true"
    >
    ${text}
    </i>`)

    el.classList.add(`${css.icon}`)
  }

  /**
   * Remove an icon from the map
   * @param {ModuleProfile} profile The profile of the module
   */
  removeIcon ({ name }) {
    if (this.targetProfileForChange[name]) delete this.targetProfileForChange[name]
    this.renderComponent()
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

const css = csjs`
  .homeIcon {
      display: block;
      width: 42px;
      height: 42px;
      margin-bottom: 20px;
      cursor: pointer;
  }
  .homeIcon svg path {
    fill: var(--primary);
  }
  .homeIcon svg polygon {
    fill: var(--primary);
  }
  .icons {
  }
  .icon {
    cursor: pointer;
    margin-bottom: 12px;
    width: 36px;
    height: 36px;
    padding: 3px;
    position: relative;
    border-radius: 8px;
  }
  .icon img {
    width: 28px;
    height: 28px;
    padding: 4px;
    filter: invert(0.5);
  }
  .image {
  }
  .icon svg {
    width: 28px;
    height: 28px;
    padding: 4px;
  }
  .icon[title='Settings'] {
    position: absolute;
    bottom: 0;
  }
  .status {
    position: absolute;
    bottom: 0;
    right: 0;
  }
  .statusCheck {
    font-size: 1.2em;
  }
  .statusWithBG
    border-radius: 8px;
    background-color: var(--danger);
    color: var(--light);
    font-size: 12px;
    height: 15px;
    text-align: center;
    font-weight: bold;
    padding-left: 5px;
    padding-right: 5px;
  }
`
