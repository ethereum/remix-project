'use strict'

const traceHelper = require('./traceHelper')
const remixLib = require('@remix-project/remix-lib')
const util = remixLib.util

function TraceStepManager (_traceAnalyser) {
  this.traceAnalyser = _traceAnalyser
}

TraceStepManager.prototype.isCallInstruction = function (index) {
  const state = this.traceAnalyser.trace[index]
  return traceHelper.isCallInstruction(state) && !traceHelper.isCallToPrecompiledContract(index, this.traceAnalyser.trace)
}

TraceStepManager.prototype.isReturnInstruction = function (index) {
  const state = this.traceAnalyser.trace[index]
  return traceHelper.isReturnInstruction(state)
}

TraceStepManager.prototype.findStepOverBack = function (currentStep) {
  if (this.isReturnInstruction(currentStep)) {
    const call = util.findCall(currentStep, this.traceAnalyser.traceCache.callsTree.call)
    return call.start > 0 ? call.start - 1 : 0
  }
  return currentStep > 0 ? currentStep - 1 : 0
}

TraceStepManager.prototype.findStepOverForward = function (currentStep) {
  if (this.isCallInstruction(currentStep)) {
    const call = util.findCall(currentStep + 1, this.traceAnalyser.traceCache.callsTree.call)
    return call.return + 1 < this.traceAnalyser.trace.length ? call.return + 1 : this.traceAnalyser.trace.length - 1
  }
  return this.traceAnalyser.trace.length >= currentStep + 1 ? currentStep + 1 : currentStep
}

TraceStepManager.prototype.findNextCall = function (currentStep) {
  const call = util.findCall(currentStep, this.traceAnalyser.traceCache.callsTree.call)
  const subCalls = Object.keys(call.calls)
  if (subCalls.length) {
    var callStart = util.findLowerBound(currentStep, subCalls) + 1
    if (subCalls.length > callStart) {
      return subCalls[callStart] - 1
    }
    return currentStep
  }
  return currentStep
}

TraceStepManager.prototype.findStepOut = function (currentStep) {
  const call = util.findCall(currentStep, this.traceAnalyser.traceCache.callsTree.call)
  return call.return
}

module.exports = TraceStepManager
