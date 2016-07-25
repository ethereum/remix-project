'use strict'
var TraceAnalyser = require('./traceAnalyser')
var TraceRetriever = require('./traceRetriever')
var TraceCache = require('./traceCache')
var TraceStepManager = require('./traceStepManager')
var traceHelper = require('../helpers/traceHelper')
var util = require('../helpers/global')

function TraceManager () {
  this.isLoading = false
  this.trace = null
  this.traceCache = new TraceCache()
  this.traceAnalyser = new TraceAnalyser(this.traceCache)
  this.traceRetriever = new TraceRetriever()
  this.traceStepManager = new TraceStepManager(this.traceAnalyser)
  this.tx
}

// init section
TraceManager.prototype.resolveTrace = function (tx, callback) {
  this.tx = tx
  this.init()
  if (!util.web3) callback('web3 not loaded', false)
  this.isLoading = true
  var self = this
  this.traceRetriever.getTrace(tx.hash, function (error, result) {
    if (error) {
      console.log(error)
      self.isLoading = false
      callback(error, false)
    } else {
      if (result.structLogs.length > 0) {
        self.trace = result.structLogs
        self.traceAnalyser.analyse(result.structLogs, tx, function (error, result) {
          if (error) {
            self.isLoading = false
            console.log(error)
            callback(error, false)
          } else {
            self.isLoading = false
            callback(null, true)
          }
        })
      } else {
        var mes = tx.hash + ' is not a contract invokation or contract creation.'
        console.log(mes)
        self.isLoading = false
        callback(mes, false)
      }
    }
  })
}

TraceManager.prototype.init = function () {
  this.trace = null
  this.traceCache.init()
}

// API section
TraceManager.prototype.inRange = function (step) {
  return this.isLoaded() && step >= 0 && step < this.trace.length
}

TraceManager.prototype.isLoaded = function () {
  return !this.isLoading && this.trace !== null
}

TraceManager.prototype.getLength = function (callback) {
  if (!this.trace) {
    callback('no trace available', null)
  } else {
    callback(null, this.trace.length)
  }
}

TraceManager.prototype.getStorageAt = function (stepIndex, tx, callback, address) {
  var check = this.checkRequestedStep(stepIndex)
  if (check) {
    return callback(check, null)
  }
  if (!address) {
    var stoChange = traceHelper.findLowerBound(stepIndex, this.traceCache.storageChanges)
    if (stoChange === undefined) return callback('no storage found', null)
    address = this.traceCache.sstore[stoChange].address
  }
  var storage = {}
  storage = this.traceCache.rebuildStorage(address, storage, stepIndex)
  callback(null, storage)
  /*
  // TODO: use it if we need the full storage to be loaded
  var self = this
  if (this.traceRetriever.debugStorageAtAvailable()) {
    var address = this.traceCache.sstore[stoChange].address
    this.traceRetriever.getStorage(tx, address, function (error, result) {
      if (error) {
        console.log(error)
        callback(error, null)
      } else {
        var storage = self.traceCache.rebuildStorage(address, result, stepIndex)
        callback(null, storage)
      }
    })
  } else {
    callback(null, this.trace[stoChange].storage)
  }
  */
}

TraceManager.prototype.getAddresses = function (callback) {
  var addresses = [ this.tx.to ]
  for (var k in this.traceCache.calls) {
    var address = this.traceCache.calls[k].address
    if (address && addresses.join('').indexOf(address) === -1) {
      addresses.push(address)
    }
  }
  callback(null, addresses)
}

TraceManager.prototype.getCallDataAt = function (stepIndex, callback) {
  var check = this.checkRequestedStep(stepIndex)
  if (check) {
    return callback(check, null)
  }
  var callDataChange = traceHelper.findLowerBound(stepIndex, this.traceCache.callDataChanges)
  if (callDataChange === undefined) return callback('no calldata found', null)
  callback(null, [this.traceCache.callsData[callDataChange]])
}

TraceManager.prototype.getCallStackAt = function (stepIndex, callback) {
  var check = this.checkRequestedStep(stepIndex)
  if (check) {
    return callback(check, null)
  }
  var callStackChange = traceHelper.findLowerBound(stepIndex, this.traceCache.callChanges)
  if (callStackChange === undefined) return callback('no callstack found', null)
  callback(null, this.traceCache.callStack[callStackChange].callStack)
}

TraceManager.prototype.getStackAt = function (stepIndex, callback) {
  var check = this.checkRequestedStep(stepIndex)
  if (check) {
    return callback(check, null)
  }
  var stack
  if (this.trace[stepIndex].stack) { // there's always a stack
    stack = this.trace[stepIndex].stack.slice(0)
    stack.reverse()
    callback(null, stack)
  } else {
    callback('no stack found', null)
  }
}

TraceManager.prototype.getLastCallChangeSince = function (stepIndex, callback) {
  var check = this.checkRequestedStep(stepIndex)
  if (check) {
    return callback(check, null)
  }
  var callChange = traceHelper.findLowerBound(stepIndex, this.traceCache.callChanges)
  if (callChange === undefined) {
    callback(null, 0)
  } else {
    callback(null, callChange)
  }
}

TraceManager.prototype.getCurrentCalledAddressAt = function (stepIndex, callback) {
  var check = this.checkRequestedStep(stepIndex)
  if (check) {
    return callback(check, null)
  }
  var self = this
  this.getLastCallChangeSince(stepIndex, function (error, addressIndex) {
    if (error) {
      callback(error, null)
    } else {
      if (addressIndex === 0) {
        callback(null, self.tx.to)
      } else {
        var callStack = self.traceCache.callStack[addressIndex].callStack
        var calledAddress = callStack[callStack.length - 1]
        if (calledAddress) {
          callback(null, calledAddress)
        } else {
          callback('unable to get current called address. ' + stepIndex + ' does not match with a CALL', null)
        }
      }
    }
  })
}

TraceManager.prototype.getContractCreationCode = function (token, callback) {
  if (this.traceCache.contractCreation[token]) {
    callback(null, this.traceCache.contractCreation[token])
  } else {
    callback('no contract creation named ' + token, null)
  }
}

TraceManager.prototype.getMemoryAt = function (stepIndex, callback) {
  var check = this.checkRequestedStep(stepIndex)
  if (check) {
    return callback(check, null)
  }
  var lastChanges = traceHelper.findLowerBound(stepIndex, this.traceCache.memoryChanges)
  if (lastChanges === undefined) return callback('no memory found', null)
  callback(null, this.trace[lastChanges].memory)
}

TraceManager.prototype.getCurrentPC = function (stepIndex, callback) {
  var check = this.checkRequestedStep(stepIndex)
  if (check) {
    return callback(check, null)
  }
  callback(null, this.trace[stepIndex].pc)
}

TraceManager.prototype.getReturnValue = function (stepIndex, callback) {
  var check = this.checkRequestedStep(stepIndex)
  if (check) {
    return callback(check, null)
  }
  callback(null, this.traceCache.returnValues[stepIndex])
}

TraceManager.prototype.getCurrentStep = function (stepIndex, callback) {
  var check = this.checkRequestedStep(stepIndex)
  if (check) {
    return callback(check, null)
  }
  callback(null, this.traceCache.steps[stepIndex])
}

TraceManager.prototype.getMemExpand = function (stepIndex, callback) {
  var check = this.checkRequestedStep(stepIndex)
  if (check) {
    return callback(check, null)
  }
  callback(null, this.trace[stepIndex].memexpand ? this.trace[stepIndex].memexpand : '')
}

TraceManager.prototype.getStepCost = function (stepIndex, callback) {
  var check = this.checkRequestedStep(stepIndex)
  if (check) {
    return callback(check, null)
  }
  callback(null, this.trace[stepIndex].gasCost)
}

TraceManager.prototype.getRemainingGas = function (stepIndex, callback) {
  var check = this.checkRequestedStep(stepIndex)
  if (check) {
    return callback(check, null)
  }
  callback(null, this.trace[stepIndex].gas)
}

TraceManager.prototype.isCreationStep = function (stepIndex) {
  return traceHelper.isCreateInstruction(this.trace[stepIndex])
}

// step section
TraceManager.prototype.findStepOverBack = function (currentStep) {
  return this.traceStepManager.findStepOverBack(currentStep)
}

TraceManager.prototype.findStepOverForward = function (currentStep) {
  return this.traceStepManager.findStepOverForward(currentStep)
}

TraceManager.prototype.findStepOutBack = function (currentStep) {
  return this.traceStepManager.findStepOutBack(currentStep)
}

TraceManager.prototype.findStepOutForward = function (currentStep) {
  return this.traceStepManager.findStepOutForward(currentStep)
}

TraceManager.prototype.findNextCall = function (currentStep) {
  return this.traceStepManager.findNextCall(currentStep)
}

// util
TraceManager.prototype.checkRequestedStep = function (stepIndex) {
  if (!this.trace) {
    return 'trace not loaded'
  } else if (stepIndex >= this.trace.length) {
    return 'trace smaller than requested'
  }
  return undefined
}

module.exports = TraceManager
