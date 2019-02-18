var yo = require('yo-yo')
var csjs = require('csjs-inject')

const EventEmmitter = require('events')

// Component
class VerticalIconComponent {

  constructor (appStore) {
    this.store = appStore
    this.event = new EventEmmitter()
    this.icons = {}
    this.iconKind = {}

    this.store.event.on('activate', (name) => {
      const item = this.store.getOne(name)
      if (item && item.profile.icon && name !== 'code editor') this.addIcon(item.profile)
    })
    this.store.event.on('deactivate', (name) => {
      const item = this.store.getOne(name)
      if (item && this.icons[name]) this.removeIcon(item.profile)
    })
    this.store.event.on('add', (entity) => { })
    this.store.event.on('remove', (entity) => { })
  }

  addIcon (mod) {
    let kind = mod.kind || 'other'
    this.icons[mod.name] = yo`<div class="${css.icon}" onclick=${(e) => { this._iconClick(mod.name) }} title=${mod.name} ><img src="${mod.icon}" alt="${mod.name}" /></div>`

    this.iconKind[kind].appendChild(this.icons[mod.name])
  }

  removeIcon (mod) {
    let kind = mod.kind || 'other'
    if (this.icons[mod.name]) this.iconKind[kind].removeChild(this.icons[mod.name])
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
    this.event.emit('showContent', name)
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
