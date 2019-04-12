var yo = require('yo-yo')
var csjs = require('csjs-inject')
var helper = require('../../lib/helper')
let globalRegistry = require('../../global/registry')

const EventEmitter = require('events')

// Component
class VerticalIconComponent {

  constructor (name, appStore) {
    this.store = appStore
    this.events = new EventEmitter()
    this.icons = {}
    this.iconKind = {}
    this.iconStatus = {}
    this.name = name

    this.store.event.on('activate', (name) => {
      const api = this.store.getOne(name)
      if (!api.profile.icon) return
      if (api.profile.location === this.name) {
        this.addIcon(api.profile)
        this.listenOnStatus(api)
      }
    })
    this.store.event.on('deactivate', (name) => {
      const api = this.store.getOne(name)
      if (api && this.icons[name]) {
        this.removeIcon(api.profile)
        this.stopListenOnStatus(api)
      }
    })
    this.store.event.on('add', (api) => { })
    this.store.event.on('remove', (api) => { })
  }

  stopListenOnStatus (api) {
    if (!api.events) return
    let fn = this.iconStatus[api.profile.name]
    if (fn) {
      api.events.removeListener('statusChanged', fn)
      delete this.iconStatus[api.profile.name]
    }
  }

  listenOnStatus (api) {
    if (!api.events) return
    const fn = (status) => {
      this.setIconStatus(api.profile.name, status)
    }
    this.iconStatus[api.profile.name] = fn
    api.events.on('statusChanged', this.iconStatus[api.profile.name])
  }

  /**
   * Add an icon to the map
   * @param {ModuleProfile} profile The profile of the module
   */
  addIcon ({kind, name, icon, displayName}) {
    this.icons[name] = yo`
      <div class="${css.icon}" onclick="${(e) => { this._iconClick(name) }}" plugin="${name}" title="${displayName || name}" >
        <img class="image" src="${icon}" alt="${name}" />
      </div>`
    this.iconKind[kind || 'other'].appendChild(this.icons[name])
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
    if (status.key) {
      let key = helper.checkSpecialChars(status.key) ? '' : status.key
      let type = helper.checkSpecialChars(status.type) ? '' : status.type
      let title = helper.checkSpecialChars(status.title) ? '' : status.title
      el.appendChild(yo`<span title="${title}" class="fa fa-${key} ${css.status} text-${type}" aria-hidden="true"></span>`)

      // el.classList = "" doesn't work on all browser use instead
      var classList = el.classList;
      while (classList.length > 0) {
        classList.remove(classList.item(0));
      }

      el.classList.add(`${css.icon}`)
      el.classList.add('border')
      el.classList.add(`border-${type}`)

    }
  }

  /**
   * Remove an icon from the map
   * @param {ModuleProfile} profile The profile of the module
   */
  removeIcon ({kind, name}) {
    if (this.icons[name]) this.iconKind[kind || 'other'].removeChild(this.icons[name])
  }

  /**
   * Set an icon as active
   * @param {string} name Name of profile of the module to activate
   */
  select (name) {
    const themeType = globalRegistry.get("themeModule").api.currentTheme().quality
    const invert = themeType === 'dark' ? 1 : 0
    // Remove active for the current activated icons
    const currentActive = this.view.querySelector(`.${css.active}`)
    if (currentActive) {
      currentActive.classList.remove(css.active)
      let image = currentActive.querySelector('.image')
      image.style.setProperty('filter', 'invert(0.5)')
    }
    // Add active for the new activated icon
    const nextActive = this.view.querySelector(`[plugin="${name}"]`)
    if (nextActive) {
      let image = nextActive.querySelector('.image')
      nextActive.classList.add(css.active)
      image.style.setProperty('filter', `invert(${invert})`)
    }

    this.events.emit('showContent', name)
  }

  _iconClick (name) {
    this.select(name)
  }

  render () {
    this.iconKind['fileexplorer'] = yo`
    <div id='fileExplorerIcons'>
    </div>
    `

    this.iconKind['compile'] = yo`
    <div id='compileIcons'>
    </div>
    `

    this.iconKind['run'] = yo`
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
      ${this.iconKind['fileexplorer']}
      ${this.iconKind['compile']}
      ${this.iconKind['run']}
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

module.exports = VerticalIconComponent

const css = csjs`
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
    filter: invert(0.5);
  }
  .icon svg {
    width: 28px;
    height: 28px;
    padding: 4px;
  }
  .icon[title='settings'] {
    position: absolute;
    bottom: 0;
  }
  .status {
    position: absolute;
    bottom: 0;
    right: 0;
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
