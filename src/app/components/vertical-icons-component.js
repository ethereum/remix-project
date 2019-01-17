
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
    this.icons[mod.name] = yo`<div class="${css.icon}" onclick=${(e) => { self._iconClick(mod.name) }} title=${mod.name}><img src="${mod.icon}" alt="${mod.name}" /></div>` 
    this.view.appendChild(this.icons[mod.name])
  }

  removeIcon (mod) {
    let el = this.icons[mod.name]
    if (el) el.parentElement.removeChild(el)
  }

  select (name) {
    this.event.emit('showContent', name)
  }

  _iconClick (name) {
    // called when an icon has been clicked
    this.event.emit('showContent', name)
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
    margin-bottom: 25px;
  }
  .icon img {
    width: 25px;
  }
`
