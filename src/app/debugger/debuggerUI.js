var Debugger = require('../debugger/debugger')
var executionContext = require('../../execution-context')
var SourceHighlighter = require('../editor/sourceHighlighter')

class DebuggerUI {

  constructor (container) {
    this.transactionDebugger = new Debugger(container, new SourceHighlighter())
    this.transactionDebugger.addProvider('vm', executionContext.vm())
    this.transactionDebugger.addProvider('injected', executionContext.internalWeb3())
    this.transactionDebugger.addProvider('web3', executionContext.internalWeb3())
    this.transactionDebugger.switchProvider(executionContext.getProvider())

    this.isActive = false

    this.listenToEvents()
  }

  listenToEvents () {
    const self = this
    this.transactionDebugger.debugger.event.register('newTraceLoaded', this, function () {
      self.isActive = true
    })

    this.transactionDebugger.debugger.event.register('traceUnloaded', this, function () {
      self._components.sourceHighlighter.currentSourceLocation(null)
      self.isActive = false
    })
  }

  view () {
    return this.transactionDebugger
  }

  isDebuggerActive () {
    return this.isActive
  }
}

module.exports = DebuggerUI
