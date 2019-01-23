
var yo = require('yo-yo')
var csjs = require('csjs-inject')
// const remixLib = require('remix-lib')

// const styleguide = require('../ui/styles-guide/theme-chooser')
// const styles = styleguide.chooser()
const EventEmmitter = require('events')

// Component
class VerticalIconComponent {

  constructor () {
    this.event = new EventEmmitter()
    this.icons = {}
  }

  addIcon (mod) {
    let self = this
    // let idName = mod.displayName ? mod.displayName : mod.name
    // let idName = slugify(mod.name)
    this.icons[mod.name] = yo`<div class="${css.icon}" onclick=${(e) => { self._iconClick(mod.name) }} title=${mod.name} ><img src="${mod.icon}" alt="${mod.name}" /></div>`
    this.view.appendChild(this.icons[mod.name])
  }

  removeIcon (mod) {
    let el = this.icons[mod.name]
    if (el) el.parentElement.removeChild(el)
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
    this.view = yo`
      <div class=${css.icons}>
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
  .icon.active {
    border: solid 3px hsla(229, 75%, 87%, 1);
    border-radius: 8px;
    padding-top: 1px;
    padding-left: 1px;
}
`
