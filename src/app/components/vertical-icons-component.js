
var yo = require('yo-yo')
var csjs = require('csjs-inject')
const remixLib = require('remix-lib')

const styleguide = require('../ui/styles-guide/theme-chooser')
const styles = styleguide.chooser()
const EventEmmitter = require('events')
  
  // Component
  class VerticalIconComponent {
  
    constructor() {
      this.event = new EventEmmitter
    }
  
    addIcon (mod) {
      let self = this
      this.view.appendChild(yo`<div onclick=${(e) => { self._iconClick(mod.name)}} title=${mod.name}><img src="${mod.icon}" alt="${mod.name}" /></div>`)
    }

    removeIcon (item) {

    }

    select (name) {
      this.event.emit('showContent', name)
    }

    _iconClick (name) {
      // called when an icon has been clicked
      this.event.emit('showContent', name)
    }

    render() {
        this.view = yo`
          <div id='icons'>
          </div>
        `
        return this.view
    }
  }

  module.exports = VerticalIconComponent
