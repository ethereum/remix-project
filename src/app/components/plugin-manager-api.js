var yo = require('yo-yo')
var csjs = require('csjs-inject')
const remixLib = require('remix-lib')

const styleguide = require('../ui/styles-guide/theme-chooser')
const styles = styleguide.chooser()

class PluginManagerApi {
  constructor (pluginManagerComponent) {
    pluginManagerComponent.event.on('activation', (item) => this.event.emit('activation', item)) // listen by appManager
    pluginManagerComponent.event.on('deactivation', (item) => this.event.emit('deactivation', item)) // listen by appManager
  }

  /*
    function called by appManager
  */
  addItem (item) {
    // add to appManager and then render
    this.renderItem(item)
  }

  init (data) {
    for (var m in  data.modules) {
      this.renderItem(item)
    }

    for (var m in  data.plugins) {
      this.renderItem(item)
    }
  }
}

module.exports = PluginManagerApi
