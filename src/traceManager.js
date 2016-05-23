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
}

// init section
TraceManager.prototype.resolveTrace = function (blockNumber, txNumber, callback) {
  this.isLoading = true
  this.init()
  if (!this.web3) callback(false)
  var self = this
  this.traceRetriever.getTrace(blockNumber, parseInt(txNumber), function (error, result) {
    self.trace = result
    if (error) {
      console.log(error)
    } else {
      self.traceAnalyser.analyse(result, function (error, result) {
        if (error) {
          console.log(error)
          callback(false)
        } else {
          callback(true)
        }
      })
    }
  })
}

TraceManager.prototype.init = function () {
  this.trace = null
  this.traceCache.init()
}

// API section
TraceManager.prototype.getLength = function (callback) {
  if (!this.trace) callback('no trace available', null)
  callback(null, this.trace.length)
}

TraceManager.prototype.getStorageAt = function (stepIndex, blockNumber, txIndex, callback) {
  var stoChange = traceManagerUtil.findLowerBound(stepIndex, this.traceCache.storageChanges)

  var address = this.traceCache.sstore[stoChange].address
  var self = this
  this.traceRetriever.getStorage(blockNumber, txIndex, address, function (error, result) {
    if (error) {
      console.log(error)
      callback(error, null)
    } else {
      var storage = self.traceCache.rebuildStorage(address, result, stepIndex)
      callback(null, storage)
    }
  })
}

TraceManager.prototype.getCallDataAt = function (stepIndex, callback) {
  var callDataChange = traceManagerUtil.findLowerBound(stepIndex, this.traceCache.callDataChanges)
  if (!callDataChange) return callback('no calldata found', null)
  callback(null, [this.trace[callDataChange].calldata])
}

TraceManager.prototype.getCallStackAt = function (stepIndex, callback) {
  var callStackChange = traceManagerUtil.findLowerBound(stepIndex, this.traceCache.depthChanges)
  if (!callStackChange) return callback('no callstack found', null)
  callback(null, this.traceCache.callStack[callStackChange].stack)
}

TraceManager.prototype.getStackAt = function (stepIndex, callback) {
  var stack
  if (this.trace[stepIndex].stack) { // there's always a stack
    stack = this.trace[stepIndex].stack.slice(0)
    stack.reverse()
    callback(null, stack)
  } else {
    callback('no stack found', null)
  }
}

TraceManager.prototype.getLastDepthIndexChangeSince = function (stepIndex, callback) {
  var depthIndex = traceManagerUtil.findLowerBound(stepIndex, this.traceCache.depthChanges)
  callback(null, depthIndex)
}

TraceManager.prototype.getCurrentCalledAddressAt = function (stepIndex, callback) {
  var self = this
  this.getLastDepthIndexChangeSince(stepIndex, function (error, addressIndex) {
    if (error) {
      callback(error, null)
    } else {
      callback(null, traceManagerUtil.resolveCalledAddress(addressIndex, self.trace))
    }
  })
}

TraceManager.prototype.getMemoryAt = function (stepIndex, callback) {
  var lastChanges = traceManagerUtil.findLowerBound(stepIndex, this.traceCache.memoryChanges)
  if (!lastChanges) return callback('no memory found', null)
  callback(null, this.trace[lastChanges].memory)
}

TraceManager.prototype.getCurrentPC = function (stepIndex, callback) {
  callback(null, this.trace[stepIndex].pc)
}

TraceManager.prototype.getCurrentStep = function (stepIndex, callback) {
  callback(null, this.trace[stepIndex].steps)
}

TraceManager.prototype.getMemExpand = function (stepIndex, callback) {
  callback(null, this.trace[stepIndex].memexpand ? this.trace[stepIndex].memexpand : '')
}

TraceManager.prototype.getStepCost = function (stepIndex, callback) {
  callback(null, this.trace[stepIndex].gascost)
}

TraceManager.prototype.getRemainingGas = function (stepIndex, callback) {
  callback(null, this.trace[stepIndex].gas)
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

module.exports = TraceManager
