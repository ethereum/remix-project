'use strict'
import { Ethdebugger } from '../Ethdebugger'
import { EventManager } from '../eventManager'
import { contractCreationToken } from '../trace/traceHelper'
import { BreakpointManager } from '../code/breakpointManager'
import { DebuggerStepManager } from './stepManager'
import { VmDebuggerLogic } from './VmDebugger'

export class Debugger {
  event
  offsetToLineColumnConverter
  compilationResult
  debugger
  breakPointManager
  step_manager // eslint-disable-line camelcase
  vmDebuggerLogic

  constructor (options) {
    this.event = new EventManager()
    this.offsetToLineColumnConverter = options.offsetToLineColumnConverter
    /*
      Returns a compilation result for a given address or the last one available if none are found
    */
    this.compilationResult = options.compilationResult || function (contractAddress) { return null }

    this.debugger = new Ethdebugger({
      web3: options.web3,
      debugWithGeneratedSources: options.debugWithGeneratedSources,
      compilationResult: this.compilationResult
    })

    const { traceManager, callTree, solidityProxy } = this.debugger
    this.breakPointManager = new BreakpointManager({
      traceManager,
      callTree,
      solidityProxy,
      locationToRowConverter: async (sourceLocation) => {
        const compilationResult = await this.compilationResult()
        if (!compilationResult) return { start: null, end: null }
        return await this.offsetToLineColumnConverter.offsetToLineColumn(sourceLocation, sourceLocation.file, compilationResult.source.sources, compilationResult.data.sources)
      }
    })

    this.breakPointManager.event.register('breakpointStep', (step) => {
      this.step_manager.jumpTo(step)
    })

    this.breakPointManager.event.register('noBreakpointHit', (step) => {
      this.event.trigger('noBreakpointHit', [])
    })

    this.breakPointManager.event.register('locatingBreakpoint', () => {
      this.event.trigger('locatingBreakpoint', [])
    })

    this.debugger.setBreakpointManager(this.breakPointManager)

    this.debugger.event.register('newTraceLoaded', this, () => {
      this.event.trigger('debuggerStatus', [true])
    })

    this.debugger.event.register('traceUnloaded', this, () => {
      this.event.trigger('debuggerStatus', [false])
    })
  }

  async registerAndHighlightCodeItem (index) {
    // register selected code item, highlight the corresponding source location
    // this.debugger.traceManager.getCurrentCalledAddressAt(index, async (error, address) => {

    try {
      const address = this.debugger.traceManager.getCurrentCalledAddressAt(index)
      const compilationResultForAddress = await this.compilationResult(address)
      if (!compilationResultForAddress) {
        this.event.trigger('newSourceLocation', [null])
        return
      }

      this.debugger.callTree.sourceLocationTracker.getValidSourceLocationFromVMTraceIndex(address, index, compilationResultForAddress.data.contracts).then(async (rawLocation) => {
        if (compilationResultForAddress && compilationResultForAddress.data) {
          const generatedSources = this.debugger.callTree.sourceLocationTracker.getGeneratedSourcesFromAddress(address)
          const astSources = Object.assign({}, compilationResultForAddress.data.sources)
          const sources = Object.assign({}, compilationResultForAddress.source.sources)
          if (generatedSources) {
            for (const genSource of generatedSources) {
              astSources[genSource.name] = { id: genSource.id, ast: genSource.ast }
              sources[genSource.name] = { content: genSource.contents }
            }
          }
          const lineColumnPos = await this.offsetToLineColumnConverter.offsetToLineColumn(rawLocation, rawLocation.file, sources, astSources)
          this.event.trigger('newSourceLocation', [lineColumnPos, rawLocation, generatedSources, address])
          this.vmDebuggerLogic.event.trigger('sourceLocationChanged', [rawLocation])
        } else {
          this.event.trigger('newSourceLocation', [null])
          this.vmDebuggerLogic.event.trigger('sourceLocationChanged', [null])
        }
      }).catch((_error) => {
        this.event.trigger('newSourceLocation', [null])
        this.vmDebuggerLogic.event.trigger('sourceLocationChanged', [null])
      })
      // })
    } catch (error) {
      this.event.trigger('newSourceLocation', [null])
      this.vmDebuggerLogic.event.trigger('sourceLocationChanged', [null])
      return console.log(error)
    }
  }

  updateWeb3 (web3) {
    this.debugger.web3 = web3
  }

  async debug (blockNumber, txNumber, tx, loadingCb) {
    const web3 = this.debugger.web3

    if (this.debugger.traceManager.isLoading) {
      return
    }

    if (tx) {
      if (!tx.to) {
        tx.to = contractCreationToken('0')
      }
      return await this.debugTx(tx, loadingCb)
    }

    if (txNumber.indexOf('0x') !== -1) {
      tx = await web3.eth.getTransaction(txNumber)
      if (!tx) throw new Error('cannot find transaction ' + txNumber)
    } else {
      tx = await web3.eth.getTransactionFromBlock(blockNumber, txNumber)
      if (!tx) throw new Error('cannot find transaction ' + blockNumber + ' ' + txNumber)
    }
    return await this.debugTx(tx, loadingCb)
  }

  async debugTx (tx, loadingCb) {
    this.step_manager = new DebuggerStepManager(this.debugger, this.debugger.traceManager)

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
    await this.debugger.debug(tx)
  }

  unload () {
    this.debugger.unLoad()
    this.event.trigger('debuggerUnloaded')
  }
}
