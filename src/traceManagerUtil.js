module.exports = {
  // util section
  findLowerBound: function (target, changes) {
    if (changes.length === 0) {
      return undefined
    }

    if (changes.length === 1) {
      if (changes[0] > target) {
        // we only a closest maximum, returning O
        return 0
      } else {
        return changes[0]
      }
    }

    var middle = Math.floor(changes.length / 2)
    if (changes[middle] > target) {
      return this.findLowerBound(target, changes.slice(0, middle))
    } else if (changes[middle] < target) {
      return this.findLowerBound(target, changes.slice(middle, changes.length))
    } else {
      return changes[middle]
    }
  },

  // vmTraceIndex has to point to a CALL, CODECALL, ...
  resolveCalledAddress: function (vmTraceIndex, trace) {
    var step = trace[vmTraceIndex]
    if (this.isCallInstruction(step)) {
      var stack = step.stack // callcode, delegatecall, ...
      return stack[stack.length - 2]
    }
    return undefined
  },

  isCallInstruction: function (step) {
    return step.op === 'CALL' || step.op === 'CALLCODE' || step.op === 'CREATE' || step.op === 'DELEGATECALL'
  },
  
  isCreateInstruction: function (step) {
    return step.op === 'CREATE'
  },

  isReturnInstruction: function (step) {
    return step.op === 'RETURN'
  },

  newContextStorage: function (step) {
    return step.op === 'CREATE' || step.op === 'CALL'
  },

  isCallToPrecompiledContract: function (index, trace) {
    // if stack empty => this is not a precompiled contract
    var step = trace[index]
    if (this.isCallInstruction(step)) {
      return trace[index + 1].stack.length !== 0
    } else {
      return false
    }
  }
}
