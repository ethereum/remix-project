'use strict'
var TraceAnalyser = require('./traceAnalyser')
var TraceRetriever = require('./traceRetriever')
var TraceCache = require('./traceCache')
var TraceStepManager = require('./traceStepManager')
var traceManagerUtil = require('./traceManagerUtil')

function TraceManager (_web3) {
  this.web3 = _web3
  this.isLoading = false
  this.trace = null
  this.traceCache = new TraceCache()
  this.traceAnalyser = new TraceAnalyser(this.traceCache)
  this.traceRetriever = new TraceRetriever(_web3)
  this.traceStepManager = new TraceStepManager(this.traceAnalyser)
  this.tx
}

// init section
TraceManager.prototype.resolveTrace = function (tx, callback) {
  this.tx = tx
  this.init()
  if (!this.web3) callback(false)
  this.isLoading = true
  var self = this
  this.traceRetriever.getTrace(tx.hash, function (error, result) {
    if (error) {
      console.log(error)
      self.isLoading = false
    } else {
      if (result.structLogs.length > 0) {
        self.trace = result.structLogs
        self.traceAnalyser.analyse(result.structLogs, tx.to, function (error, result) {
          if (error) {
            console.log(error)
            callback(false)
          } else {
            callback(true)
          }
          self.isLoading = false
        })
      } else {
        console.log(tx.hash + ' is not a contract invokation or contract creation.')
        self.isLoading = false
      }
    }
  })
}

TraceManager.prototype.init = function () {
  this.trace = null
  this.traceCache.init()
}

// API section
TraceManager.prototype.getLength = function (callback) {
  if (!this.trace) {
    callback('no trace available', null)
  } else {
    callback(null, this.trace.length)
  }
}

TraceManager.prototype.getStorageAt = function (stepIndex, tx, callback) {
  if (stepIndex >= this.trace.length) {
    callback('trace smaller than requested', null)
    return
  }
  var stoChange = traceManagerUtil.findLowerBound(stepIndex, this.traceCache.storageChanges)
  if (stoChange === undefined) return callback('no storage found', null)
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
}

TraceManager.prototype.getCallDataAt = function (stepIndex, callback) {
  if (stepIndex >= this.trace.length) {
    callback('trace smaller than requested', null)
    return
  }
  var callDataChange = traceManagerUtil.findLowerBound(stepIndex, this.traceCache.callDataChanges)
  if (callDataChange === undefined) return callback('no calldata found', null)
  callback(null, [this.trace[callDataChange].calldata])
}

TraceManager.prototype.getCallStackAt = function (stepIndex, callback) {
  if (stepIndex >= this.trace.length) {
    callback('trace smaller than requested', null)
    return
  }
  var callStackChange = traceManagerUtil.findLowerBound(stepIndex, this.traceCache.callChanges)
  if (callStackChange === undefined) return callback('no callstack found', null)
  callback(null, this.traceCache.callStack[callStackChange].callStack)
}

TraceManager.prototype.getStackAt = function (stepIndex, callback) {
  if (stepIndex >= this.trace.length) {
    callback('trace smaller than requested', null)
    return
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
  if (stepIndex >= this.trace.length) {
    callback('trace smaller than requested', null)
    return
  }
  var callChange = traceManagerUtil.findLowerBound(stepIndex, this.traceCache.callChanges)
  if (callChange === undefined) {
    callback(null, 0)
  } else {
    callback(null, callChange)
  }
}

TraceManager.prototype.getCurrentCalledAddressAt = function (stepIndex, callback) {
  if (stepIndex > this.trace.length) {
    callback('trace smaller than requested', null)
    return
  }
  var self = this
  this.getLastCallChangeSince(stepIndex, function (error, addressIndex) {
    if (error) {
      callback(error, null)
    } else {
      if (addressIndex === 0) {
        callback(null, self.tx.to)
      } else {
        var step = this.trace[addressIndex]
        if (traceManagerUtil.isCreateInstruction(step)) {
          callback(null, '(Contract Creation Code)')
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
    }
  })
}

TraceManager.prototype.getMemoryAt = function (stepIndex, callback) {
  if (stepIndex >= this.trace.length) {
    callback('trace smaller than requested', null)
    return
  }
  var lastChanges = traceManagerUtil.findLowerBound(stepIndex, this.traceCache.memoryChanges)
  if (lastChanges === undefined) return callback('no memory found', null)
  callback(null, this.trace[lastChanges].memory)
}

TraceManager.prototype.getCurrentPC = function (stepIndex, callback) {
  if (stepIndex >= this.trace.length) {
    callback('trace smaller than requested', null)
    return
  }
  callback(null, this.trace[stepIndex].pc)
}

TraceManager.prototype.getCurrentStep = function (stepIndex, callback) {
  if (stepIndex >= this.trace.length) {
    callback('trace smaller than requested', null)
    return
  }
  callback(null, this.trace[stepIndex].steps)
}

TraceManager.prototype.getMemExpand = function (stepIndex, callback) {
  if (stepIndex >= this.trace.length) {
    callback('trace smaller than requested', null)
    return
  }
  callback(null, this.trace[stepIndex].memexpand ? this.trace[stepIndex].memexpand : '')
}

TraceManager.prototype.getStepCost = function (stepIndex, callback) {
  if (stepIndex >= this.trace.length) {
    callback('trace smaller than requested', null)
    return
  }
  callback(null, this.trace[stepIndex].gasCost)
}

TraceManager.prototype.getRemainingGas = function (stepIndex, callback) {
  if (stepIndex >= this.trace.length) {
    callback('trace smaller than requested', null)
    return
  }
  callback(null, this.trace[stepIndex].gas)
}

TraceManager.prototype.isCreationStep = function (stepIndex) {
  return traceManagerUtil.isCreateInstruction(stepIndex, this.trace)
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

module.exports = TraceManager
