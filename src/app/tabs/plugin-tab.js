var yo = require('yo-yo')
var css = require('./styles/plugin-tab-styles')

var globalRegistry = require('../../global/registry')
var EventManager = require('../../lib/events')

class PluginTab {

  constructor (json, localRegistry) {
    this.event = new EventManager()
    this._view = { el: null }
    this.data = { json }
    this._components = {}
    this._components.registry = localRegistry || globalRegistry
  }

  render () {
    if (this._view.el) return this._view.el

    this._view.el = yo`
      <div class="${css.pluginTabView}" id="pluginView">
        <iframe class="${css.iframe}" src="${this.data.json.url}/index.html"></iframe>
      </div>`

    return this._view.el
  }

}

module.exports = PluginTab
