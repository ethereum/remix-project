'use strict'
var traceHelper = require('../helpers/traceHelper')
var util = require('../helpers/util')

function TraceStepManager (_traceAnalyser) {
  this.traceAnalyser = _traceAnalyser
}

TraceStepManager.prototype.isCallInstruction = function (index) {
  var state = this.traceAnalyser.trace[index]
  return traceHelper.isCallInstruction(state)
}

TraceStepManager.prototype.isReturnInstruction = function (index) {
  var state = this.traceAnalyser.trace[index]
  return traceHelper.isReturnInstruction(state)
}

TraceStepManager.prototype.findStepOverBack = function (currentStep) {
  if (this.isReturnInstruction(currentStep - 1)) {
    return this.traceAnalyser.traceCache.calls[currentStep].call - 1
  } else {
    return currentStep > 0 ? currentStep - 1 : 0
  }
}

TraceStepManager.prototype.findStepOverForward = function (currentStep) {
  if (this.isCallInstruction(currentStep)) {
    return this.traceAnalyser.traceCache.calls[currentStep + 1].return
  } else {
    return this.traceAnalyser.trace.length >= currentStep + 1 ? currentStep + 1 : currentStep
  }
}

TraceStepManager.prototype.findNextCall = function (currentStep) {
  var callChanges = this.traceAnalyser.traceCache.callChanges
  var stepIndex = util.findLowerBound(currentStep, callChanges)
  var callchange = callChanges[stepIndex + 1]
  if (callchange && this.isCallInstruction(callchange - 1)) {
    return callchange - 1
  } else {
    return currentStep
  }
}

module.exports = TraceStepManager
