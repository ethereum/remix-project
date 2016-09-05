'use strict'
var traceHelper = require('../helpers/traceHelper')
var codeResolver = require('./codeResolver')
var util = require('../helpers/global')
var EventManager = require('../lib/eventManager')

/*
  resolve contract code referenced by vmtrace in order to be used by asm listview.
  events:
   - indexChanged: triggered when an item is selected
   - codeChanged: triggered when an item (in a different context) is selected
   - loadingCode: triggerred when loading new code
   - resolvingStep: when CodeManager resolves code/selected instruction of a new step
*/

function CodeManager (_traceManager) {
  util.extend(this, new EventManager())
  this.isLoading = false
  this.traceManager = _traceManager
  this.codeResolver = codeResolver
}

CodeManager.prototype.resolveStep = function (stepIndex, tx) {
  if (stepIndex < 0) return
  this.trigger('resolvingStep')
  var self = this
  if (stepIndex === 0) {
    self.retrieveCodeAndTrigger(tx.to, stepIndex, tx)
  } else {
    this.traceManager.getCurrentCalledAddressAt(stepIndex, function (error, address) {
      if (error) {
        console.log(error)
      } else {
        self.retrieveCodeAndTrigger(address, stepIndex, tx)
      }
    })
  }
}

CodeManager.prototype.retrieveCodeAndTrigger = function (address, stepIndex, tx) {
  var self = this
  this.getCode(address, function (error, result) {
    if (!error) {
      self.retrieveIndexAndTrigger(address, stepIndex, result.instructions)
    } else {
      console.log(error)
    }
  })
}

CodeManager.prototype.getCode = function (address, cb) {
  if (traceHelper.isContractCreation(address)) {
    var codes = codeResolver.getExecutingCodeFromCache(address)
    if (!codes) {
      this.traceManager.getContractCreationCode(address, function (error, hexCode) {
        if (!error) {
          codes = codeResolver.cacheExecutingCode(address, hexCode)
          cb(null, codes)
        }
      })
    } else {
      cb(null, codes)
    }
  } else {
    codeResolver.resolveCode(address, function (address, code) {
      cb(null, code)
    })
  }
}

CodeManager.prototype.retrieveIndexAndTrigger = function (address, step, code) {
  var self = this
  this.getInstructionIndex(address, step, function (error, result) {
    if (!error) {
      self.trigger('changed', [code, address, result])
    } else {
      console.log(error)
    }
  })
}

CodeManager.prototype.getInstructionIndex = function (address, step, callback) {
  this.traceManager.getCurrentPC(step, function (error, instIndex) {
    if (error) {
      console.log(error)
      callback('Cannot retrieve current PC for ' + step, null)
    } else {
      var itemIndex = codeResolver.getInstructionIndex(address, instIndex)
      callback(null, itemIndex)
    }
  })
}

module.exports = CodeManager
