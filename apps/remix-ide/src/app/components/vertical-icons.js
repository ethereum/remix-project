import * as packageJson from '../../../../../package.json'
import { basicLogo } from '../ui/svgLogo'
var yo = require('yo-yo')
var csjs = require('csjs-inject')
var helper = require('../../lib/helper')
const globalRegistry = require('../../global/registry')
const contextMenu = require('../ui/contextMenu')
const { Plugin } = require('@remixproject/engine')
const EventEmitter = require('events')
let VERTICALMENU_HANDLE

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
    this.icons = {}
    this.iconKind = {}
    this.iconStatus = {}

    const themeModule = globalRegistry.get('themeModule').api
    themeModule.events.on('themeChanged', (theme) => {
      this.onThemeChanged(theme.quality)
    })
  }

  linkContent (profile) {
    if (!profile.icon) return
    this.addIcon(profile)
    this.listenOnStatus(profile)
  }

  unlinkContent (profile) {
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
   * Add an icon to the map
   * @param {ModuleProfile} profile The profile of the module
   */
  addIcon ({ kind, name, icon, displayName, tooltip, documentation }) {
    let title = (tooltip || displayName || name)
    title = title.replace(/^\w/, c => c.toUpperCase())
    this.icons[name] = yo`
      <div
        class="${css.icon} m-2"
        onclick="${() => { this.toggle(name) }}"
        plugin="${name}"
        title="${title}"
        oncontextmenu="${(e) => this.itemContextMenu(e, name, documentation)}"
        data-id="verticalIconsKind${name}"
        id="verticalIconsKind${name}"
      >
        <img class="image" src="${icon}" alt="${name}" />
      </div>`
    this.iconKind[kind || 'none'].appendChild(this.icons[name])
  }

  /**
   * resolve a classes list for @arg key
   * @param {Object} key
   * @param {Object} type
   */
  resolveClasses (key, type) {
    let classes = css.status
    switch (key) {
      case 'succeed':
        classes += ' fas fa-check-circle text-' + type + ' ' + css.statusCheck
        break
      case 'edited':
        classes += ' fas fa-sync text-' + type + ' ' + css.statusCheck
        break
      case 'loading':
        classes += ' fas fa-spinner text-' + type + ' ' + css.statusCheck
        break
      case 'failed':
        classes += ' fas fa-exclamation-triangle text-' + type + ' ' + css.statusCheck
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
  removeIcon ({ kind, name }) {
    if (this.icons[name]) this.iconKind[kind || 'none'].removeChild(this.icons[name])
  }

  /**
   *  Remove active for the current activated icons
   */
  removeActive () {
    // reset filters
    const images = this.view.querySelectorAll('.image')
    images.forEach(function (im) {
      im.style.setProperty('filter', 'invert(0.5)')
    })

    // remove active
    const currentActive = this.view.querySelector('.active')
    if (currentActive) {
      currentActive.classList.remove('active')
    }
  }

  /**
   *  Add active for the new activated icon
   * @param {string} name Name of profile of the module to activate
   */
  addActive (name) {
    if (name === 'home') return
    const themeType = globalRegistry.get('themeModule').api.currentTheme().quality
    const invert = themeType === 'dark' ? 1 : 0
    const brightness = themeType === 'dark' ? '150' : '0' // should be >100 for icons with color
    const nextActive = this.view.querySelector(`[plugin="${name}"]`)
    if (nextActive) {
      const image = nextActive.querySelector('.image')
      nextActive.classList.add('active')
      image.style.setProperty('filter', `invert(${invert}) grayscale(1) brightness(${brightness}%)`)
    }
  }

  /**
   * Set an icon as active
   * @param {string} name Name of profile of the module to activate
   */
  select (name) {
    this.updateActivations(name)
    // TODO: Only keep `this.emit` (issue#2210)
    this.emit('showContent', name)
    this.events.emit('showContent', name)
  }

  /**
   * Toggles the side panel for plugin
   * @param {string} name Name of profile of the module to activate
   */
  toggle (name) {
    this.updateActivations(name)
    // TODO: Only keep `this.emit` (issue#2210)
    this.emit('toggleContent', name)
    this.events.emit('toggleContent', name)
  }

  updateActivations (name) {
    this.removeActive()
    this.addActive(name)
  }

  onThemeChanged (themeType) {
    const invert = themeType === 'dark' ? 1 : 0
    const active = this.view.querySelector('.active')
    if (active) {
      const image = active.querySelector('.image')
      image.style.setProperty('filter', `invert(${invert})`)
    }
  }

  /*
  * Defines actions on right click in the vertical icons panel
  * Decativation: if it's not active but located in the panel, something is wrong for example it can't do the handshake, so we remove it forcefully.
  */
  async itemContextMenu (e, name, documentation) {
    const actions = {}
    if (await this.appManager.canDeactivatePlugin(profile, { name })) {
      actions.Deactivate = async () => {
        if (!await this.appManager.isActive(name)) {
          const profile = await this.appManager.getProfile(name)
          if (profile) await this.call(profile.location, 'removeView', profile)
        } else {
          this.appManager.deactivatePlugin(name)
        }
        if (e.target.parentElement.classList.contains('active')) {
          this.select('filePanel')
        }
      }
    }
    const links = {}
    if (documentation) {
      links.Documentation = documentation
    }
    if (Object.keys(actions).length || Object.keys(links).length) {
      VERTICALMENU_HANDLE && VERTICALMENU_HANDLE.hide(null, true)
      VERTICALMENU_HANDLE = contextMenu(e, actions, links)
    }
    e.preventDefault()
    e.stopPropagation()
  }

  render () {
    const home = yo`
      <div
        class="m-1 mt-2 ${css.homeIcon}"
        onclick="${async () => {
          await this.appManager.activatePlugin('home')
          this.call('tabs', 'focus', 'home')
        }}"
        plugin="home" title="Home"
        data-id="verticalIconsHomeIcon"
        id="verticalIconsHomeIcon"
      >
        ${basicLogo()}
      </div>
    `
    this.iconKind.fileexplorer = yo`<div id='fileExplorerIcons' data-id="verticalIconsFileExplorerIcons"></div>`
    this.iconKind.compiler = yo`<div id='compileIcons'></div>`
    this.iconKind.udapp = yo`<div id='runIcons'></div>`
    this.iconKind.testing = yo`<div id='testingIcons'></div>`
    this.iconKind.analysis = yo`<div id='analysisIcons'></div>`
    this.iconKind.debugging = yo`<div id='debuggingIcons' data-id="verticalIconsDebuggingIcons"></div>`
    this.iconKind.none = yo`<div id='otherIcons'></div>`
    this.iconKind.settings = yo`<div id='settingsIcons' data-id="verticalIconsSettingsIcons"></div>`

    this.view = yo`
      <div class="h-100">
        <div class=${css.icons}>
          ${home}
          ${this.iconKind.fileexplorer}
          ${this.iconKind.compiler}
          ${this.iconKind.udapp}
          ${this.iconKind.testing}
          ${this.iconKind.analysis}
          ${this.iconKind.debugging}
          ${this.iconKind.none}
          ${this.iconKind.settings}
        </div>
      </div>
    `
    return this.view
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
