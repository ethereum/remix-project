'use strict'
var traceManagerUtil = require('./traceManagerUtil')
var codeResolver = require('./codeResolver')
function CodeManager (_web3, _traceManager) {
  this.web3 = _web3
  this.isLoading = false
  this.traceManager = _traceManager
  this.currentAddress = ''
  this.indexChangedlisteners = []
  this.codeChangedlisteners = []
  codeResolver.setWeb3(_web3)
}

CodeManager.prototype.registerIndexChangedListener = function (obj, func) {
  this.indexChangedlisteners.push({
    obj: obj,
    func: func
  })
}

CodeManager.prototype.registerCodeChangedListener = function (obj, func) {
  this.codeChangedlisteners.push({
    obj: obj,
    func: func
  })
}

CodeManager.prototype.resolveCodeFor = function (stepIndex, tx) {
  if (stepIndex < 0) return
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
    if (traceManagerUtil.isContractCreation(address)) {
      this.traceManager.getContractCreationCode(address, function (error, hexCode) {
        // contract creation
        if (error) {
          console.log(error)
        } else {
          var codes = codeResolver.cacheExecutingCode(address, hexCode)
          self.getInstructionIndex(address, currentStep, function (error, result) {
            if (!error) {
              self.dispatchCodeChanged(codes.code, address, result)
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
        self.getInstructionIndex(address, currentStep, function (error, result) {
          if (!error) {
            self.dispatchCodeChanged(code, address, result)
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
        self.dispatchIndexChanged(result)
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

CodeManager.prototype.dispatchIndexChanged = function (itemIndex) {
  for (var listener in this.indexChangedlisteners) {
    var l = this.indexChangedlisteners[listener]
    l.func.call(l.obj, itemIndex)
  }
}

CodeManager.prototype.dispatchCodeChanged = function (code, address, itemIndex) {
  for (var listener in this.codeChangedlisteners) {
    var l = this.codeChangedlisteners[listener]
    l.func.call(l.obj, code, address, itemIndex)
  }
}

module.exports = CodeManager
