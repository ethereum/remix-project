var yo = require('yo-yo')
var csjs = require('csjs-inject')
const remixLib = require('remix-lib')

const styleguide = require('../ui/styles-guide/theme-chooser')
const styles = styleguide.chooser()

const EventManager = remixLib.EventManager

class PluginManagerComponent {
  constructor () {
  }

  render () {
    var self = this
    // loop over all this.modules and this.plugins
    var view = yo`
      <div id='pluginManager' class=${css.plugins} >
      </div>
    `
  }

  addItem (item) {
    // add to appManager and then render
    renderItem(item)
  }

  _activate(item) {
    this.event.emit('activation', item)
  }

  _deactivate(item) {
    this.event.emit('deactivation', item)
  }

  renderItem (item) {
    var self = this

    var view = yo`
      <div id='pluginManager' class=${css.plugin} >
        ${item.name}
        ${item.url}
        <button onclick=${() => { self._activate(item) }} ><button>
        <button onclick=${() => { self._deactivate(item) }} ><button>
      </div>
    `
  }
}

module.exports = SwapPanelComponent

const css = csjs`
  .plugins        {
    width          : 300px;
  }
  .plugItIn       {
    display        : none;
  }
  .plugItIn.active     {
    display        :block;
  }
  .clearFunds { background-color: lightblue; }
`
