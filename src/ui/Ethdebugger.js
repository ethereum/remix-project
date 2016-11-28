'use strict'
var TxBrowser = require('./TxBrowser')
var StepManager = require('./StepManager')
var TraceManager = require('../trace/traceManager')
var VmDebugger = require('./VmDebugger')
var style = require('./styles/basicStyles')
var util = require('../helpers/global')
var EventManager = require('../lib/eventManager')
var yo = require('yo-yo')
var ui = require('../helpers/ui')
var Web3Providers = require('../web3Provider/web3Providers')
var DummyProvider = require('../web3Provider/dummyProvider')
var CodeManager = require('../code/codeManager')
var SourceLocationTracker = require('../code/sourceLocationTracker')

function Ethdebugger () {
  this.event = new EventManager()

  this.currentStepIndex = -1
  this.tx
  this.sources
  this.contractsDetail
  this.statusMessage = ''

  this.view
  this.web3Providers = new Web3Providers()
  this.addProvider('DUMMYWEB3', new DummyProvider())
  this.switchProvider('DUMMYWEB3')
  this.traceManager = new TraceManager()
  this.codeManager = new CodeManager(this.traceManager)
  this.sourceLocationTracker = new SourceLocationTracker(this.codeManager)

  var self = this
  this.event.register('indexChanged', this, function (index) {
    self.codeManager.resolveStep(index, self.tx)
  })

  this.txBrowser = new TxBrowser(this)
  this.txBrowser.event.register('newTxLoading', this, function () {
    self.unLoad()
  })
  this.txBrowser.event.register('newTraceRequested', this, function (blockNumber, txIndex, tx) {
    self.startDebugging(blockNumber, txIndex, tx)
  })
  this.txBrowser.event.register('unloadRequested', this, function (blockNumber, txIndex, tx) {
    self.unLoad()
  })
  this.stepManager = new StepManager(this, this.traceManager)
  this.stepManager.event.register('stepChanged', this, function (stepIndex) {
    self.stepChanged(stepIndex)
  })
  this.vmDebugger = new VmDebugger(this, this.traceManager, this.codeManager)
}

Ethdebugger.prototype.web3 = function () {
  return util.web3
}

Ethdebugger.prototype.addProvider = function (type, obj) {
  this.web3Providers.addProvider(type, obj)
  this.event.trigger('providerAdded', [type])
}

Ethdebugger.prototype.switchProvider = function (type) {
  var self = this
  this.web3Providers.get(type, function (error, obj) {
    if (error) {
      console.log('provider ' + type + ' not defined')
    } else {
      util.web3 = obj
      self.event.trigger('providerChanged', [type])
    }
  })
}

Ethdebugger.prototype.setCompilationResult = function (compilationResult) {
  if (compilationResult && compilationResult.sources && compilationResult.contracts) {
    this.sources = compilationResult.sources
    this.contractsDetail = compilationResult.contracts
  } else {
    this.sources = null
    this.contractsDetail = null
  }
}

Ethdebugger.prototype.debug = function (tx) {
  if (tx instanceof Object) {
    this.txBrowser.load(tx.hash)
  } else if (tx instanceof String) {
    this.txBrowser.load(tx)
  }
}

Ethdebugger.prototype.render = function () {
  var view = yo`<div style=${ui.formatCss(style.font)}>
        <div style=${ui.formatCss(style.innerShift)}>
          ${this.txBrowser.render()}
          ${this.stepManager.render()}
        </div>
        <div style=${ui.formatCss(style.statusMessage)} >${this.statusMessage}</div>
        ${this.vmDebugger.render()}
     </div>`
  if (!this.view) {
    this.view = view
  }
  return view
}

Ethdebugger.prototype.unLoad = function () {
  this.traceManager.init()
  this.codeManager.clear()
  this.stepManager.reset()
  this.event.trigger('traceUnloaded')
}

Ethdebugger.prototype.stepChanged = function (stepIndex) {
  this.currentStepIndex = stepIndex
  this.event.trigger('indexChanged', [stepIndex])
}

Ethdebugger.prototype.startDebugging = function (blockNumber, txIndex, tx) {
  if (this.traceManager.isLoading) {
    return
  }
  this.statusMessage = 'Loading trace...'
  yo.update(this.view, this.render())
  console.log('loading trace...')
  this.tx = tx
  var self = this
  this.traceManager.resolveTrace(tx, function (error, result) {
    console.log('trace loaded ' + result)
    if (result) {
      self.statusMessage = ''
      yo.update(self.view, self.render())
      self.event.trigger('newTraceLoaded')
    } else {
      self.statusMessage = error
      yo.update(self.view, self.render())
    }
  })
}

module.exports = Ethdebugger
