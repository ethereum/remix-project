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
  this.currentAddress = ''
  this.codeResolver = codeResolver
}

CodeManager.prototype.resolveStep = function (stepIndex, tx) {
  if (stepIndex < 0) return
  this.trigger('resolvingStep')
  var self = this
  if (stepIndex === 0) {
    self.ensureCodeLoaded(tx.to, stepIndex, tx)
  } else {
    this.traceManager.getCurrentCalledAddressAt(stepIndex, function (error, address) {
      if (error) {
        console.log(error)
      } else {
        self.ensureCodeLoaded(address, stepIndex, tx)
      }
    })
  }
}

CodeManager.prototype.ensureCodeLoaded = function (address, currentStep, tx) {
  var self = this
  if (address !== this.currentAddress) {
    if (traceHelper.isContractCreation(address)) {
      this.traceManager.getContractCreationCode(address, function (error, hexCode) {
        // contract creation
        if (error) {
          console.log(error)
        } else {
          var codes = codeResolver.cacheExecutingCode(address, hexCode)
          self.trigger('loadingCode', [address])
          self.getInstructionIndex(address, currentStep, function (error, result) {
            if (!error) {
              self.trigger('codeChanged', [codes.code, address, result])
              self.trigger('indexChanged', [result])
              self.currentAddress = address
            } else {
              console.log(error)
            }
          })
        }
      })
    } else {
      codeResolver.resolveCode(address, currentStep, tx, function (address, code) {
        // resoling code from stack
        self.trigger('loadingCode', [address])
        self.getInstructionIndex(address, currentStep, function (error, result) {
          if (!error) {
            self.trigger('codeChanged', [code, address, result])
            self.trigger('indexChanged', [result])
            self.currentAddress = address
          } else {
            console.log(error)
          }
        })
      })
    }
  } else {
    // only set selected item
    this.getInstructionIndex(this.currentAddress, currentStep, function (error, result) {
      if (!error) {
        self.trigger('indexChanged', [result])
      }
    })
  }
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
