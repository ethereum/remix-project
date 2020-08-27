'use strict'
const Ethdebugger = require('../Ethdebugger')
const EventManager = require('../eventManager')
const traceHelper = require('../trace/traceHelper')
const BreakpointManager = require('../code/breakpointManager')

const StepManager = require('./stepManager')
const VmDebuggerLogic = require('./VmDebugger')

function Debugger (options) {
  this.event = new EventManager()

  this.offsetToLineColumnConverter = options.offsetToLineColumnConverter
  /*
    Returns a compilation result for a given address or the last one available if none are found
  */
  this.compilationResult = options.compilationResult || function (contractAddress) { return null }

  this.debugger = new Ethdebugger({
    web3: options.web3,
    compilationResult: this.compilationResult
  })

  this.breakPointManager = new BreakpointManager(this.debugger, async (sourceLocation) => {
    const compilationResult = await this.compilationResult()
    if (!compilationResult) return { start: null, end: null }
    return this.offsetToLineColumnConverter.offsetToLineColumn(sourceLocation, sourceLocation.file, compilationResult.source.sources, compilationResult.data.sources)
  })

  this.breakPointManager.event.register('breakpointStep', (step) => {
    this.step_manager.jumpTo(step)
  })

  this.debugger.setBreakpointManager(this.breakPointManager)

  this.debugger.event.register('newTraceLoaded', this, () => {
    this.event.trigger('debuggerStatus', [true])
  })

  this.debugger.event.register('traceUnloaded', this, () => {
    this.event.trigger('debuggerStatus', [false])
  })
}

Debugger.prototype.registerAndHighlightCodeItem = async function (index) {
  // register selected code item, highlight the corresponding source location
  // this.debugger.traceManager.getCurrentCalledAddressAt(index, async (error, address) => {

  try {
    const address = this.debugger.traceManager.getCurrentCalledAddressAt(index)
    const compilationResultForAddress = await this.compilationResult(address)
    if (!compilationResultForAddress) return

    this.debugger.callTree.sourceLocationTracker.getSourceLocationFromVMTraceIndex(address, index, compilationResultForAddress.data.contracts).then((rawLocation) => {
      if (compilationResultForAddress && compilationResultForAddress.data) {
        var lineColumnPos = this.offsetToLineColumnConverter.offsetToLineColumn(rawLocation, rawLocation.file, compilationResultForAddress.source.sources, compilationResultForAddress.data.sources)
        this.event.trigger('newSourceLocation', [lineColumnPos, rawLocation])
      } else {
        this.event.trigger('newSourceLocation', [null])
      }
    }).catch((_error) => {
      this.event.trigger('newSourceLocation', [null])
    })
    // })
  } catch (error) {
    return console.log(error)
  }
}

Debugger.prototype.updateWeb3 = function (web3) {
  this.debugger.web3 = web3
}

Debugger.prototype.debug = function (blockNumber, txNumber, tx, loadingCb) {
  const web3 = this.debugger.web3

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
  this.step_manager = new StepManager(this.debugger, this.debugger.traceManager)

  this.debugger.codeManager.event.register('changed', this, (code, address, instIndex) => {
    this.debugger.callTree.sourceLocationTracker.getSourceLocationFromVMTraceIndex(address, this.step_manager.currentStepIndex, this.debugger.solidityProxy.contracts).then((sourceLocation) => {
      this.vmDebuggerLogic.event.trigger('sourceLocationChanged', [sourceLocation])
    })
  })

  this.vmDebuggerLogic = new VmDebuggerLogic(this.debugger, tx, this.step_manager, this.debugger.traceManager, this.debugger.codeManager, this.debugger.solidityProxy, this.debugger.callTree)
  this.vmDebuggerLogic.start()

  this.step_manager.event.register('stepChanged', this, (stepIndex) => {
    if (typeof stepIndex !== 'number' || stepIndex >= this.step_manager.traceLength) {
      return this.event.trigger('endDebug')
    }

    this.debugger.codeManager.resolveStep(stepIndex, tx)
    this.step_manager.event.trigger('indexChanged', [stepIndex])
    this.vmDebuggerLogic.event.trigger('indexChanged', [stepIndex])
    this.vmDebuggerLogic.debugger.event.trigger('indexChanged', [stepIndex])
    this.registerAndHighlightCodeItem(stepIndex)
  })

  loadingCb()
  this.debugger.debug(tx)
}

Debugger.prototype.unload = function () {
  this.debugger.unLoad()
  this.event.trigger('debuggerUnloaded')
}

module.exports = Debugger
