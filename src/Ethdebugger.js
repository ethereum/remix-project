'use strict'
var TxBrowser = require('./TxBrowser')
var StepManager = require('./StepManager')
var TraceManager = require('./trace/traceManager')
var VmDebugger = require('./VmDebugger')
var style = require('./basicStyles')
var util = require('./helpers/global')
var EventManager = require('./lib/eventManager')
var yo = require('yo-yo')
var init = require('./helpers/init')
var ui = require('./helpers/ui')

function Ethdebugger (_context) {
  util.extend(this, new EventManager())
  this.context = _context
  this.currentStepIndex = -1
  this.tx

  this.web3 = init.loadWeb3()
  this.traceManager = new TraceManager(this.web3)

  var self = this
  this.txBrowser = new TxBrowser(this.web3)
  this.txBrowser.register('newTxRequested', this, function (blockNumber, txIndex, tx) {
    self.startDebugging(blockNumber, txIndex, tx)
  })
  this.stepManager = new StepManager(this, this.traceManager)
  this.stepManager.register('stepChanged', this, function (stepIndex) {
    self.stepChanged(stepIndex)
  })
  this.vmDebugger = new VmDebugger(this, this.traceManager, this.web3)
}

Ethdebugger.prototype.render = function () {
  var self = this
  return (
  yo`<div style=${ui.formatCss(style.font)}>
        <h1 style=${ui.formatCss(style.container)}>Eth Debugger</h1>
        <div onclick=${function () { self.unLoad() }}>X</div>
        ${this.txBrowser.render()}
        ${this.stepManager.render()}
        ${this.vmDebugger.render()}
     </div>`
  )
}

Ethdebugger.prototype.unLoad = function () {
  this.traceManager.init()
  this.stepManager.init()
  this.trigger('traceUnloaded')
}

Ethdebugger.prototype.stepChanged = function (stepIndex) {
  this.currentStepIndex = stepIndex
  this.trigger('indexChanged', [stepIndex])
}

Ethdebugger.prototype.startDebugging = function (blockNumber, txIndex, tx) {
  if (this.traceManager.isLoading) {
    return
  }
  console.log('loading trace...')
  this.tx = tx
  var self = this
  this.traceManager.resolveTrace(tx, function (success) {
    console.log('trace loaded ' + success)
    if (success) {
      self.trigger('newTraceLoaded')
    } else {
      console.log('trace not loaded')
    }
  })
}

module.exports = Ethdebugger
