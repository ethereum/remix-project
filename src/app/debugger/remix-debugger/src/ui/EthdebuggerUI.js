'use strict'
var TxBrowser = require('./TxBrowser')
var StepManager = require('./StepManager')
var VmDebugger = require('./VmDebugger')

var yo = require('yo-yo')
var csjs = require('csjs-inject')

var remixLib = require('remix-lib')
var executionContext = remixLib.execution.executionContext
var EventManager = remixLib.EventManager

var css = csjs`
  .statusMessage {
    margin-left: 15px;
  }
  .innerShift {
    padding: 2px;
    margin-left: 10px;
  }
`

function EthdebuggerUI (opts) {
  this.opts = opts || {}
  this.debugger = opts.debugger

  if (!this.opts.compilationResult) this.opts.compilationResult = () => { return null }

  var self = this
  this.event = new EventManager()

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

  this.txBrowser = new TxBrowser(this, {displayConnectionSetting: false, web3: executionContext.web3()})
  this.txBrowser.event.register('newTxLoading', this, function () {
    self.unLoad()
  })
  this.txBrowser.event.register('newTraceRequested', this, function (blockNumber, txIndex, tx) {
    self.startDebugging(blockNumber, txIndex, tx)
  })
  this.txBrowser.event.register('unloadRequested', this, function (blockNumber, txIndex, tx) {
    self.unLoad()
  })
}

EthdebuggerUI.prototype.setBreakpointManager = function (breakpointManager) {
  this.breakpointManager = breakpointManager
}

EthdebuggerUI.prototype.get_web3 = function () {
  return this.web3
}

EthdebuggerUI.prototype.updateWeb3Reference = function (web3) {
  if (!this.txBrowser) return
  this.txBrowser.web3 = web3 || executionContext.web3()
}

EthdebuggerUI.prototype.setCompilationResult = function (compilationResult) {
  if (compilationResult && compilationResult.sources && compilationResult.contracts) {
    this.debugger.solidityProxy.reset(compilationResult)
  } else {
    this.debugger.solidityProxy.reset({})
  }
}

EthdebuggerUI.prototype.debug = function (tx) {
  this.setCompilationResult(this.opts.compilationResult())
  if (tx instanceof Object) {
    this.txBrowser.load(tx.hash, tx)
  } else if (tx instanceof String) {
    this.txBrowser.load(tx)
  }
}

EthdebuggerUI.prototype.render = function () {
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

EthdebuggerUI.prototype.unLoad = function () {
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

EthdebuggerUI.prototype.stepChanged = function (stepIndex) {
  this.currentStepIndex = stepIndex
  this.event.trigger('indexChanged', [stepIndex])
}

EthdebuggerUI.prototype.startDebugging = function (blockNumber, txIndex, tx) {
  const self = this
  if (this.debugger.traceManager.isLoading) {
    return
  }

  this.tx = tx

  this.stepManager = new StepManager(this, this.debugger.traceManager)
  this.stepManager.event.register('stepChanged', this, function (stepIndex) {
    self.stepChanged(stepIndex)
  })

  this.debugger.codeManager.event.register('changed', this, (code, address, instIndex) => {
    self.debugger.callTree.sourceLocationTracker.getSourceLocationFromVMTraceIndex(address, this.currentStepIndex, this.debugger.solidityProxy.contracts, (error, sourceLocation) => {
      if (!error) {
        self.event.trigger('sourceLocationChanged', [sourceLocation])
      }
    })
  })

  this.vmDebugger = new VmDebugger(this, this.debugger.traceManager, this.debugger.codeManager, this.debugger.solidityProxy, this.debugger.callTree)
  yo.update(this.debuggerHeadPanelsView, this.vmDebugger.renderHead())
  yo.update(this.debuggerPanelsView, this.vmDebugger.render())
  yo.update(this.stepManagerView, this.stepManager.render())

  this.debugger.debug(tx)
}

module.exports = EthdebuggerUI
