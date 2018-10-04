var TxBrowser = require('./debuggerUI/TxBrowser')
var StepManagerUI = require('./debuggerUI/StepManager')
var VmDebugger = require('./debuggerUI/VmDebugger')

var Debugger = require('./debugger/debugger')

var SourceHighlighter = require('../editor/sourceHighlighter')

var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager
var traceHelper = remixLib.helpers.trace

var executionContext = require('../../execution-context')
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

    this.registry = globalRegistry
    this.event = new EventManager()

    this.transactionDebugger = new Debugger({
      executionContext: executionContext,
      offsetToLineColumnConverter: this.registry.get('offsettolinecolumnconverter').api,
      compiler: this.registry.get('compiler').api
    })

    this.debugger = this.transactionDebugger.debugger
    this.isActive = false

    this.sourceHighlighter = new SourceHighlighter()

    this.startTxBrowser()
    this.stepManager = null

    this.tx
    this.statusMessage = ''

    this.view

    this.event.register('indexChanged', this, function (index) {
      self.debugger.codeManager.resolveStep(index, self.tx)
      self.transactionDebugger.step_manager.event.trigger('indexChanged', [index])
      self.transactionDebugger.vmDebuggerLogic.event.trigger('indexChanged', [index])
    })

    container.appendChild(this.render())

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
      self.debugger.unLoad()
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
    let txBrowser = new TxBrowser()
    this.txBrowser = txBrowser

    txBrowser.event.register('requestDebug', function (blockNumber, txNumber, tx) {
      self.debugger.unLoad()
      self.unLoad()
      self.getTxAndDebug(blockNumber, txNumber, tx)
    })

    txBrowser.event.register('unloadRequested', this, function (blockNumber, txIndex, tx) {
      self.debugger.unLoad()
      self.unLoad()
    })
  }

  isDebuggerActive () {
    return this.isActive
  }

  getTxAndDebug (blockNumber, txNumber, tx) {
    const self = this
    let web3 = executionContext.web3()

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
          self.txBrowser.update(error, result)
          self.startDebugging(blockNumber, txNumber, tx)
        })
      }
      web3.eth.getTransactionFromBlock(blockNumber, txNumber, function (error, result) {
        let tx = result
        self.txBrowser.update(error, result)
        self.startDebugging(blockNumber, txNumber, tx)
      })
    } catch (e) {
      console.error(e.message)
    }
  }

  startDebugging (blockNumber, txNumber, tx) {
    const self = this

    if (this.debugger.traceManager.isLoading) {
      return
    }

    // TODO: move this to a param to .debug()
    // still here because tx is being reffered in children
    this.tx = tx

    this.transactionDebugger.debug(tx, () => {
      self.stepManager = new StepManagerUI(this.transactionDebugger.step_manager)
      self.stepManager.event.register('stepChanged', this, function (stepIndex) {
        self.stepManager.currentStepIndex = stepIndex
        self.event.trigger('indexChanged', [stepIndex])
      })

      self.vmDebugger = new VmDebugger(this.transactionDebugger.vmDebuggerLogic)
      self.andAddVmDebugger()
    })
  }

  debug (txHash) {
    const self = this
    let web3 = executionContext.web3()
    web3.eth.getTransaction(txHash, (error, tx) => {
      if (error) {
        return console.error("coudn't get txHash: " + error)
      }
      self.transactionDebugger.debugger.solidityProxy.reset({})

      if (tx instanceof Object) {
        self.txBrowser.load(tx.hash, tx)
        self.getTxAndDebug(null, tx.hash, tx)
      } else if (tx instanceof String) {
        self.txBrowser.load(tx)
        self.getTxAndDebug(null, tx)
      }
    })
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
    yo.update(this.debuggerHeadPanelsView, yo`<div></div>`)
    yo.update(this.debuggerPanelsView, yo`<div></div>`)
    yo.update(this.stepManagerView, yo`<div></div>`)
    if (this.vmDebugger) this.vmDebugger.remove()
    if (this.stepManager) this.stepManager.remove()
    this.vmDebugger = null
    this.stepManager = null
    this.event.trigger('traceUnloaded')
  }

  andAddVmDebugger () {
    yo.update(this.debuggerHeadPanelsView, this.vmDebugger.renderHead())
    yo.update(this.debuggerPanelsView, this.vmDebugger.render())
    yo.update(this.stepManagerView, this.stepManager.render())
  }

}

module.exports = DebuggerUI
