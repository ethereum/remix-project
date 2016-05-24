'use strict'
var traceManagerUtil = require('./traceManagerUtil')

function TraceStepManager (_traceAnalyser) {
  this.traceAnalyser = _traceAnalyser
}

TraceStepManager.prototype.isCallInstruction = function (index) {
  var state = this.traceAnalyser.trace[index]
  return traceManagerUtil.isCallInstruction(state)
}

TraceStepManager.prototype.isReturnInstruction = function (index) {
  var state = this.traceAnalyser.trace[index]
  return traceManagerUtil.isReturnInstruction(state)
}

TraceStepManager.prototype.findStepOverBack = function (currentStep) {
  if (currentStep === 0) return 0
  return this.findStepOutBack(currentStep)
}

TraceStepManager.prototype.findStepOverForward = function (currentStep) {
  if (currentStep === this.traceAnalyser.trace.length - 1) return currentStep
  return this.findStepOutForward(currentStep)
}

TraceStepManager.prototype.findStepOutBack = function (currentStep) {
  var i = currentStep - 1
  var depth = 0
  while (--i >= 0) {
    if (this.isCallInstruction(i)) {
      if (depth === 0) {
        break
      } else {
        depth--
      }
    } else if (this.isReturnInstruction(i)) {
      depth++
    }
  }
  return i
}

TraceStepManager.prototype.findStepOutForward = function (currentStep) {
  var i = currentStep
  var depth = 0
  while (++i < this.traceAnalyser.trace.length) {
    if (this.isReturnInstruction(i)) {
      if (depth === 0) {
        break
      } else {
        depth--
      }
    } else if (this.isCallInstruction(i)) {
      depth++
    }
  }
  return i
}

TraceStepManager.prototype.findNextCall = function (currentStep) {
  var i = currentStep
  while (++i < this.traceAnalyser.trace.length) {
    if (this.isCallInstruction(i)) {
      return i
    }
  }
  return currentStep
}

module.exports = TraceStepManager
