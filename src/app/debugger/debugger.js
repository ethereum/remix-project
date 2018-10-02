'use strict'
var Ethdebugger = require('remix-debug').EthDebugger
var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager
var executionContext = require('../../execution-context')
var globalRegistry = require('../../global/registry')

/**
 * Manage remix and source highlighting
 */
function Debugger () {
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
      executionContext: executionContext,
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

  self._deps.editor.event.register('breakpointCleared', (fileName, row) => {
    this.breakPointManager.remove({fileName: fileName, row: row})
  })

  self._deps.editor.event.register('breakpointAdded', (fileName, row) => {
    this.breakPointManager.add({fileName: fileName, row: row})
  })

  executionContext.event.register('contextChanged', this, function (context) {
    self.switchProvider(context)
  })

  // unload if a file has changed (but not if tabs were switched)
  self._deps.editor.event.register('contentChanged', function () {
    self.debugger.unLoad()
  })

  //
  // ====================
  // listen to events
  this.debugger.event.register('newTraceLoaded', this, function () {
    self.event.trigger('debuggerStatus', [true])
  })

  this.debugger.event.register('traceUnloaded', this, function () {
    self.event.trigger('debuggerStatus', [false])
  })

  // ====================
  // add providers
  this.debugger.addProvider('vm', executionContext.vm())
  this.debugger.addProvider('injected', executionContext.internalWeb3())
  this.debugger.addProvider('web3', executionContext.internalWeb3())
  this.debugger.switchProvider(executionContext.getProvider())
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

module.exports = Debugger
