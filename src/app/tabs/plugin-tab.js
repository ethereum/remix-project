var yo = require('yo-yo')
var csjs = require('csjs-inject')
var remixLib = require('remix-lib')

var globalRegistry = require('../../global/registry')
var EventManager = remixLib.EventManager

module.exports = class plugintab {
  constructor (json, localRegistry) {
    const self = this
    self.event = new EventManager()
    self._view = { el: null }
    self.data = { json }
    self._components = {}
    self._components.registry = localRegistry || globalRegistry
  }
  render () {
    const self = this
    if (self._view.el) return self._view.el
    self._view.el = yo`
      <div class="${css.pluginTabView}" id="pluginView">
        <iframe class="${css.iframe}" src="${self.data.json.url}/index.html"></iframe>
      </div>`
    return self._view.el
  }
}
const css = csjs`
  .pluginTabView {
    height: 100%;
    width: 100%;
  }
  .iframe {
    height: 100%;
    width: 100%;
    border: 0;
  }
`
