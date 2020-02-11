var yo = require('yo-yo')
var csjs = require('csjs-inject')
var helper = require('../../lib/helper')
let globalRegistry = require('../../global/registry')
const { Plugin } = require('@remixproject/engine')
import * as packageJson from '../../../package.json'

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
    this.icons = {}
    this.iconKind = {}
    this.iconStatus = {}

    let themeModule = globalRegistry.get('themeModule').api
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
      if (status.key === undefined) throw new Error(`status key should be defined`)

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
  addIcon ({kind, name, icon, displayName, tooltip}) {
    let title = (tooltip || displayName || name)
    this.icons[name] = yo`
      <div
        class="${css.icon}"
        onclick="${() => { this.toggle(name) }}"
        plugin="${name}"
        title="${title}">
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
    let statusEl = el.querySelector('span')
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
    let title = helper.checkSpecialChars(status.title) ? '' : status.title

    el.appendChild(yo`<span
      title="${title}"
      class="${this.resolveClasses(key, type)}"
      aria-hidden="true"
    >
    ${text}
    </span>`)

    el.classList.add(`${css.icon}`)
  }

  /**
   * Remove an icon from the map
   * @param {ModuleProfile} profile The profile of the module
   */
  removeIcon ({kind, name}) {
    if (this.icons[name]) this.iconKind[kind || 'none'].removeChild(this.icons[name])
  }

  /**
   *  Remove active for the current activated icons
   */
  removeActive () {
    // reset filters
    const images = this.view.querySelectorAll(`.image`)
    images.forEach(function (im) {
      im.style.setProperty('filter', 'invert(0.5)')
    })

    // remove active
    const currentActive = this.view.querySelector(`.active`)
    if (currentActive) {
      currentActive.classList.remove(`active`)
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
      let image = nextActive.querySelector('.image')
      nextActive.classList.add(`active`)
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
    const active = this.view.querySelector(`.active`)
    if (active) {
      let image = active.querySelector('.image')
      image.style.setProperty('filter', `invert(${invert})`)
    }
  }

  render () {
    let home = yo`
    <div
      class="${css.homeIcon}"
      onclick="${(e) => {
        this.appManager.ensureActivated('home')
      }}"
      plugin="home" title="Home"
      data-id="iconPanelHomeIcon"
    >
    <svg id="Ebene_2" data-name="Ebene 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 105 100">
      <title>remix_logo1</title>
      <path d="M91.84,35a.09.09,0,0,1-.1-.07,41,41,0,0,0-79.48,0,.09.09,0,0,1-.1.07C9.45,35,1,35.35,1,42.53c0,8.56,1,16,6,20.32,2.16,1.85,5.81,2.3,9.27,2.22a44.4,44.4,0,0,0,6.45-.68.09.09,0,0,0,.06-.15A34.81,34.81,0,0,1,17,45c0-.1,0-.21,0-.31a35,35,0,0,1,70,0c0,.1,0,.21,0,.31a34.81,34.81,0,0,1-5.78,19.24.09.09,0,0,0,.06.15,44.4,44.4,0,0,0,6.45.68c3.46.08,7.11-.37,9.27-2.22,5-4.27,6-11.76,6-20.32C103,35.35,94.55,35,91.84,35Z"/>
      <path d="M52,74,25.4,65.13a.1.1,0,0,0-.1.17L51.93,91.93a.1.1,0,0,0,.14,0L78.7,65.3a.1.1,0,0,0-.1-.17L52,74A.06.06,0,0,1,52,74Z"/>
      <path d="M75.68,46.9,82,45a.09.09,0,0,0,.08-.09,29.91,29.91,0,0,0-.87-6.94.11.11,0,0,0-.09-.08l-6.43-.58a.1.1,0,0,1-.06-.18l4.78-4.18a.13.13,0,0,0,0-.12,30.19,30.19,0,0,0-3.65-6.07.09.09,0,0,0-.11,0l-5.91,2a.1.1,0,0,1-.12-.14L72.19,23a.11.11,0,0,0,0-.12,29.86,29.86,0,0,0-5.84-4.13.09.09,0,0,0-.11,0l-4.47,4.13a.1.1,0,0,1-.17-.07l.09-6a.1.1,0,0,0-.07-.1,30.54,30.54,0,0,0-7-1.47.1.1,0,0,0-.1.07l-2.38,5.54a.1.1,0,0,1-.18,0l-2.37-5.54a.11.11,0,0,0-.11-.06,30,30,0,0,0-7,1.48.12.12,0,0,0-.07.1l.08,6.05a.09.09,0,0,1-.16.07L37.8,18.76a.11.11,0,0,0-.12,0,29.75,29.75,0,0,0-5.83,4.13.11.11,0,0,0,0,.12l2.59,5.6a.11.11,0,0,1-.13.14l-5.9-2a.11.11,0,0,0-.12,0,30.23,30.23,0,0,0-3.62,6.08.11.11,0,0,0,0,.12l4.79,4.19a.1.1,0,0,1-.06.17L23,37.91a.1.1,0,0,0-.09.07A29.9,29.9,0,0,0,22,44.92a.1.1,0,0,0,.07.1L28.4,47a.1.1,0,0,1,0,.18l-5.84,3.26a.16.16,0,0,0,0,.11,30.17,30.17,0,0,0,2.1,6.76c.32.71.67,1.4,1,2.08a.1.1,0,0,0,.06,0L52,68.16H52l26.34-8.78a.1.1,0,0,0,.06-.05,30.48,30.48,0,0,0,3.11-8.88.1.1,0,0,0-.05-.11l-5.83-3.26A.1.1,0,0,1,75.68,46.9Z"/>
    </svg>

    </div>`

    this.iconKind['fileexplorer'] = yo`
    <div id='fileExplorerIcons' data-id="fileExplorerIcons">
    </div>
    `

    this.iconKind['compiler'] = yo`
    <div id='compileIcons'>
    </div>
    `

    this.iconKind['udapp'] = yo`
    <div id='runIcons'>
    </div>
    `

    this.iconKind['testing'] = yo`
    <div id='testingIcons'>
    </div>
    `

    this.iconKind['analysis'] = yo`
    <div id='analysisIcons'>
    </div>
    `

    this.iconKind['debugging'] = yo`
    <div id='debuggingIcons'>
    </div>
    `

    this.iconKind['none'] = yo`
    <div id='otherIcons'>
    </div>
    `

    this.iconKind['settings'] = yo`
    <div id='settingsIcons' data-id="settingsIcons">
    </div>
    `

    this.view = yo`
      <div class=${css.icons}>
        ${home}
        ${this.iconKind['fileexplorer']}
        ${this.iconKind['compiler']}
        ${this.iconKind['udapp']}
        ${this.iconKind['testing']}
        ${this.iconKind['analysis']}
        ${this.iconKind['debugging']}
        ${this.iconKind['none']}
        ${this.iconKind['settings']}
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
      margin-left: -5px;
      cursor: pointer;
  }
  .homeIcon svg path {
    fill: var(--primary);
  }
  .homeIcon svg polygon {
    fill: var(--primary);
  }
  .icons {
    margin-left: 10px;
    margin-top: 15px;
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
