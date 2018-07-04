'use strict'

var Ethdebugger = require('./remix-debugger/src/ui/Ethdebugger')
var remixLib = require('remix-lib')
var remixCore = require('remix-core')
var executionContext = require('../../execution-context')
var globlalRegistry = require('../../global/registry')

/**
 * Manage remix and source highlighting
 */
function Debugger (container, sourceHighlighter, localRegistry) {
  this._components = {
    sourceHighlighter: sourceHighlighter
  }
  this._components.registry = localRegistry || globlalRegistry
  // dependencies
  this._deps = {
    offsetToLineColumnConverter: this._components.registry.get('offsettolinecolumnconverter').api,
    editor: this._components.registry.get('editor').api,
    compiler: this._components.registry.get('compiler').api
  }
  this.debugger = new Ethdebugger(
    {
      compilationResult: () => {
        var compilationResult = this._deps.compiler.lastCompilationResult
        if (compilationResult) {
          return compilationResult.data
        }
        return null
      }
    })
  this.sourceMappingDecoder = new remixLib.SourceMappingDecoder()
  container.appendChild(this.debugger.render())
  this.isActive = false

  this.breakPointManager = new remixCore.code.BreakpointManager(this.debugger, (sourceLocation) => {
    return self._deps.offsetToLineColumnConverter.offsetToLineColumn(sourceLocation, sourceLocation.file, this._deps.compiler.lastCompilationResult.source.sources)
  })

  this.debugger.setBreakpointManager(this.breakPointManager)
  this.breakPointManager.event.register('breakpointHit', (sourceLocation) => {
  })

  var self = this
  self._deps.editor.event.register('breakpointCleared', (fileName, row) => {
    this.breakPointManager.remove({fileName: fileName, row: row})
  })

  self._deps.editor.event.register('breakpointAdded', (fileName, row) => {
    this.breakPointManager.add({fileName: fileName, row: row})
  })

  executionContext.event.register('contextChanged', this, function (context) {
    self.switchProvider(context)
  })

  this.debugger.event.register('newTraceLoaded', this, function () {
    self.isActive = true
  })

  this.debugger.event.register('traceUnloaded', this, function () {
    self._components.sourceHighlighter.currentSourceLocation(null)
    self.isActive = false
  })

  // unload if a file has changed (but not if tabs were switched)
  self._deps.editor.event.register('contentChanged', function () {
    self.debugger.unLoad()
  })

  // register selected code item, highlight the corresponding source location
  this.debugger.codeManager.event.register('changed', this, function (code, address, index) {
    if (self._deps.compiler.lastCompilationResult) {
      self.debugger.callTree.sourceLocationTracker.getSourceLocationFromInstructionIndex(address, index, self._deps.compiler.lastCompilationResult.data.contracts, function (error, rawLocation) {
        if (!error && self._deps.compiler.lastCompilationResult && self._deps.compiler.lastCompilationResult.data) {
          var lineColumnPos = self._deps.offsetToLineColumnConverter.offsetToLineColumn(rawLocation, rawLocation.file, self._deps.compiler.lastCompilationResult.source.sources)
          self._components.sourceHighlighter.currentSourceLocation(lineColumnPos, rawLocation)
        } else {
          self._components.sourceHighlighter.currentSourceLocation(null)
        }
      })
    }
  })
}

/**
 * Start debugging using Remix
 *
 * @param {String} txHash    - hash of the transaction
 */
Debugger.prototype.debug = function (txHash) {
  var self = this
  this.debugger.web3().eth.getTransaction(txHash, function (error, tx) {
    if (!error) {
      self.debugger.debug(tx)
    }
  })
}

/**
 * add a new web3 provider to remix
 *
 * @param {String} type - type/name of the provider to add
 * @param {Object} obj  - provider
 */
Debugger.prototype.addProvider = function (type, obj) {
  this.debugger.addProvider(type, obj)
}

/**
 * switch the provider
 *
 * @param {String} type - type/name of the provider to use
 */
Debugger.prototype.switchProvider = function (type) {
  this.debugger.switchProvider(type)
}

/**
 * get the current provider
 */
Debugger.prototype.web3 = function (type) {
  return this.debugger.web3()
}

module.exports = Debugger
