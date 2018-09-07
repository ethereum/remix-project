var OldEthdebuggerUI = require('./remix-debugger/src/ui/EthdebuggerUI')
var Debugger = require('../debugger/debugger')
var SourceHighlighter = require('../editor/sourceHighlighter')
var TxBrowser = require('./debuggerUI/TxBrowser')
var StepManager = require('./debuggerUI/StepManager')
var remixLib = require('remix-lib')
var executionContext = remixLib.execution.executionContext
var traceHelper = remixLib.helpers.trace

class DebuggerUI {

  constructor (container) {
    this.transactionDebugger = new Debugger(new SourceHighlighter())
    this.isActive = false

    this.debugger_ui = new OldEthdebuggerUI({
      debugger: this.transactionDebugger.debugger
    })

    this.startTxBrowser()
    // this.startStepManager()
    this.stepManager = null

    container.appendChild(this.debugger_ui.render())

    this.listenToEvents()
  }

  listenToEvents () {
    const self = this
    this.transactionDebugger.event.register('debuggerStatus', function (isActive) {
      self.isActive = isActive
    })

    this.transactionDebugger.event.register('breakpointStep', function (step) {
      self.stepManager.step_manager.jumpTo(step)
    })

    this.debugger_ui.event.register('indexChanged', function (index) {
      self.transactionDebugger.registerAndHighlightCodeItem(index)
    })
  }

  // startStepManager () {
  //   this.stepManager = null
  // }

  startTxBrowser () {
    const self = this
    let web3 = executionContext.web3()

    let txBrowser = new TxBrowser(this.debugger_ui, {web3: web3})
    this.debugger_ui.txBrowser = txBrowser

    txBrowser.event.register('requestDebug', function (blockNumber, txNumber, tx) {
      self.debugger_ui.unLoad()

      if (tx) {
        if (!tx.to) {
          tx.to = traceHelper.contractCreationToken('0')
        }
        return self.startDebugging(blockNumber, txNumber, tx)
      }

      try {
        if (txNumber.indexOf('0x') !== -1) {
          return web3.eth.getTransaction(txNumber, function (error, result) {
            let tx = result
            txBrowser.update(error, result)
            self.startDebugging(blockNumber, txNumber, tx)
          })
        }
        web3.eth.getTransactionFromBlock(blockNumber, txNumber, function (error, result) {
          let tx = result
          txBrowser.update(error, result)
          self.startDebugging(blockNumber, txNumber, tx)
        })
      } catch (e) {
        self.update(e.message)
      }
    })

    txBrowser.event.register('unloadRequested', this, function (blockNumber, txIndex, tx) {
      self.debugger_ui.unLoad()
    })

    this.debugger_ui.event.register('providerChanged', this, function (provider) {
      txBrowser.setDefaultValues()
    })

    this.txBrowser = this.debugger_ui.txBrowser
  }

  view () {
    return this.transactionDebugger
  }

  isDebuggerActive () {
    return this.isActive
  }

  startDebugging (blockNumber, txNumber, tx) {
    const self = this
    let shouldOpenDebugger = this.debugger_ui.startDebugging(blockNumber, txNumber, tx)
    if (!shouldOpenDebugger) return

    this.stepManager = new StepManager(this.debugger_ui, this.transactionDebugger.debugger.traceManager)
    this.stepManager.event.register('stepChanged', this, function (stepIndex) {
      self.debugger_ui.stepChanged(stepIndex)
    })

    this.debugger_ui.stepManager = this.stepManager

    this.debugger_ui.createAndAddVmDebugger()
    this.transactionDebugger.debugger.debug(tx)
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
