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

  this.registry = globalRegistry
  this.offsetToLineColumnConverter = this.registry.get('offsettolinecolumnconverter').api
  this.editor = this.registry.get('editor').api
  this.compiler = this.registry.get('compiler').api

  this.debugger = new Ethdebugger(
    {
      executionContext: executionContext,
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

  self.editor.event.register('breakpointCleared', (fileName, row) => {
    this.breakPointManager.remove({fileName: fileName, row: row})
  })

  self.editor.event.register('breakpointAdded', (fileName, row) => {
    this.breakPointManager.add({fileName: fileName, row: row})
  })

  executionContext.event.register('contextChanged', this, function (context) {
    self.switchProvider(context)
  })

  // unload if a file has changed (but not if tabs were switched)
  self.editor.event.register('contentChanged', function () {
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
  if (!self.compiler.lastCompilationResult) return
  self.debugger.traceManager.getCurrentCalledAddressAt(index, (error, address) => {
    if (error) return console.log(error)
    self.debugger.callTree.sourceLocationTracker.getSourceLocationFromVMTraceIndex(address, index, self.compiler.lastCompilationResult.data.contracts, function (error, rawLocation) {
      if (!error && self.compiler.lastCompilationResult && self.compiler.lastCompilationResult.data) {
        var lineColumnPos = self.offsetToLineColumnConverter.offsetToLineColumn(rawLocation, rawLocation.file, self.compiler.lastCompilationResult.source.sources)
        self.event.trigger('newSourceLocation', [lineColumnPos, rawLocation])
      } else {
        self.event.trigger('newSourceLocation', [null])
      }
    })
  })
}

module.exports = Debugger
