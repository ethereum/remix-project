'use strict'

var remix = require('ethereum-remix')
var executionContext = require('../../execution-context')

/**
 * Manage remix and source highlighting
 */
function Debugger (id, appAPI, editorEvent) {
  this.el = document.querySelector(id)
  this.debugger = new remix.ui.Debugger()
  this.sourceMappingDecoder = new remix.util.SourceMappingDecoder()
  this.el.appendChild(this.debugger.render())
  this.appAPI = appAPI
  this.isActive = false

  this.breakPointManager = new remix.code.BreakpointManager(this.debugger, (sourceLocation) => {
    return appAPI.offsetToLineColumn(sourceLocation, sourceLocation.file, this.editor, this.appAPI.lastCompilationResult().data)
  })

  this.debugger.setBreakpointManager(this.breakPointManager)
  this.breakPointManager.event.register('breakpointHit', (sourceLocation) => {
  })

  var self = this
  editorEvent.register('breakpointCleared', (fileName, row) => {
    this.breakPointManager.remove({fileName: fileName, row: row})
  })

  editorEvent.register('breakpointAdded', (fileName, row) => {
    this.breakPointManager.add({fileName: fileName, row: row})
  })

  executionContext.event.register('contextChanged', this, function (context) {
    self.switchProvider(context)
  })

  this.debugger.event.register('newTraceLoaded', this, function () {
    self.isActive = true
  })

  this.debugger.event.register('traceUnloaded', this, function () {
    self.appAPI.currentSourceLocation(null)
    self.isActive = false
  })

  // unload if a file has changed (but not if tabs were switched)
  editorEvent.register('contentChanged', function () {
    self.debugger.unLoad()
  })

  // register selected code item, highlight the corresponding source location
  this.debugger.codeManager.event.register('changed', this, function (code, address, index) {
    if (self.appAPI.lastCompilationResult()) {
      this.debugger.callTree.sourceLocationTracker.getSourceLocationFromInstructionIndex(address, index, self.appAPI.lastCompilationResult().data.contracts, function (error, rawLocation) {
        if (!error) {
          var lineColumnPos = self.appAPI.offsetToLineColumn(rawLocation, rawLocation.file)
          self.appAPI.currentSourceLocation(lineColumnPos, rawLocation)
        } else {
          self.appAPI.currentSourceLocation(null)
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
      self.debugger.setCompilationResult(self.appAPI.lastCompilationResult().data)
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
