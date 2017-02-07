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
var SolidityProxy = require('../solidity/solidityProxy')
var InternalCallTree = require('../util/internalCallTree')

function Ethdebugger () {
  var self = this
  this.event = new EventManager()

  this.currentStepIndex = -1
  this.tx
  this.statusMessage = ''

  this.view
  this.web3Providers = new Web3Providers()
  this.addProvider('DUMMYWEB3', new DummyProvider())
  this.switchProvider('DUMMYWEB3')
  this.traceManager = new TraceManager()
  this.codeManager = new CodeManager(this.traceManager)
  this.solidityProxy = new SolidityProxy(this.traceManager, this.codeManager)

  var callTree = new InternalCallTree(this.event, this.traceManager, this.solidityProxy, this.codeManager, { includeLocalVariables: true })
  this.callTree = callTree // TODO: currently used by browser solidity, we should improve the API

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
  this.vmDebugger = new VmDebugger(this, this.traceManager, this.codeManager, this.solidityProxy, callTree)

  this.codeManager.event.register('changed', this, (code, address, instIndex) => {
    this.callTree.sourceLocationTracker.getSourceLocationFromVMTraceIndex(address, this.currentStepIndex, this.solidityProxy.contracts, (error, sourceLocation) => {
      if (!error) {
        this.event.trigger('sourceLocationChanged', [sourceLocation])
      }
    })
  })
}

Ethdebugger.prototype.setBreakpointManager = function (breakpointManager) {
  this.breakpointManager = breakpointManager
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
    this.solidityProxy.reset(compilationResult)
  } else {
    this.solidityProxy.reset({})
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
      self.event.trigger('newTraceLoaded', [self.traceManager.trace])
      if (self.breakpointManager && self.breakpointManager.hasBreakpoint()) {
        self.breakpointManager.jumpNextBreakpoint(false)
      }
    } else {
      self.statusMessage = error ? error.message : 'Trace not loaded'
      yo.update(self.view, self.render())
    }
  })
}

module.exports = Ethdebugger
