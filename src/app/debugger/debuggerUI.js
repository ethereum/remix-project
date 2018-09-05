var Debugger = require('../debugger/debugger')
var SourceHighlighter = require('../editor/sourceHighlighter')

class DebuggerUI {

  constructor (container) {
    this.transactionDebugger = new Debugger(container, new SourceHighlighter())
    this.isActive = false
    this.listenToEvents()
  }

  listenToEvents () {
    const self = this
    this.transactionDebugger.event.register('debuggerStatus', function (isActive) {
      self.isActive = isActive
    })
  }

  view () {
    return this.transactionDebugger
  }

  isDebuggerActive () {
    return this.isActive
  }

  debug (txHash) {
    this.transactionDebugger.debug(txHash)
  }
}

module.exports = DebuggerUI
