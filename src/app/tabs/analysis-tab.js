var yo = require('yo-yo')
var csjs = require('csjs-inject')
var remixLib = require('remix-lib')
var StaticAnalysis = require('../staticanalysis/staticAnalysisView')

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
    self._deps = {
      rightHandPanel: self._components.registry.get('righthandpanel').api
    }
  }
  render () {
    const self = this
    var staticanalysis = new StaticAnalysis()
    staticanalysis.event.register('staticAnaysisWarning', (count) => {
      if (count > 0) {
        const msg = `Static Analysis raised ${count} warning(s) that requires your attention. Click here to show the warning(s).`
        const settings = { type: 'staticAnalysisWarning', click: () => self._deps.rightHandPanel.focusOn('staticanalysisView'), useSpan: true }
        self.event.trigger('newStaticAnaysisWarningMessage', [msg, settings])
      }
    })
    self._components.registry.put({api: staticanalysis, name: 'staticanalysis'})
    if (self._view.el) return self._view.el
    self._view.el = yo`
      <div class="${css.analysisTabView} "id="staticanalysisView">${staticanalysis.render()}</div>`

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
