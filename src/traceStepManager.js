'use strict'
function TraceStepManager (_traceAnalyser) {
  this.traceAnalyser = _traceAnalyser
}

TraceStepManager.prototype.isCallInstruction = function (index) {
  var state = this.traceAnalyser.trace[index]
  return state.instname === 'CALL' || state.instname === 'CALLCODE' || state.instname === 'CREATE' || state.instname === 'DELEGATECALL'
}

TraceStepManager.prototype.isReturnInstruction = function (index) {
  var state = this.traceAnalyser.trace[index]
  return state.instname === 'RETURN'
}

TraceStepManager.prototype.findStepOverBack = function (currentStep) {
  if (this.isReturnInstruction(currentStep - 1)) {
    return this.findStepOutBack(currentStep)
  } else {
    return currentStep - 1
  }
}

TraceStepManager.prototype.findStepOverForward = function (currentStep) {
  if (this.isCallInstruction(currentStep)) {
    return this.findStepOutForward(currentStep)
  } else {
    return currentStep + 1
  }
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
  while (++i < this.traceAnalyser.length) {
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
  return i + 1
}

module.exports = TraceStepManager
