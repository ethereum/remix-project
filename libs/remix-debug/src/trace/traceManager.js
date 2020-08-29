'use strict'
const TraceAnalyser = require('./traceAnalyser')
const TraceCache = require('./traceCache')
const TraceStepManager = require('./traceStepManager')

const traceHelper = require('./traceHelper')
const remixLib = require('@remix-project/remix-lib')
const util = remixLib.util

function TraceManager ({web3}) {
  this.web3 = web3
  this.isLoading = false
  this.trace = null
  this.traceCache = new TraceCache()
  this.traceAnalyser = new TraceAnalyser(this.traceCache)
  this.traceStepManager = new TraceStepManager(this.traceAnalyser)
  this.tx
}

// init section
TraceManager.prototype.resolveTrace = async function (tx) {
  this.tx = tx
  this.init()
  if (!this.web3) throw new Error('web3 not loaded')
  this.isLoading = true
  try {
    const result = await this.getTrace(tx.hash)

    if (result.structLogs.length > 0) {
      this.trace = result.structLogs

      this.traceAnalyser.analyse(result.structLogs, tx)
      this.isLoading = false
      return true
    }
    var mes = tx.hash + ' is not a contract invocation or contract creation.'
    console.log(mes)
    this.isLoading = false
    throw new Error(mes)
  } catch (error) {
    console.log(error)
    this.isLoading = false
    throw new Error(error)
  }
}

TraceManager.prototype.getTrace = function (txHash) {
  return new Promise((resolve, reject) => {
    const options = {
      disableStorage: true,
      disableMemory: false,
      disableStack: false,
      fullStorage: false
    }
    this.web3.debug.traceTransaction(txHash, options, function (error, result) {
      if (error) return reject(error)
      resolve(result)
    })
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

TraceManager.prototype.accumulateStorageChanges = function (index, address, storageOrigin) {
  return this.traceCache.accumulateStorageChanges(index, address, storageOrigin)
}

TraceManager.prototype.getAddresses = function () {
  return this.traceCache.addresses
}

TraceManager.prototype.getCallDataAt = function (stepIndex) {
  try {
    this.checkRequestedStep(stepIndex)
  } catch (check) {
    throw new Error(check)
  }
  const callDataChange = util.findLowerBoundValue(stepIndex, this.traceCache.callDataChanges)
  if (callDataChange === null) {
    throw new Error('no calldata found')
  }
  return [this.traceCache.callsData[callDataChange]]
}

TraceManager.prototype.buildCallPath = async function (stepIndex) {
  try {
    this.checkRequestedStep(stepIndex)
  } catch (check) {
    throw new Error(check)
  }
  const callsPath = util.buildCallPath(stepIndex, this.traceCache.callsTree.call)
  if (callsPath === null) throw new Error('no call path built')
  return callsPath
}

TraceManager.prototype.getCallStackAt = function (stepIndex) {
  try {
    this.checkRequestedStep(stepIndex)
  } catch (check) {
    throw new Error(check)
  }
  const call = util.findCall(stepIndex, this.traceCache.callsTree.call)
  if (call === null) {
    throw new Error('no callstack found')
  }
  return call.callStack
}

TraceManager.prototype.getStackAt = function (stepIndex) {
  this.checkRequestedStep(stepIndex)
  if (this.trace[stepIndex] && this.trace[stepIndex].stack) { // there's always a stack
    let stack = this.trace[stepIndex].stack.slice(0)
    stack.reverse()
    return stack
  } else {
    throw new Error('no stack found')
  }
}

TraceManager.prototype.getLastCallChangeSince = function (stepIndex) {
  try {
    this.checkRequestedStep(stepIndex)
  } catch (check) {
    throw new Error(check)
  }

  const callChange = util.findCall(stepIndex, this.traceCache.callsTree.call)
  if (callChange === null) {
    return 0
  }
  return callChange
}

TraceManager.prototype.getCurrentCalledAddressAt = function (stepIndex) {
  try {
    this.checkRequestedStep(stepIndex)
    const resp = this.getLastCallChangeSince(stepIndex)
    if (!resp) {
      throw new Error('unable to get current called address. ' + stepIndex + ' does not match with a CALL')
    }
    return resp.address
  } catch (error) {
    throw new Error(error)
  }
}

TraceManager.prototype.getContractCreationCode = function (token) {
  if (!this.traceCache.contractCreation[token]) {
    throw new Error('no contract creation named ' + token)
  }
  return this.traceCache.contractCreation[token]
}

TraceManager.prototype.getMemoryAt = function (stepIndex) {
  this.checkRequestedStep(stepIndex)
  const lastChanges = util.findLowerBoundValue(stepIndex, this.traceCache.memoryChanges)
  if (lastChanges === null) {
    throw new Error('no memory found')
  }
  return this.trace[lastChanges].memory
}

TraceManager.prototype.getCurrentPC = function (stepIndex) {
  try {
    this.checkRequestedStep(stepIndex)
  } catch (check) {
    throw new Error(check)
  }
  return this.trace[stepIndex].pc
}

TraceManager.prototype.getReturnValue = function (stepIndex) {
  try {
    this.checkRequestedStep(stepIndex)
  } catch (check) {
    throw new Error(check)
  }
  if (!this.traceCache.returnValues[stepIndex]) {
    throw new Error('current step is not a return step')
  }
  return this.traceCache.returnValues[stepIndex]
}

TraceManager.prototype.getCurrentStep = function (stepIndex) {
  try {
    this.checkRequestedStep(stepIndex)
  } catch (check) {
    throw new Error(check)
  }
  return this.traceCache.steps[stepIndex]
}

TraceManager.prototype.getMemExpand = function (stepIndex) {
  return (this.getStepProperty(stepIndex, 'memexpand') || '')
}

TraceManager.prototype.getStepCost = function (stepIndex) {
  return this.getStepProperty(stepIndex, 'gasCost')
}

TraceManager.prototype.getRemainingGas = function (stepIndex) {
  return this.getStepProperty(stepIndex, 'gas')
}

TraceManager.prototype.getStepProperty = function (stepIndex, property) {
  try {
    this.checkRequestedStep(stepIndex)
  } catch (check) {
    throw new Error(check)
  }
  return this.trace[stepIndex][property]
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

TraceManager.prototype.checkRequestedStep = function (stepIndex) {
  if (!this.trace) {
    throw new Error('trace not loaded')
  } else if (stepIndex >= this.trace.length) {
    throw new Error('trace smaller than requested')
  }
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
