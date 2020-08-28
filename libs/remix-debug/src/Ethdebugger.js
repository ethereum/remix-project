'use strict'

const StorageViewer = require('./storage/storageViewer')
const StorageResolver = require('./storage/storageResolver')

const TraceManager = require('./trace/traceManager')
const CodeManager = require('./code/codeManager')
const traceHelper = require('./trace/traceHelper')
const EventManager = require('./eventManager')

const {SolidityProxy, stateDecoder, localDecoder, InternalCallTree} = require('./solidity-decoder')

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
  this.compilationResult = opts.compilationResult || function (contractAddress) { return null }
  this.web3 = opts.web3

  this.event = new EventManager()

  this.tx

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
  this.event.trigger('managersChanged')
}

Ethdebugger.prototype.resolveStep = function (index) {
  this.codeManager.resolveStep(index, this.tx)
}

Ethdebugger.prototype.setCompilationResult = function (compilationResult) {
  this.solidityProxy.reset((compilationResult && compilationResult.data) || {})
}

Ethdebugger.prototype.sourceLocationFromVMTraceIndex = async function (address, stepIndex) {
  return this.callTree.sourceLocationTracker.getSourceLocationFromVMTraceIndex(address, stepIndex, this.solidityProxy.contracts)
}

Ethdebugger.prototype.sourceLocationFromInstructionIndex = async function (address, instIndex, callback) {
  return this.callTree.sourceLocationTracker.getSourceLocationFromInstructionIndex(address, instIndex, this.solidityProxy.contracts)
}

/* breakpoint */
Ethdebugger.prototype.setBreakpointManager = function (breakpointManager) {
  this.breakpointManager = breakpointManager
}

/* decode locals */
Ethdebugger.prototype.extractLocalsAt = function (step) {
  return this.callTree.findScope(step)
}

Ethdebugger.prototype.decodeLocalsAt = async function (step, sourceLocation, callback) {
  try {
    const stack = this.traceManager.getStackAt(step)
    const memory = this.traceManager.getMemoryAt(step)
    const address = this.traceManager.getCurrentCalledAddressAt(step)
    try {
      const storageViewer = new StorageViewer({ stepIndex: step, tx: this.tx, address: address }, this.storageResolver, this.traceManager)
      const locals = await localDecoder.solidityLocals(step, this.callTree, stack, memory, storageViewer, sourceLocation)
      if (locals.error) {
        return callback(locals.error)
      }
      return callback(null, locals)
    } catch (e) {
      callback(e.message)
    }
  } catch (error) {
    callback(error)
  }
}

/* decode state */
Ethdebugger.prototype.extractStateAt = async function (step) {
  return this.solidityProxy.extractStateVariablesAt(step)
}

Ethdebugger.prototype.decodeStateAt = async function (step, stateVars, callback) {
  try {
    const address = this.traceManager.getCurrentCalledAddressAt(step)
    const storageViewer = new StorageViewer({stepIndex: step, tx: this.tx, address: address}, this.storageResolver, this.traceManager)
    const result = await stateDecoder.decodeState(stateVars, storageViewer)
    return result
  } catch (error) {
    callback(error)
  }
}

Ethdebugger.prototype.storageViewAt = function (step, address) {
  return new StorageViewer({stepIndex: step, tx: this.tx, address: address}, this.storageResolver, this.traceManager)
}

Ethdebugger.prototype.updateWeb3 = function (web3) {
  this.web3 = web3
  this.setManagers()
}

Ethdebugger.prototype.unLoad = function () {
  this.traceManager.init()
  this.codeManager.clear()
  this.event.trigger('traceUnloaded')
}

Ethdebugger.prototype.debug = function (tx) {
  if (this.traceManager.isLoading) {
    return
  }
  tx.to = tx.to || traceHelper.contractCreationToken('0')
  this.tx = tx

  this.traceManager.resolveTrace(tx).then(async (result) => {
    this.setCompilationResult(await this.compilationResult(tx.to))
    this.event.trigger('newTraceLoaded', [this.traceManager.trace])
    if (this.breakpointManager && this.breakpointManager.hasBreakpoint()) {
      this.breakpointManager.jumpNextBreakpoint(false)
    }
    this.storageResolver = new StorageResolver({web3: this.traceManager.web3})
  }).catch((error) => {
    this.statusMessage = error ? error.message : 'Trace not loaded'
  })
}

module.exports = Ethdebugger
