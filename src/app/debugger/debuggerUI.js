var OldEthdebuggerUI = require('./remix-debugger/src/ui/EthdebuggerUI')
var Debugger = require('../debugger/debugger')
var SourceHighlighter = require('../editor/sourceHighlighter')
var TxBrowser = require('./debuggerUI/TxBrowser')
var remixLib = require('remix-lib')
var executionContext = remixLib.execution.executionContext

class DebuggerUI {

  constructor (container) {
    this.transactionDebugger = new Debugger(new SourceHighlighter())
    this.isActive = false

    this.debugger_ui = new OldEthdebuggerUI({
      debugger: this.transactionDebugger.debugger
    })

    this.startTxBrowser()

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

  startTxBrowser () {
    const self = this

    let txBrowser = new TxBrowser(this.debugger_ui, {web3: executionContext.web3()})
    this.debugger_ui.txBrowser = txBrowser

    txBrowser.event.register('newTxLoading', this, function () {
      self.debugger_ui.unLoad()
    })
    txBrowser.event.register('newTraceRequested', this, function (blockNumber, txIndex, tx) {
      self.debugger_ui.startDebugging(blockNumber, txIndex, tx)
    })
    txBrowser.event.register('unloadRequested', this, function (blockNumber, txIndex, tx) {
      self.debugger_ui.unLoad()
    })

    this.txBrowser = this.debugger_ui.txBrowser
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
      self.transactionDebugger.debugger.solidityProxy.reset({})

      if (tx instanceof Object) {
        self.txBrowser.load(tx.hash, tx)
      } else if (tx instanceof String) {
        self.txBrowser.load(tx)
      }

      // self.debugger_ui.debug(tx)
    })
  }
}

module.exports = DebuggerUI
