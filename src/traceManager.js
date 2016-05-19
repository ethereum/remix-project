'use strict'
function TraceManager (_web3) {
  this.web3 = _web3

  this.isLoading = false
  this.trace = null

  // vmtrace changes section
  this.depthChanges = []
  this.callStack = {}
  this.memoryChanges = []
  this.callDataChanges = []

  // storage section
  this.storageChanges = []
  this.vmTraceIndexByStorageChange = {}
  this.vmTraceChangesRef = []
  this.storages = {}
}

// init section
TraceManager.prototype.resolveTrace = function (blockNumber, txNumber, callback) {
  this.isLoading = true
  this.init()
  if (!this.web3) callback(false)
  var self = this
  this.web3.debug.trace(blockNumber, parseInt(txNumber), function (error, result) {
    if (!error) {
      self.computeTrace(result)
      callback(true)
    } else {
      console.log(error)
      callback(false)
    }
    this.isLoading = false
  })
}

TraceManager.prototype.init = function () {
  this.trace = null
  this.depthChanges = []
  this.memoryChanges = []
  this.callDataChanges = []
  this.storageChanges = []
  this.vmTraceIndexByStorageChange = {}
  this.vmTraceChangesRef = []
  this.callStack = {}
}

TraceManager.prototype.computeTrace = function (trace) {
  this.trace = trace
  var currentDepth = 0
  var currentStorageAddress
  var callStack = []
  for (var k in this.trace) {
    var step = this.trace[k]

    this.buildCalldata(k, step)
    this.buildMemory(k, step)
    currentStorageAddress = this.buildStorage(k, step, currentStorageAddress)
    var depth = this.buildDepth(k, step, currentDepth, callStack)
    if (depth) {
      currentDepth = depth
    }
  }
}

// compute trace section
TraceManager.prototype.buildCalldata = function (index, step) {
  if (step.calldata) {
    this.callDataChanges.push(index)
  }
}

TraceManager.prototype.buildMemory = function (index, step) {
  if (step.memory) {
    this.memoryChanges.push(index)
  }
}

TraceManager.prototype.buildStorage = function (index, step, currentAddress) {
  var change = false
  if (step.address) {
    // new context
    this.storageChanges.push({ address: step.address, changes: [] })
    change = true
  } else if (step.inst === 'SSTORE') {
    this.storageChanges[this.storageChanges.length - 1].changes.push(
      {
        'key': step.stack[step.stack.length - 1],
        'value': step.stack[step.stack.length - 2]
      })
    change = true
  } else if (!step.address && step.depth) {
    // returned from context
    var address = this.storageChanges[this.storageChanges.length - 2].address
    this.storageChanges.push({ address: address, changes: [] })
    change = true
  }

  if (change) {
    this.vmTraceIndexByStorageChange[index] = {
      context: this.storageChanges.length - 1,
      changes: this.storageChanges[this.storageChanges.length - 1].changes.length - 1
    }
    this.vmTraceChangesRef.push(index)
  }
  return currentAddress
}

TraceManager.prototype.buildDepth = function (index, step, currentDepth, callStack) {
  if (step.depth === undefined) return
  if (step.depth > currentDepth) {
    if (index === 0) {
      callStack.push('0x' + step.address) // new context
    } else {
      // getting the address from the stack
      var callTrace = this.trace[index - 1]
      var address = callTrace.stack[callTrace.stack.length - 2]
      callStack.push(address) // new context
    }
  } else if (step.depth < currentDepth) {
    callStack.pop() // returning from context
  }
  this.callStack[index] = {
    stack: callStack.slice(0),
    depth: step.depth,
    address: step.address
  }
  this.depthChanges.push(index)
  return step.depth
}

// API section
TraceManager.prototype.getLength = function (callback) {
  if (!this.trace) callback('no trace available', null)
  callback(null, this.trace.length)
}

TraceManager.prototype.getStorageAt = function (stepIndex, blockNumber, txIndex, callback) {
  var stoChange = this.findLowerBound(stepIndex, this.vmTraceChangesRef)
  if (!stoChange) {
    callback('cannot rebuild storage', null)
  }

  var changeRefs = this.vmTraceIndexByStorageChange[stoChange]
  var address = this.storageChanges[changeRefs.context].address
  var self = this
  this.retrieveStorage(address, blockNumber, txIndex, function (storage) {
    for (var k = 0; k < changeRefs.context; k++) {
      var context = self.storageChanges[k]
      if (context.address === address) {
        for (var i = 0; i < context.changes.length; i++) {
          if (i > changeRefs.changes) break
          var change = context.changes[i]
          storage[change.key] = change.value
        }
      }
    }
    callback(null, storage)
  })
}

TraceManager.prototype.getCallDataAt = function (stepIndex, callback) {
  var callDataChange = this.findLowerBound(stepIndex, this.callDataChanges)
  if (!callDataChange) return callback('no calldata found', null)
  callback(null, [this.trace[callDataChange].calldata])
}

TraceManager.prototype.getCallStackAt = function (stepIndex, callback) {
  var callStackChange = this.findLowerBound(stepIndex, this.depthChanges)
  if (!callStackChange) return callback('no callstack found', null)
  callback(null, this.callStack[callStackChange].stack)
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
  var depthIndex = this.findLowerBound(stepIndex, this.depthChanges)
  callback(null, depthIndex)
}

TraceManager.prototype.getCurrentCalledAddressAt = function (stepIndex, callback) {
  var self = this
  this.getLastDepthIndexChangeSince(stepIndex, function (error, addressIndex) {
    if (error) {
      callback(error, null)
    } else {
      callback(null, self.resolveAddress(addressIndex))
    }
  })
}

TraceManager.prototype.getMemoryAt = function (stepIndex, callback) {
  var lastChanges = this.findLowerBound(stepIndex, this.memoryChanges)
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
TraceManager.prototype.isCallInstruction = function (index) {
  var state = this.trace[index]
  return state.instname === 'CALL' || state.instname === 'CALLCODE' || state.instname === 'CREATE' || state.instname === 'DELEGATECALL'
}

TraceManager.prototype.isReturnInstruction = function (index) {
  var state = this.trace[index]
  return state.instname === 'RETURN'
}

TraceManager.prototype.findStepOverBack = function (currentStep) {
  if (this.isReturnInstruction(currentStep - 1)) {
    return this.findStepOutBack(currentStep)
  } else {
    return currentStep - 1
  }
}

TraceManager.prototype.findStepOverForward = function (currentStep) {
  if (this.isCallInstruction(currentStep)) {
    return this.findStepOutForward(currentStep)
  } else {
    return currentStep + 1
  }
}

TraceManager.prototype.findStepOutBack = function (currentStep) {
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

TraceManager.prototype.findStepOutForward = function (currentStep) {
  var i = currentStep
  var depth = 0
  while (++i < this.trace.length) {
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

// util section
TraceManager.prototype.findLowerBound = function (target, changes) {
  if (changes.length === 1) {
    if (changes[0] > target) {
      // we only a closest maximum, returning 0
      return null
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
}

TraceManager.prototype.resolveAddress = function (vmTraceIndex) {
  var address = this.trace[vmTraceIndex].address
  if (vmTraceIndex > 0) {
    var stack = this.trace[vmTraceIndex - 1].stack // callcode, delegatecall, ...
    address = stack[stack.length - 2]
  }
  return address
}

// retrieve the storage of an account just after the execution of tx
TraceManager.prototype.retrieveStorage = function (address, blockNumber, txIndex, callBack) {
  if (this.storages[address]) {
    callBack(this.storages[address])
  }
  var self = this
  if (blockNumber !== null && txIndex !== null) {
    this.web3.debug.storageAt(blockNumber, txIndex, address, function (error, result) {
      if (error) {
        console.log(error)
      } else {
        self.storages[address] = result
        callBack(result)
      }
    })
  } else {
    console.log('blockNumber/txIndex are not defined')
  }
}

module.exports = TraceManager
