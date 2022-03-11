'use strict'

import { StorageViewer } from './storage/storageViewer'
import { StorageResolver } from './storage/storageResolver'
import { TraceManager } from './trace/traceManager'
import { CodeManager } from './code/codeManager'
import { contractCreationToken } from './trace/traceHelper'
import { EventManager } from './eventManager'
import { SolidityProxy, stateDecoder, localDecoder, InternalCallTree } from './solidity-decoder'

/**
  * Ethdebugger is a wrapper around a few classes that helps debugging a transaction
  *
  * - TraceManager - Load / Analyze the trace and retrieve details of specific test
  * - CodeManager - Retrieve loaded byte code and help to resolve AST item from vmtrace index
  * - SolidityProxy - Basically used to extract state variable from AST
  * - Breakpoint Manager - Used to add / remove / jumpto breakpoint
  * - InternalCallTree - Used to retrieved local variables
  * - StorageResolver - Help resolving the storage accross different steps
  *
  * @param {Map} opts  -  { function compilationResult } //
  */
export class Ethdebugger {
  compilationResult
  web3
  opts
  event
  tx
  traceManager
  codeManager
  solidityProxy
  storageResolver
  callTree
  breakpointManager

  constructor (opts) {
    this.compilationResult = opts.compilationResult || function (contractAddress) { return null }
    this.web3 = opts.web3
    this.opts = opts

    this.event = new EventManager()
    this.traceManager = new TraceManager({ web3: this.web3 })
    this.codeManager = new CodeManager(this.traceManager)
    this.solidityProxy = new SolidityProxy({ getCurrentCalledAddressAt: this.traceManager.getCurrentCalledAddressAt.bind(this.traceManager), getCode: this.codeManager.getCode.bind(this.codeManager) })
    this.storageResolver = null

    const includeLocalVariables = true
    this.callTree = new InternalCallTree(this.event,
      this.traceManager,
      this.solidityProxy,
      this.codeManager,
      { ...opts, includeLocalVariables })
  }

  setManagers () {
    this.traceManager = new TraceManager({ web3: this.web3 })
    this.codeManager = new CodeManager(this.traceManager)
    this.solidityProxy = new SolidityProxy({ getCurrentCalledAddressAt: this.traceManager.getCurrentCalledAddressAt.bind(this.traceManager), getCode: this.codeManager.getCode.bind(this.codeManager) })
    this.storageResolver = null
    const includeLocalVariables = true

    this.callTree = new InternalCallTree(this.event,
      this.traceManager,
      this.solidityProxy,
      this.codeManager,
      { ...this.opts, includeLocalVariables })
  }

  resolveStep (index) {
    this.codeManager.resolveStep(index, this.tx)
  }

  setCompilationResult (compilationResult) {
    this.solidityProxy.reset((compilationResult && compilationResult.data) || {})
  }

  async sourceLocationFromVMTraceIndex (address, stepIndex) {
    return this.callTree.sourceLocationTracker.getSourceLocationFromVMTraceIndex(address, stepIndex, this.solidityProxy.contracts)
  }

  async getValidSourceLocationFromVMTraceIndex (address, stepIndex) {
    return this.callTree.sourceLocationTracker.getValidSourceLocationFromVMTraceIndex(address, stepIndex, this.solidityProxy.contracts)
  }

  async sourceLocationFromInstructionIndex (address, instIndex, callback) {
    return this.callTree.sourceLocationTracker.getSourceLocationFromInstructionIndex(address, instIndex, this.solidityProxy.contracts)
  }

  /* breakpoint */
  setBreakpointManager (breakpointManager) {
    this.breakpointManager = breakpointManager
  }

  /* decode locals */
  extractLocalsAt (step) {
    return this.callTree.findScope(step)
  }

  async decodeLocalsAt (step, sourceLocation, callback) {
    try {
      const stack = this.traceManager.getStackAt(step)
      const memory = this.traceManager.getMemoryAt(step)
      const address = this.traceManager.getCurrentCalledAddressAt(step)
      const calldata = this.traceManager.getCallDataAt(step)
      try {
        const storageViewer = new StorageViewer({ stepIndex: step, tx: this.tx, address: address }, this.storageResolver, this.traceManager)
        const locals = await localDecoder.solidityLocals(step, this.callTree, stack, memory, storageViewer, calldata, sourceLocation, null)
        if (locals['error']) {
          return callback(locals['error'])
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
  async extractStateAt (step) {
    return this.solidityProxy.extractStateVariablesAt(step)
  }

  async decodeStateAt (step, stateVars, callback) {
    try {
      const address = this.traceManager.getCurrentCalledAddressAt(step)
      const storageViewer = new StorageViewer({ stepIndex: step, tx: this.tx, address: address }, this.storageResolver, this.traceManager)
      const result = await stateDecoder.decodeState(stateVars, storageViewer)
      return result
    } catch (error) {
      callback(error)
    }
  }

  storageViewAt (step, address) {
    return new StorageViewer({ stepIndex: step, tx: this.tx, address: address }, this.storageResolver, this.traceManager)
  }

  updateWeb3 (web3) {
    this.web3 = web3
    this.setManagers()
  }

  unLoad () {
    this.traceManager.init()
    this.codeManager.clear()
    this.event.trigger('traceUnloaded')
  }

  async debug (tx) {
    if (this.traceManager.isLoading) {
      return
    }
    tx.to = tx.to || contractCreationToken('0')
    this.tx = tx

    await this.traceManager.resolveTrace(tx)
    this.setCompilationResult(await this.compilationResult(tx.to))
    this.event.trigger('newTraceLoaded', [this.traceManager.trace])
    if (this.breakpointManager && this.breakpointManager.hasBreakpoint()) {
      this.breakpointManager.jumpNextBreakpoint(false)
    }
    this.storageResolver = new StorageResolver({ web3: this.traceManager.web3 })
  }
}
