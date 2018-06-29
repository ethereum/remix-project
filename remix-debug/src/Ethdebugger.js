'use strict'

var StorageViewer = require('./storage/storageViewer')
var StorageResolver = require('./storage/storageResolver')

var SolidityProxy = require('./decoder/solidityProxy')
var stateDecoder = require('./decoder/stateDecoder')
var localDecoder = require('./decoder/localDecoder')
var InternalCallTree = require('./decoder/internalCallTree')

var remixLib = require('remix-lib')
var TraceManager = remixLib.trace.traceManager
var CodeManager = remixLib.code.CodeManager
var traceHelper = remixLib.helpers.trace
var init = remixLib.init
var executionContext = remixLib.execution.executionContext
var EventManager = remixLib.EventManager
var Web3Providers = remixLib.vm.Web3Providers
var DummyProvider = remixLib.vm.DummyProvider

/**
  * Ethdebugger is a wrapper around a few classes that helps debugging a transaction
  *
  * - Web3Providers - define which environment (web3) the transaction will be retrieved from
  * - TraceManager - Load / Analyze the trace and retrieve details of specific test
  * - CodeManager - Retrieve loaded byte code and help to resolve AST item from vmtrace index
  * - SolidityProxy - Basically used to extract state variable from AST
  * - Breakpoint Manager - Used to add / remove / jumpto breakpoint
  * - InternalCallTree - Used to retrieved local variables
  * - StorageResolver - Help resolving the storage accross different steps
  *
  * @param {Map} opts  -  { function compilationResult } //
  */
function Ethdebugger (opts) {
  this.opts = opts || {}
  if (!this.opts.compilationResult) this.opts.compilationResult = () => { return null }

  this.web3 = opts.web3

  this.event = new EventManager()

  this.tx

  this.web3Providers = new Web3Providers()
  this.addProvider('DUMMYWEB3', new DummyProvider())
  this.switchProvider('DUMMYWEB3')

  this.traceManager = new TraceManager({web3: this.web3})
  this.codeManager = new CodeManager(this.traceManager)
  this.solidityProxy = new SolidityProxy(this.traceManager, this.codeManager)
  this.storageResolver = null

  this.callTree = new InternalCallTree(this.event, this.traceManager, this.solidityProxy, this.codeManager, { includeLocalVariables: true })
}

Ethdebugger.prototype.setManagers = function () {
  this.traceManager = new TraceManager({web3: this.web3})
  this.codeManager = new CodeManager(this.traceManager)
  this.solidityProxy = new SolidityProxy(this.traceManager, this.codeManager)
  this.storageResolver = null

  this.callTree = new InternalCallTree(this.event, this.traceManager, this.solidityProxy, this.codeManager, { includeLocalVariables: true })
}

Ethdebugger.prototype.resolveStep = function (index) {
  this.codeManager.resolveStep(index, this.tx)
}

Ethdebugger.prototype.setCompilationResult = function (compilationResult) {
  if (compilationResult && compilationResult.sources && compilationResult.contracts) {
    this.solidityProxy.reset(compilationResult)
  } else {
    this.solidityProxy.reset({})
  }
}

/* resolve source location */
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

/* breakpoint */
Ethdebugger.prototype.setBreakpointManager = function (breakpointManager) {
  this.breakpointManager = breakpointManager
}

/* decode locals */
Ethdebugger.prototype.extractLocalsAt = function (step, callback) {
  callback(null, this.callTree.findScope(step))
}

Ethdebugger.prototype.decodeLocalsAt = function (step, sourceLocation, callback) {
  this.traceManager.waterfall([
    this.traceManager.getStackAt,
    this.traceManager.getMemoryAt,
    this.traceManager.getCurrentCalledAddressAt],
    step,
    (error, result) => {
      if (!error) {
        var stack = result[0].value
        var memory = result[1].value
        try {
          var storageViewer = new StorageViewer({
            stepIndex: step,
            tx: this.tx,
            address: result[2].value
          }, this.storageResolver, this.traceManager)
          localDecoder.solidityLocals(step, this.callTree, stack, memory, storageViewer, sourceLocation).then((locals) => {
            if (!locals.error) {
              callback(null, locals)
            } else {
              callback(locals.error)
            }
          })
        } catch (e) {
          callback(e.message)
        }
      } else {
        callback(error)
      }
    })
}

/* decode state */
Ethdebugger.prototype.extractStateAt = function (step, callback) {
  this.solidityProxy.extractStateVariablesAt(step, function (error, stateVars) {
    callback(error, stateVars)
  })
}

Ethdebugger.prototype.decodeStateAt = function (step, stateVars, callback) {
  this.traceManager.getCurrentCalledAddressAt(step, (error, address) => {
    if (error) return callback(error)
    var storageViewer = new StorageViewer({
      stepIndex: step,
      tx: this.tx,
      address: address
    }, this.storageResolver, this.traceManager)
    stateDecoder.decodeState(stateVars, storageViewer).then((result) => {
      if (!result.error) {
        callback(null, result)
      } else {
        callback(result.error)
      }
    })
  })
}

Ethdebugger.prototype.storageViewAt = function (step, address) {
  return new StorageViewer({
    stepIndex: step,
    tx: this.tx,
    address: address
  }, this.storageResolver, this.traceManager)
}
/* set env */
Ethdebugger.prototype.web3 = function () {
  return this.web3
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
      self.web3 = obj
      self.setManagers()
      // self.traceManager.web3 = self.web3
      executionContext.detectNetwork((error, network) => {
        if (error || !network) {
          self.web3Debug = obj
          self.web3 = obj
        } else {
          var webDebugNode = init.web3DebugNode(network.name)
          self.web3Debug = !webDebugNode ? obj : webDebugNode
          self.web3 = !webDebugNode ? obj : webDebugNode
        }
        self.setManagers()
      })
      self.event.trigger('providerChanged', [type])
    }
  })
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

Ethdebugger.prototype.debug = function (tx) {
  if (this.traceManager.isLoading) {
    return
  }
  if (!tx.to) {
    tx.to = traceHelper.contractCreationToken('0')
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
      self.storageResolver = new StorageResolver({web3: self.traceManager.web3})
    } else {
      self.statusMessage = error ? error.message : 'Trace not loaded'
    }
  })
}

module.exports = Ethdebugger
