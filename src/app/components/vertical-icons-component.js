var yo = require('yo-yo')
var csjs = require('csjs-inject')

const EventEmitter = require('events')

// Component
class VerticalIconComponent {

  constructor (name, appStore) {
    this.store = appStore
    this.events = new EventEmitter()
    this.icons = {}
    this.iconKind = {}
    this.name = name

    this.store.event.on('activate', (name) => {
      const { profile } = this.store.getOne(name)
      if (!profile.icon) return
      if (profile.location === this.name || !profile.location) {
        this.addIcon(profile)
      }
    })
    this.store.event.on('deactivate', (name) => {
      const api = this.store.getOne(name)
      if (api && this.icons[name]) this.removeIcon(api.profile)
    })
    this.store.event.on('add', (api) => { })
    this.store.event.on('remove', (api) => { })
  }

  /**
   * Add an icon to the map
   * @param {ModuleProfile} profile The profile of the module
   */
  addIcon ({kind, name, icon}) {
    this.icons[name] = yo`<div class="${css.icon}" onclick="${(e) => { this._iconClick(name) }}" title="${name}" ><img src="${icon}" alt="${name}" /></div>`

    this.iconKind[kind || 'other'].appendChild(this.icons[name])
  }

  /**
   * Remove an icon from the map
   * @param {ModuleProfile} profile The profile of the module
   */
  removeIcon ({kind, name}) {
    if (this.icons[name]) this.iconKind[kind || 'other'].removeChild(this.icons[name])
  }

  select (name) {
    let currentActive = this.view.querySelector(`.${css.active}`)
    if (currentActive) {
      let currentTitle = currentActive.getAttribute('title')
      currentActive.classList.toggle(`${css.active}`)
      if (currentTitle !== name) {
        let activate = this.view.querySelector(`[title="${name}"]`)
        if (activate) activate.classList.toggle(`${css.active}`)
      }
    } else {
      let activate = this.view.querySelector(`[title="${name}"]`)
      if (activate) activate.classList.toggle(`${css.active}`)
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
  .icon      {
    cursor: pointer;
    margin-bottom: 12px;
    width: 36px;
    height: 36px;
    padding: 3px;
  }
  .icon img {
    width: 28px;
    height: 28px;
    padding: 4px;
  }
  .icon svg {
    width: 28px;
    height: 28px;
    padding: 4px;
  }
  .icon.active {
    border: solid 3px hsla(229, 75%, 87%, 1);
    border-radius: 8px;
    padding-top: 1px;
    padding-left: 1px;
}
  .icon[title='settings'] {
    position: absolute;
    bottom: 0;
  }
`
