var yo = require('yo-yo')
var csjs = require('csjs-inject')
var remixLib = require('remix-lib')

var Debugger = require('../debugger/debugger')
var SourceHighlighter = require('../editor/sourceHighlighter')

var executionContext = require('../../execution-context')

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
      <div class="${css.debuggerTabView}" id="debugView">
        <div id="debugger" class="${css.debugger}"></div>
      </div>`

    self._view.transactionDebugger = new Debugger(self._view.el.querySelector('#debugger'), new SourceHighlighter())
    self._view.transactionDebugger.addProvider('vm', executionContext.vm())
    self._view.transactionDebugger.addProvider('injected', executionContext.internalWeb3())
    self._view.transactionDebugger.addProvider('web3', executionContext.internalWeb3())
    self._view.transactionDebugger.switchProvider(executionContext.getProvider())
    return self._view.el
  }
  debugger () {
    return this._view.transactionDebugger
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
