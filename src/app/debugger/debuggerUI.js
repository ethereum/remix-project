var OldEthdebuggerUI = require('./remix-debugger/src/ui/EthdebuggerUI')
var Debugger = require('../debugger/debugger')
var SourceHighlighter = require('../editor/sourceHighlighter')

class DebuggerUI {

  constructor (container) {
    this.transactionDebugger = new Debugger(container, new SourceHighlighter())
    this.isActive = false

    this.debugger_ui = new OldEthdebuggerUI({debugger: this.transactionDebugger.debugger})
    container.appendChild(this.debugger_ui.render())

    this.listenToEvents()
  }

  listenToEvents () {
    const self = this
    this.transactionDebugger.event.register('debuggerStatus', function (isActive) {
      self.isActive = isActive
    })

    this.transactionDebugger.event.register('breakpointStep', function (step) {
      self.debugger_ui.stepManager.jumpTo(step)
    })

    this.debugger_ui.event.register('indexChanged', function (index) {
      self.transactionDebugger.registerAndHighlightCodeItem(index)
    })
  }

  view () {
    return this.transactionDebugger
  }

  isDebuggerActive () {
    return this.isActive
  }

  debug (txHash) {
    const self = this
    this.transactionDebugger.debug(txHash, (error, tx) => {
      if (error) {
        return console.error("coudn't get txHash: " + error)
      }
      self.debugger_ui.debug(tx)
    })
  }
}

module.exports = DebuggerUI
