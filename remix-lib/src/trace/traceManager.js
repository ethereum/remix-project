'use strict'
const TraceAnalyser = require('./traceAnalyser')
const TraceRetriever = require('./traceRetriever')
const TraceCache = require('./traceCache')
const TraceStepManager = require('./traceStepManager')

const traceHelper = require('../helpers/traceHelper')
const util = require('../util')

function TraceManager (options) {
  this.web3 = options.web3
  this.isLoading = false
  this.trace = null
  this.traceCache = new TraceCache()
  this.traceAnalyser = new TraceAnalyser(this.traceCache)
  this.traceRetriever = new TraceRetriever({web3: this.web3})
  this.traceStepManager = new TraceStepManager(this.traceAnalyser)
  this.tx
}

// init section
TraceManager.prototype.resolveTrace = function (tx, callback) {
  this.tx = tx
  this.init()
  if (!this.web3) callback('web3 not loaded', false)
  this.isLoading = true
  var self = this
  this.traceRetriever.getTrace(tx.hash, (error, result) => {
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
        var mes = tx.hash + ' is not a contract invocation or contract creation.'
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

TraceManager.prototype.accumulateStorageChanges = function (index, address, storageOrigin, callback) {
  const storage = this.traceCache.accumulateStorageChanges(index, address, storageOrigin)
  callback(null, storage)
}

TraceManager.prototype.getAddresses = function (callback) {
  callback(null, this.traceCache.addresses)
}

TraceManager.prototype.getCallDataAt = function (stepIndex, callback) {
  const check = this.checkRequestedStep(stepIndex)
  if (check) {
    return callback(check, null)
  }
  const callDataChange = util.findLowerBoundValue(stepIndex, this.traceCache.callDataChanges)
  if (callDataChange === null) return callback('no calldata found', null)
  callback(null, [this.traceCache.callsData[callDataChange]])
}

TraceManager.prototype.buildCallPath = function (stepIndex, callback) {
  const check = this.checkRequestedStep(stepIndex)
  if (check) {
    return callback(check, null)
  }
  const callsPath = util.buildCallPath(stepIndex, this.traceCache.callsTree.call)
  if (callsPath === null) return callback('no call path built', null)
  callback(null, callsPath)
}

TraceManager.prototype.getCallStackAt = function (stepIndex, callback) {
  const check = this.checkRequestedStep(stepIndex)
  if (check) {
    return callback(check, null)
  }
  const call = util.findCall(stepIndex, this.traceCache.callsTree.call)
  if (call === null) return callback('no callstack found', null)
  callback(null, call.callStack)
}

TraceManager.prototype.getStackAt = function (stepIndex, callback) {
  const check = this.checkRequestedStep(stepIndex)
  if (check) {
    return callback(check, null)
  }
  let stack
  if (this.trace[stepIndex] && this.trace[stepIndex].stack) { // there's always a stack
    stack = this.trace[stepIndex].stack.slice(0)
    stack.reverse()
    callback(null, stack)
  } else {
    callback('no stack found', null)
  }
}

TraceManager.prototype.getLastCallChangeSince = function (stepIndex, callback) {
  const check = this.checkRequestedStep(stepIndex)
  if (check) {
    return callback(check, null)
  }
  const callChange = util.findCall(stepIndex, this.traceCache.callsTree.call)
  if (callChange === null) {
    callback(null, 0)
  } else {
    callback(null, callChange)
  }
}

TraceManager.prototype.getCurrentCalledAddressAt = function (stepIndex, callback) {
  const check = this.checkRequestedStep(stepIndex)
  if (check) {
    return callback(check, null)
  }
  this.getLastCallChangeSince(stepIndex, function (error, resp) {
    if (error) {
      callback(error, null)
    } else {
      if (resp) {
        callback(null, resp.address)
      } else {
        callback('unable to get current called address. ' + stepIndex + ' does not match with a CALL')
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
  const check = this.checkRequestedStep(stepIndex)
  if (check) {
    return callback(check, null)
  }
  const lastChanges = util.findLowerBoundValue(stepIndex, this.traceCache.memoryChanges)
  if (lastChanges === null) return callback('no memory found', null)
  callback(null, this.trace[lastChanges].memory)
}

TraceManager.prototype.getCurrentPC = function (stepIndex, callback) {
  const check = this.checkRequestedStep(stepIndex)
  if (check) {
    return callback(check, null)
  }
  callback(null, this.trace[stepIndex].pc)
}

TraceManager.prototype.getReturnValue = function (stepIndex, callback) {
  const check = this.checkRequestedStep(stepIndex)
  if (check) {
    return callback(check, null)
  }
  if (!this.traceCache.returnValues[stepIndex]) {
    callback('current step is not a return step')
  } else {
    callback(null, this.traceCache.returnValues[stepIndex])
  }
}

TraceManager.prototype.getCurrentStep = function (stepIndex, callback) {
  const check = this.checkRequestedStep(stepIndex)
  if (check) {
    return callback(check, null)
  }
  callback(null, this.traceCache.steps[stepIndex])
}

TraceManager.prototype.getMemExpand = function (stepIndex, callback) {
  const check = this.checkRequestedStep(stepIndex)
  if (check) {
    return callback(check, null)
  }
  callback(null, this.trace[stepIndex].memexpand ? this.trace[stepIndex].memexpand : '')
}

TraceManager.prototype.getStepCost = function (stepIndex, callback) {
  const check = this.checkRequestedStep(stepIndex)
  if (check) {
    return callback(check, null)
  }
  callback(null, this.trace[stepIndex].gasCost)
}

TraceManager.prototype.getRemainingGas = function (stepIndex, callback) {
  const check = this.checkRequestedStep(stepIndex)
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

TraceManager.prototype.findNextCall = function (currentStep) {
  return this.traceStepManager.findNextCall(currentStep)
}

TraceManager.prototype.findStepOut = function (currentStep) {
  return this.traceStepManager.findStepOut(currentStep)
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

TraceManager.prototype.waterfall = function (calls, stepindex, cb) {
  let ret = []
  let retError = null
  for (var call in calls) {
    calls[call].apply(this, [stepindex, function (error, result) {
      retError = error
      ret.push({ error: error, value: result })
    }])
  }
  cb(retError, ret)
}

module.exports = TraceManager
