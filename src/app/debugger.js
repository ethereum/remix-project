'use strict'

var remix = require('ethereum-remix')

/**
 * Manage remix and source highlighting
 */
function Debugger (id, executionContextEvent, editorEvent, editorAPI, compilerAPI, contentToolAPI) {
  this.el = document.querySelector(id)
  this.contentToolAPI = contentToolAPI
  this.debugger = new remix.ui.Debugger()
  this.sourceMappingDecoder = new remix.util.SourceMappingDecoder()
  this.el.appendChild(this.debugger.render())
  this.compilerAPI = compilerAPI
  this.editorAPI = editorAPI

  var self = this
  executionContextEvent.register('contextChanged', this, function (context) {
    self.switchProvider(context)
  })

  this.debugger.event.register('traceUnloaded', this, function () {
    self.editorAPI.currentSourceLocation(null)
  })

  // unload if a file has changed (but not if tabs were switched)
  editorEvent.register('contentChanged', function () {
    self.debugger.unLoad()
  })

  // register selected code item, highlight the corresponding source location
  this.debugger.codeManager.event.register('changed', this, function (code, address, index) {
    if (self.compilerAPI.lastCompilationResult()) {
      this.debugger.callTree.sourceLocationTracker.getSourceLocationFromInstructionIndex(address, index, self.compilerAPI.lastCompilationResult().data.contracts, function (error, rawLocation) {
        if (!error) {
          var lineColumnPos = self.contentToolAPI.offsetToLineColumn(rawLocation, rawLocation.file)
          self.editorAPI.currentSourceLocation(lineColumnPos, rawLocation)
        } else {
          self.editorAPI.currentSourceLocation(null)
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
      self.debugger.setCompilationResult(self.compilerAPI.lastCompilationResult().data)
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
