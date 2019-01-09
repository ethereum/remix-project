// const remixLib = require('remix-lib')

class PluginManagerApi {
  constructor (pluginManagerComponent) {
    this.component = pluginManagerComponent
    pluginManagerComponent.event.on('activation', (item) => this.event.emit('activation', item)) // listen by appManager
    pluginManagerComponent.event.on('deactivation', (item) => this.event.emit('deactivation', item)) // listen by appManager
  }

  init (data) {
    for (var m in data.modules) {
      this.renderItem(m)
    }

    for (var n in data.plugins) {
      this.renderItem(n)
    }
  }
}

module.exports = PluginManagerApi
