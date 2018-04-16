var yo = require('yo-yo')
var csjs = require('csjs-inject')
var remixLib = require('remix-lib')

var EventManager = remixLib.EventManager

module.exports = class plugintab {
  constructor (api = {}, events = {}, opts = {}) {
    const self = this
    self.event = new EventManager()
    self._opts = opts
    self._api = api
    self._events = events
    self._view = { el: null }
    self._components = {}
  }
  render () {
    const self = this
    if (self._view.el) return self._view.el
    self._view.el = yo`
      <div class="${css.pluginTabView}" id="pluginView">
        <iframe class="${css.iframe}" src="${self._opts.url}/index.html"></iframe>
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
