'use strict'
var Ethdebugger = require('remix-debug').EthDebugger
var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager

var StepManager = require('./stepManager')
var VmDebuggerLogic = require('./VmDebugger')

function Debugger (options) {
  var self = this
  this.event = new EventManager()

  this._components = {
    sourceHighlighter: sourceHighlighter
  }
  this._components.registry = globalRegistry
  // dependencies
  this._deps = {
    offsetToLineColumnConverter: this._components.registry.get('offsettolinecolumnconverter').api,
    editor: this._components.registry.get('editor').api,
    compiler: this._components.registry.get('compiler').api,
    compilersArtefacts: this._components.registry.get('compilersartefacts').api
  }
  this.debugger = new Ethdebugger(
    {
      executionContext: this.executionContext,
      compilationResult: () => {
        if (this._deps.compilersArtefacts['__last']) return this._deps.compilersArtefacts['__last'].getData()
        return null
      }
    })

  this.breakPointManager = new remixLib.code.BreakpointManager(this.debugger, (sourceLocation) => {
    return self._deps.offsetToLineColumnConverter.offsetToLineColumn(sourceLocation, sourceLocation.file, this._deps.compiler.lastCompilationResult.source.sources, this._deps.compiler.lastCompilationResult.data.sources)
  }, (step) => {
    self.event.trigger('breakpointStep', [step])
  })

  this.debugger.setBreakpointManager(this.breakPointManager)

  this.executionContext.event.register('contextChanged', this, function (context) {
    // TODO: was already broken
    // self.switchProvider(context)
  })

  this.debugger.event.register('newTraceLoaded', this, function () {
    self.event.trigger('debuggerStatus', [true])
  })

  this.debugger.event.register('traceUnloaded', this, function () {
    self.event.trigger('debuggerStatus', [false])
  })

  this.debugger.addProvider('vm', this.executionContext.vm())
  this.debugger.addProvider('injected', this.executionContext.internalWeb3())
  this.debugger.addProvider('web3', this.executionContext.internalWeb3())
  this.debugger.switchProvider(this.executionContext.getProvider())
}

Debugger.prototype.registerAndHighlightCodeItem = function (index) {
  const self = this
  // register selected code item, highlight the corresponding source location
  if (!self._deps.compilersArtefacts['__last']) return
  self.debugger.traceManager.getCurrentCalledAddressAt(index, (error, address) => {
    if (error) return console.log(error)
    var compilerData = self._deps.compilersArtefacts['__last'].getdata()
    if (!compilerData) return
    self.debugger.callTree.sourceLocationTracker.getSourceLocationFromVMTraceIndex(address, index, compilerData.contracts, function (error, rawLocation) {
      if (!error) {
        var lineColumnPos = self._deps.offsetToLineColumnConverter.offsetToLineColumn(rawLocation, rawLocation.file, compilerData.source.sources)
        self.event.trigger('newSourceLocation', [lineColumnPos, rawLocation])
      } else {
        self.event.trigger('newSourceLocation', [null])
      }
    })
  })
}

Debugger.prototype.debug = function (parent, tx, loadingCb) {
  const self = this
  this.step_manager = new StepManager(this.debugger, this.debugger.traceManager)
  parent.event.register('indexChanged', this, (index) => {
    self.step_manager.event.trigger('indexChanged', [index])
  })

  this.debugger.codeManager.event.register('changed', this, (code, address, instIndex) => {
    self.debugger.callTree.sourceLocationTracker.getSourceLocationFromVMTraceIndex(address, this.step_manager.currentStepIndex, this.debugger.solidityProxy.contracts, (error, sourceLocation) => {
      if (!error) {
        parent.event.trigger('sourceLocationChanged', [sourceLocation])
      }
    })
  })

  this.vmDebuggerLogic = new VmDebuggerLogic(parent, this.debugger.traceManager, this.debugger.codeManager, this.debugger.solidityProxy, this.debugger.callTree)

  loadingCb()
  this.debugger.debug(tx)
}

module.exports = Debugger
