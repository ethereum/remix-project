'use strict'
var Ethdebugger = require('../Ethdebugger')
var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager
var traceHelper = remixLib.helpers.trace
var OffsetToColumnConverter = remixLib.OffsetToColumnConverter

var StepManager = require('./stepManager')
var VmDebuggerLogic = require('./VmDebugger')

function Debugger (options) {
  var self = this
  this.event = new EventManager()

  this.offsetToLineColumnConverter = options.offsetToLineColumnConverter || (new OffsetToColumnConverter())
  this.compiler = options.compiler

  this.debugger = new Ethdebugger({
    web3: options.web3,
    compilationResult: () => {
      var compilationResult = this.compiler.lastCompilationResult
      if (compilationResult) {
        return compilationResult.data
      }
      return null
    }
  })

  this.breakPointManager = new remixLib.code.BreakpointManager(this.debugger, (sourceLocation) => {
    return self.offsetToLineColumnConverter.offsetToLineColumn(sourceLocation, sourceLocation.file, this.compiler.lastCompilationResult.source.sources, this.compiler.lastCompilationResult.data.sources)
  }, (step) => {
    self.event.trigger('breakpointStep', [step])
  })

  this.debugger.setBreakpointManager(this.breakPointManager)

  this.debugger.event.register('newTraceLoaded', this, function () {
    self.event.trigger('debuggerStatus', [true])
  })

  this.debugger.event.register('traceUnloaded', this, function () {
    self.event.trigger('debuggerStatus', [false])
  })

  this.event.register('breakpointStep', function (step) {
    self.step_manager.jumpTo(step)
  })
}

Debugger.prototype.registerAndHighlightCodeItem = function (index) {
  const self = this
  // register selected code item, highlight the corresponding source location
  if (!self.compiler.lastCompilationResult) return
  self.debugger.traceManager.getCurrentCalledAddressAt(index, (error, address) => {
    if (error) return console.log(error)
    self.debugger.callTree.sourceLocationTracker.getSourceLocationFromVMTraceIndex(address, index, self.compiler.lastCompilationResult.data.contracts, function (error, rawLocation) {
      if (!error && self.compiler.lastCompilationResult && self.compiler.lastCompilationResult.data) {
        var lineColumnPos = self.offsetToLineColumnConverter.offsetToLineColumn(rawLocation, rawLocation.file, self.compiler.lastCompilationResult.source.sources, self.compiler.lastCompilationResult.data.sources)
        self.event.trigger('newSourceLocation', [lineColumnPos, rawLocation])
      } else {
        self.event.trigger('newSourceLocation', [null])
      }
    })
  })
}

Debugger.prototype.updateWeb3 = function (web3) {
  this.debugger.web3 = web3
}

Debugger.prototype.debug = function (blockNumber, txNumber, tx, loadingCb) {
  let web3 = this.debugger.web3

  return new Promise((resolve, reject) => {
    if (this.debugger.traceManager.isLoading) {
      return resolve()
    }

    if (tx) {
      if (!tx.to) {
        tx.to = traceHelper.contractCreationToken('0')
      }
      this.debugTx(tx, loadingCb)
      return resolve()
    }

    try {
      if (txNumber.indexOf('0x') !== -1) {
        return web3.eth.getTransaction(txNumber, (_error, tx) => {
          if (_error) return reject(_error)
          if (!tx) return reject('cannot find transaction ' + txNumber)
          this.debugTx(tx, loadingCb)
          return resolve()
        })
      }
      web3.eth.getTransactionFromBlock(blockNumber, txNumber, (_error, tx) => {
        if (_error) return reject(_error)
        if (!tx) return reject('cannot find transaction ' + blockNumber + ' ' + txNumber)
        this.debugTx(tx, loadingCb)
        return resolve()
      })
    } catch (e) {
      return reject(e.message)
    }
  })
}

Debugger.prototype.debugTx = function (tx, loadingCb) {
  const self = this
  this.step_manager = new StepManager(this.debugger, this.debugger.traceManager)

  this.debugger.codeManager.event.register('changed', this, (code, address, instIndex) => {
    self.debugger.callTree.sourceLocationTracker.getSourceLocationFromVMTraceIndex(address, this.step_manager.currentStepIndex, this.debugger.solidityProxy.contracts, (error, sourceLocation) => {
      if (!error) {
        self.vmDebuggerLogic.event.trigger('sourceLocationChanged', [sourceLocation])
      }
    })
  })

  this.vmDebuggerLogic = new VmDebuggerLogic(this.debugger, tx, this.step_manager, this.debugger.traceManager, this.debugger.codeManager, this.debugger.solidityProxy, this.debugger.callTree)
  this.vmDebuggerLogic.start()

  this.step_manager.event.register('stepChanged', this, function (stepIndex) {
    if (typeof stepIndex !== 'number' || stepIndex >= self.step_manager.traceLength) {
      return self.event.trigger('endDebug')
    }

    self.debugger.codeManager.resolveStep(stepIndex, tx)
    self.step_manager.event.trigger('indexChanged', [stepIndex])
    self.vmDebuggerLogic.event.trigger('indexChanged', [stepIndex])
    self.registerAndHighlightCodeItem(stepIndex)
  })

  loadingCb()
  this.debugger.debug(tx)
}

Debugger.prototype.unload = function () {
  this.debugger.unLoad()
  this.event.trigger('debuggerUnloaded')
}

module.exports = Debugger
