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
    this.iconKind[kind || 'other'].appendChild(this.icons[name])
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
    if (this.icons[name]) this.iconKind[kind || 'other'].removeChild(this.icons[name])
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
    >
    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
    width="42px" height="42px" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve">
      <g>
        <path fill="#414042" d="M70.582,428.904c0.811,0,1.622,0.285,2.437,0.853c0.811,0.571,1.218,1.34,1.218,2.314
          c0,2.277-1.059,3.496-3.168,3.656c-5.038,0.814-9.381,2.356-13.037,4.63c-3.655,2.276-6.663,5.117-9.016,8.528
          c-2.357,3.411-4.104,7.272-5.239,11.575c-1.139,4.307-1.706,8.814-1.706,13.524v32.653c0,2.273-1.139,3.411-3.412,3.411
          c-2.277,0-3.412-1.138-3.412-3.411v-74.323c0-2.273,1.135-3.411,3.412-3.411c2.273,0,3.412,1.138,3.412,3.411v15.108
          c1.462-2.437,3.206-4.752,5.239-6.945c2.029-2.193,4.264-4.143,6.701-5.848c2.437-1.706,5.076-3.085,7.919-4.143
          C64.771,429.433,67.658,428.904,70.582,428.904z"/>
        <path fill="#414042" d="M137.773,427.198c5.685,0,10.966,1.181,15.839,3.534c4.874,2.356,9.055,5.482,12.55,9.381
          c3.492,3.899,6.214,8.407,8.164,13.524c1.949,5.117,2.924,10.44,2.924,15.961c0,0.976-0.366,1.79-1.097,2.438
          c-0.731,0.65-1.583,0.975-2.559,0.975h-67.987c0.487,4.226,1.584,8.285,3.29,12.184c1.706,3.899,3.937,7.312,6.701,10.234
          c2.761,2.925,6.008,5.281,9.748,7.067c3.735,1.789,7.877,2.681,12.428,2.681c12.021,0,21.36-4.79,28.023-14.377
          c0.647-1.136,1.622-1.706,2.924-1.706c2.273,0,3.412,1.139,3.412,3.412c0,0.163-0.164,0.73-0.487,1.705
          c-3.412,6.013-8.205,10.479-14.377,13.402c-6.176,2.924-12.671,4.387-19.495,4.387c-5.689,0-10.928-1.181-15.718-3.533
          c-4.793-2.354-8.936-5.483-12.428-9.382c-3.495-3.899-6.214-8.407-8.163-13.524c-1.95-5.118-2.924-10.437-2.924-15.962
          c0-5.521,0.975-10.844,2.924-15.961c1.949-5.117,4.668-9.625,8.163-13.524c3.492-3.898,7.634-7.024,12.428-9.381
          C126.846,428.379,132.084,427.198,137.773,427.198z M169.94,466.188c-0.328-4.223-1.341-8.285-3.046-12.184
          c-1.706-3.899-3.982-7.312-6.823-10.235c-2.844-2.924-6.175-5.277-9.991-7.067c-3.819-1.785-7.92-2.68-12.306-2.68
          c-4.55,0-8.692,0.895-12.428,2.68c-3.739,1.79-6.987,4.144-9.748,7.067c-2.764,2.924-4.995,6.336-6.701,10.235
          c-1.706,3.898-2.802,7.961-3.29,12.184H169.94z"/>
        <path fill="#414042" d="M304.69,427.441c5.034,0,9.504,1.018,13.402,3.047c3.899,2.033,7.189,4.672,9.87,7.92
          c2.68,3.251,4.709,7.066,6.092,11.452c1.379,4.387,2.07,8.856,2.07,13.402v43.62c0,0.975-0.365,1.789-1.097,2.438
          c-0.73,0.646-1.503,0.975-2.313,0.975c-2.276,0-3.412-1.14-3.412-3.412v-43.62c0-3.571-0.529-7.104-1.584-10.6
          c-1.059-3.491-2.602-6.618-4.63-9.382c-2.033-2.761-4.592-4.953-7.677-6.58c-3.088-1.621-6.662-2.436-10.722-2.436
          c-5.2,0-9.587,1.218-13.159,3.654c-3.574,2.438-6.457,5.566-8.65,9.382c-2.193,3.819-3.818,8.042-4.874,12.672
          c-1.059,4.63-1.584,9.058-1.584,13.28v33.629c0,0.975-0.365,1.789-1.096,2.438c-0.731,0.646-1.505,0.975-2.315,0.975
          c-2.276,0-3.411-1.14-3.411-3.412v-43.62c0-3.571-0.53-7.104-1.585-10.6c-1.058-3.491-2.601-6.618-4.629-9.382
          c-2.034-2.761-4.592-4.953-7.677-6.58c-3.087-1.621-6.663-2.436-10.722-2.436c-5.037,0-9.344,0.895-12.915,2.68
          c-3.575,1.79-6.542,4.266-8.895,7.433c-2.357,3.167-4.063,6.944-5.117,11.331c-1.059,4.386-1.584,9.1-1.584,14.134v3.899v0.243
          v32.897c0,2.272-1.138,3.412-3.412,3.412c-2.276,0-3.411-1.14-3.411-3.412v-74.567c0-2.273,1.135-3.411,3.411-3.411
          c2.273,0,3.412,1.138,3.412,3.411v12.428c2.924-5.197,6.861-9.382,11.819-12.55c4.954-3.167,10.517-4.752,16.692-4.752
          c6.983,0,12.995,1.991,18.032,5.97c5.033,3.983,8.688,9.223,10.966,15.719c2.76-6.336,6.739-11.533,11.94-15.596
          C291.125,429.475,297.38,427.441,304.69,427.441z"/>
        <path fill="#414042" d="M378.753,429.392c0.811,0,1.584,0.365,2.314,1.097c0.731,0.73,1.097,1.504,1.097,2.314v74.08
          c0,0.814-0.365,1.584-1.097,2.315c-0.73,0.73-1.504,1.097-2.314,1.097c-0.975,0-1.79-0.366-2.438-1.097
          c-0.65-0.731-0.975-1.501-0.975-2.315v-74.08c0-0.811,0.324-1.584,0.975-2.314C376.963,429.757,377.778,429.392,378.753,429.392z"
          />
        <path fill="#414042" d="M473.34,428.66c2.273,0,3.412,1.139,3.412,3.411l-0.487,1.95l-24.368,35.334l24.368,35.577
          c0.323,0.976,0.487,1.626,0.487,1.95c0,2.272-1.139,3.412-3.412,3.412c-1.302,0-2.193-0.488-2.68-1.463l-22.906-33.384
          l-22.663,33.384c-0.814,0.975-1.79,1.463-2.924,1.463c-2.277,0-3.411-1.14-3.411-3.412c0-0.324,0.159-0.975,0.486-1.95
          l24.369-35.577l-24.369-35.334l-0.486-1.95c0-2.272,1.134-3.411,3.411-3.411c1.134,0,2.109,0.487,2.924,1.462l22.663,33.141
          l22.906-33.141C471.146,429.147,472.038,428.66,473.34,428.66z"/>
      </g>
      <g>
        <g>
          <g opacity="0.45">
            <g>
              <polygon fill="#010101" points="150.734,196.212 255.969,344.508 255.969,258.387"/>
            </g>
          </g>
          <g opacity="0.8">
            <g>
              <polygon fill="#010101" points="255.969,258.387 255.969,344.508 361.267,196.212"/>
            </g>
          </g>
          <g opacity="0.6">
            <g>
              <polygon fill="#010101" points="255.969,126.781 150.733,174.611 255.969,236.818 361.204,174.611"/>
            </g>
          </g>
          <g opacity="0.45">
            <g>
              <polygon fill="#010101" points="150.734,174.612 255.969,236.818 255.969,126.782 255.969,0.001"/>
            </g>
          </g>
          <g opacity="0.8">
            <g>
              <polygon fill="#010101" points="255.969,0 255.969,126.781 255.969,236.818 361.204,174.611"/>
            </g>
          </g>
        </g>
      </g>
    </svg>


    </div>`

    this.iconKind['fileexplorer'] = yo`
    <div id='fileExplorerIcons'>
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

    this.iconKind['other'] = yo`
    <div id='otherIcons'>
    </div>
    `

    this.iconKind['settings'] = yo`
    <div id='settingsIcons'>
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
        ${this.iconKind['other']}
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
