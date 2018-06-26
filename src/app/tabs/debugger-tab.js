var yo = require('yo-yo')
var csjs = require('csjs-inject')
var remixLib = require('remix-lib')

var globalRegistry = require('../../global/registry')
var EventManager = remixLib.EventManager
var styles = require('../ui/styles-guide/theme-chooser').chooser()

module.exports = class DebuggerTab {
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
      <div class="${css.debuggerTabView} "id="debugView">
        <div id="debugger" class="${css.debugger}"></div>
      </div>`
    return self._view.el
  }
}
const css = csjs`
  .debuggerTabView {
    padding: 2%;
  }
  .debugger {
    margin-bottom: 1%;
    ${styles.rightPanel.debuggerTab.box_Debugger}
  }
`
