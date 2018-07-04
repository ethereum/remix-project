var yo = require('yo-yo')
var csjs = require('csjs-inject')
var remixLib = require('remix-lib')

var globalRegistry = require('../../global/registry')
var EventManager = remixLib.EventManager

module.exports = class AnalysisTab {
  constructor (localRegistry) {
    const self = this
    self.event = new EventManager()
    self._view = { el: null }
    self.data = {}
    self._components = {}
    self._components.registry = localRegistry || globalRegistry
  }
  render () {
    const self = this
    if (self._view.el) return self._view.el
    self._view.el = yo`
      <div class="${css.analysisTabView} "id="staticanalysisView"></div>`
    return self._view.el
  }
}
const css = csjs`
  .analysisTabView {
    padding: 2%;
    padding-bottom: 3em;
    display: flex;
    flex-direction: column;
  }
`
