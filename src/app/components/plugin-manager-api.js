var yo = require('yo-yo')
var csjs = require('csjs-inject')
const remixLib = require('remix-lib')

const styleguide = require('../ui/styles-guide/theme-chooser')
const styles = styleguide.chooser()

const EventManager = remixLib.EventManager

class PluginManagerApi {
  constructor (swapPanelComponent, pluginManagerComponent, appManager) {
    this.component = swapPanelComponent
    this.appManager = appManager
    appManager.event.register('pluginLoaded', (item) => {
      pluginManagerComponent.addItem(item)
    })
    pluginManagerComponent.event.on('activation', (item) => this.event.emit('activation', item))
    pluginManagerComponent.event.on('deactivation', (item) => this.event.emit('deactivation', item))
  }
}

module.exports = SwapPanelApi
