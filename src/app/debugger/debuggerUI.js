var TxBrowser = require('./debuggerUI/TxBrowser')
var StepManagerUI = require('./debuggerUI/StepManager')
var VmDebugger = require('./debuggerUI/VmDebugger')

var Debugger = require('../debugger/debugger')
var StepManager = require('./stepManager')

var SourceHighlighter = require('../editor/sourceHighlighter')

var remixLib = require('remix-lib')
var executionContext = remixLib.execution.executionContext
var EventManager = remixLib.EventManager
var traceHelper = remixLib.helpers.trace

var VmDebuggerLogic = require('./VmDebugger')

var globalRegistry = require('../../global/registry')

var yo = require('yo-yo')
var csjs = require('csjs-inject')

var css = csjs`
  .statusMessage {
    margin-left: 15px;
  }
  .innerShift {
    padding: 2px;
    margin-left: 10px;
  }
`

class DebuggerUI {

  constructor (container) {
    const self = this

    this.sourceHighlighter = new SourceHighlighter()
    this.transactionDebugger = new Debugger(this.sourceHighlighter)

    this.debugger = this.transactionDebugger.debugger
    this.isActive = false
    this.event = new EventManager()

    this.startTxBrowser()
    // this.startStepManager()
    this.stepManager = null

    this.currentStepIndex = -1
    this.tx
    this.statusMessage = ''

    this.view

    this.event.register('indexChanged', this, function (index) {
      self.debugger.codeManager.resolveStep(index, self.tx)
    })

    executionContext.event.register('contextChanged', this, function () {
      self.updateWeb3Reference()
    })

    container.appendChild(this.render())

    this.registry = globalRegistry
    this.setEditor()
    this.listenToEvents()
  }

  setEditor () {
    const self = this
    this.editor = this.registry.get('editor').api

    self.editor.event.register('breakpointCleared', (fileName, row) => {
      self.transactionDebugger.breakPointManager.remove({fileName: fileName, row: row})
    })

    self.editor.event.register('breakpointAdded', (fileName, row) => {
      self.transactionDebugger.breakPointManager.add({fileName: fileName, row: row})
    })

    // unload if a file has changed (but not if tabs were switched)
    self.editor.event.register('contentChanged', function () {
      self.transactionDebugger.debugger.unLoad()
    })
  }

  listenToEvents () {
    const self = this
    this.transactionDebugger.event.register('debuggerStatus', function (isActive) {
      self.sourceHighlighter.currentSourceLocation(null)
      self.isActive = isActive
    })

    this.transactionDebugger.event.register('breakpointStep', function (step) {
      self.stepManager.stepManager.jumpTo(step)
    })

    this.event.register('indexChanged', function (index) {
      self.transactionDebugger.registerAndHighlightCodeItem(index)
    })

    this.transactionDebugger.event.register('newSourceLocation', function (lineColumnPos, rawLocation) {
      self.sourceHighlighter.currentSourceLocation(lineColumnPos, rawLocation)
    })
  }

  startTxBrowser () {
    const self = this
    let web3 = executionContext.web3()

    let txBrowser = new TxBrowser(this, {web3: web3})
    this.txBrowser = txBrowser

    txBrowser.event.register('requestDebug', function (blockNumber, txNumber, tx) {
      self.unLoad()

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
      self.unLoad()
    })

    this.event.register('providerChanged', this, function (provider) {
      txBrowser.setDefaultValues()
    })

    this.txBrowser = this.txBrowser
  }

  view () {
    return this.transactionDebugger
  }

  isDebuggerActive () {
    return this.isActive
  }

  startDebugging (blockNumber, txNumber, tx) {
    const self = this
    let shouldOpenDebugger = this.UIstartDebugging(blockNumber, txNumber, tx)
    if (!shouldOpenDebugger) return

    this.transactionDebugger.step_manager = new StepManager(this, this.transactionDebugger.debugger.traceManager)
    this.stepManager = new StepManagerUI(this.transactionDebugger.step_manager)
    this.stepManager.event.register('stepChanged', this, function (stepIndex) {
      self.stepChanged(stepIndex)
    })

    this.stepManager = this.stepManager

    this.vmDebuggerLogic = new VmDebuggerLogic(this, this.transactionDebugger.debugger.traceManager, this.transactionDebugger.debugger.codeManager, this.transactionDebugger.debugger.solidityProxy, this.transactionDebugger.debugger.callTree)
    this.vmDebugger = new VmDebugger(this.vmDebuggerLogic)
    this.andAddVmDebugger()

    this.transactionDebugger.debugger.debug(tx)
  }

  debug (txHash) {
    const self = this
    this.transactionDebugger.debugger.web3.eth.getTransaction(txHash, (error, tx) => {
      if (error) {
        return console.error("coudn't get txHash: " + error)
      }
      self.transactionDebugger.debugger.solidityProxy.reset({})

      if (tx instanceof Object) {
        self.txBrowser.load(tx.hash, tx)
      } else if (tx instanceof String) {
        self.txBrowser.load(tx)
      }
    })
  }

  updateWeb3Reference (web3) {
    if (!this.txBrowser) return
    this.txBrowser.web3 = web3 || executionContext.web3()
  }

  render () {
    this.debuggerPanelsView = yo`<div class="${css.innerShift}"></div>`
    this.debuggerHeadPanelsView = yo`<div class="${css.innerShift}"></div>`
    this.stepManagerView = yo`<div class="${css.innerShift}"></div>`

    var view = yo`<div>
        <div class="${css.innerShift}">
          ${this.txBrowser.render()}
          ${this.debuggerHeadPanelsView}
          ${this.stepManagerView}
        </div>
        <div class="${css.statusMessage}" >${this.statusMessage}</div>
        ${this.debuggerPanelsView}
     </div>`
    if (!this.view) {
      this.view = view
    }
    return view
  }

  unLoad () {
    this.debugger.unLoad()
    yo.update(this.debuggerHeadPanelsView, yo`<div></div>`)
    yo.update(this.debuggerPanelsView, yo`<div></div>`)
    yo.update(this.stepManagerView, yo`<div></div>`)
    if (this.vmDebugger) this.vmDebugger.remove()
    if (this.stepManager) this.stepManager.remove()
    this.vmDebugger = null
    this.stepManager = null
    this.event.trigger('traceUnloaded')
  }

  stepChanged (stepIndex) {
    this.currentStepIndex = stepIndex
    this.event.trigger('indexChanged', [stepIndex])
  }

  UIstartDebugging (blockNumber, txIndex, tx) {
    const self = this
    if (this.debugger.traceManager.isLoading) {
      return false
    }

    this.tx = tx

    this.debugger.codeManager.event.register('changed', this, (code, address, instIndex) => {
      self.debugger.callTree.sourceLocationTracker.getSourceLocationFromVMTraceIndex(address, this.currentStepIndex, this.debugger.solidityProxy.contracts, (error, sourceLocation) => {
        if (!error) {
          self.event.trigger('sourceLocationChanged', [sourceLocation])
        }
      })
    })

    return true
  }

  andAddVmDebugger () {
    yo.update(this.debuggerHeadPanelsView, this.vmDebugger.renderHead())
    yo.update(this.debuggerPanelsView, this.vmDebugger.render())
    yo.update(this.stepManagerView, this.stepManager.render())
  }

}

module.exports = DebuggerUI
