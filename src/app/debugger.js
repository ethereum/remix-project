'use strict'

var remix = require('ethereum-remix')

/**
 * Manage remix and source highlighting
 */
function Debugger (id, appAPI, executionContextEvent, editorEvent) {
  this.el = document.querySelector(id)
  this.debugger = new remix.ui.Debugger()
  this.sourceMappingDecoder = new remix.util.SourceMappingDecoder()
  this.el.appendChild(this.debugger.render())
  this.appAPI = appAPI
  this.markers = {}
  this.breakPointManager = new remix.code.BreakpointManager(this.debugger, (sourceLocation) => {
    return this.offsetToLineColumnConverter.offsetToLineColumn(sourceLocation, sourceLocation.file, this.editor, this.compiler.lastCompilationResult.data)
  })

  this.debugger.setBreakpointManager(this.breakPointManager)
  this.breakPointManager.event.register('breakpointHit', (sourceLocation) => {
    this.editor.setBreakpoint(this.touchedBreakpoint, 'breakpointUntouched')
    var lineColumnPos = this.offsetToLineColumnConverter.offsetToLineColumn(sourceLocation, sourceLocation.file, this.editor, this.compiler.lastCompilationResult.data)
    this.editor.setBreakpoint(lineColumnPos.start.line, 'breakpointTouched')
    var self = this
    setTimeout(function () {
      self.editor.setBreakpoint(lineColumnPos.start.line, 'breakpointUntouched')
    }, 5000)
  })

  function convertSourceLocation (self, fileName, row) {
    var source = {}
    for (let file in self.compiler.lastCompilationResult.data.sourceList) {
      if (self.compiler.lastCompilationResult.data.sourceList[file] === fileName) {
        source.file = file
        break
      }
    }
    source.start = self.offsetToLineColumnConverter.lineBreakPositionsByContent[source.file][row > 0 ? row - 1 : 0]
    source.end = self.offsetToLineColumnConverter.lineBreakPositionsByContent[source.file][row]
    source.row = row
    return source
  }

  editorEvent.register('breakpointCleared', (fileName, row) => {
    this.breakPointManager.remove(convertSourceLocation(this, fileName, row))
  })

  editorEvent.register('breakpointAdded', (fileName, row) => {
    this.breakPointManager.add(convertSourceLocation(this, fileName, row))
  })

  var self = this
  executionContextEvent.register('contextChanged', this, function (context) {
    self.switchProvider(context)
  })

  this.debugger.event.register('traceUnloaded', this, function () {
    self.appAPI.currentSourceLocation(null)
  })

  // unload if a file has changed (but not if tabs were switched)
  editorEvent.register('contentChanged', function () {
    self.debugger.unLoad()
    self.removeMarkers()
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

Debugger.prototype.switchFile = function (rawLocation) {
  var name = this.editor.getCacheFile() // current opened tab
  var source = this.compiler.lastCompilationResult.data.sourceList[rawLocation.file] // auto switch to that tab
  if (name !== source) {
    this.switchToFile(source) // command the app to swicth to the next file
  }
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
