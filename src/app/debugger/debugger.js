'use strict'
var Ethdebugger = require('remix-debug').EthDebugger
var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager
var executionContext = require('../../execution-context')
var globalRegistry = require('../../global/registry')

function Debugger () {
  var self = this
  this.event = new EventManager()

  this.registry = globalRegistry
  this.offsetToLineColumnConverter = this.registry.get('offsettolinecolumnconverter').api
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

  executionContext.event.register('contextChanged', this, function (context) {
    self.switchProvider(context)
  })

  this.debugger.event.register('newTraceLoaded', this, function () {
    self.event.trigger('debuggerStatus', [true])
  })

  this.debugger.event.register('traceUnloaded', this, function () {
    self.event.trigger('debuggerStatus', [false])
  })

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
