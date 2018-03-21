'use strict'
var remixCore = require('remix-core')
var TraceManager = remixCore.trace.TraceManager
var remixLib = require('remix-lib')
var global = remixLib.global
var init = remixLib.init
var executionContext = remixLib.execution.executionContext
var EventManager = remixLib.EventManager
var Web3Providers = remixLib.vm.Web3Providers
var DummyProvider = remixLib.vm.DummyProvider
var CodeManager = remixCore.code.CodeManager
var remixSolidity = require('remix-solidity')
var SolidityProxy = remixSolidity.SolidityProxy
var InternalCallTree = remixSolidity.InternalCallTree

/**
  * Ethdebugger is a wrapper around a few classes that helps debugging a transaction
  *
  * - Web3Providers - define which environment (web3) the transaction will be retrieved from
  * - TraceManager - Load / Analyze the trace and retrieve details of specific test
  * - CodeManager - Retrieve loaded byte code and help to resolve AST item from vmtrace index
  * - SolidityProxy - Basically used to extract state variable from AST
  * - Breakpoint Manager - Used to add / remove / jumpto breakpoint
  * - InternalCallTree - Used to retrieved local variables
  *
  * @param {Map} opts  -  { function compilationResult } //
  */
function Ethdebugger (opts) {
  this.opts = opts || {}
  if (!this.opts.compilationResult) this.opts.compilationResult = () => { return null }

  var self = this
  this.event = new EventManager()

  this.tx

  this.web3Providers = new Web3Providers()
  this.addProvider('DUMMYWEB3', new DummyProvider())
  this.switchProvider('DUMMYWEB3')

  this.traceManager = new TraceManager()
  this.codeManager = new CodeManager(this.traceManager)
  this.solidityProxy = new SolidityProxy(this.traceManager, this.codeManager)

  this.callTree = new InternalCallTree(this.event, this.traceManager, this.solidityProxy, this.codeManager, { includeLocalVariables: true })

  this.event.register('indexChanged', this, function (index) {
    self.codeManager.resolveStep(index, self.tx)
  })
}

Ethdebugger.prototype.sourceLocationFromVMTraceIndex = function (address, stepIndex, callback) {
  this.callTree.sourceLocationTracker.getSourceLocationFromVMTraceIndex(address, stepIndex, this.solidityProxy.contracts, (error, rawLocation) => {
    callback(error, rawLocation)
  })
}

Ethdebugger.prototype.sourceLocationFromInstructionIndex = function (address, instIndex, callback) {
  this.debugger.callTree.sourceLocationTracker.getSourceLocationFromInstructionIndex(address, instIndex, this.solidityProxy.contracts, function (error, rawLocation) {
    callback(error, rawLocation)
  })
}

Ethdebugger.prototype.setBreakpointManager = function (breakpointManager) {
  this.breakpointManager = breakpointManager
}

Ethdebugger.prototype.resolveStep = function (index) {
  this.codeManager.resolveStep(index, this.tx)
}

Ethdebugger.prototype.web3 = function () {
  return global.web3
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
      global.web3 = obj
      executionContext.detectNetwork((error, network) => {
        if (error || !network) {
          global.web3Debug = obj
        } else {
          var webDebugNode = init.web3DebugNode(network.name)
          global.web3Debug = !webDebugNode ? obj : webDebugNode
        }
      })
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
  this.setCompilationResult(this.opts.compilationResult())
  if (tx instanceof Object) {
    this.txBrowser.load(tx.hash)
  } else if (tx instanceof String) {
    this.txBrowser.load(tx)
  }
}

Ethdebugger.prototype.unLoad = function () {
  this.traceManager.init()
  this.codeManager.clear()
  this.stepManager.reset()
  this.event.trigger('traceUnloaded')
}

Ethdebugger.prototype.debug = function (blockNumber, txIndex, tx) {
  if (this.traceManager.isLoading) {
    return
  }
  this.setCompilationResult(this.opts.compilationResult())
  console.log('loading trace...')
  this.tx = tx
  var self = this
  this.traceManager.resolveTrace(tx, function (error, result) {
    console.log('trace loaded ' + result)
    if (result) {
      self.event.trigger('newTraceLoaded', [self.traceManager.trace])
      if (self.breakpointManager && self.breakpointManager.hasBreakpoint()) {
        self.breakpointManager.jumpNextBreakpoint(false)
      }
    } else {
      self.statusMessage = error ? error.message : 'Trace not loaded'
    }
  })
}

module.exports = Ethdebugger
