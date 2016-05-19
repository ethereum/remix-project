'use strict'
module.exports = {
  isLoading: false,
  web3: null,
  transaction: null,
  trace: null,

  // vmtrace changes section
  depthChanges: [],
  callStack: {},
  memoryChanges: [],
  callDataChanges: [],

  // storage section
  storageChanges: [],
  vmTraceIndexByStorageChange: {},
  vmTraceChangesRef: [],
  storages: {},

  // init section
  setWeb3: function (web3) {
    this.web3 = web3
  },

  resolveTrace: function (blockNumber, txNumber, callback) {
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
  },

  init: function () {
    this.trace = null
    this.depthChanges = []
    this.memoryChanges = []
    this.callDataChanges = []
    this.storageChanges = []
    this.vmTraceIndexByStorageChange = {}
    this.vmTraceChangesRef = []
    this.callStack = {}
  },

  computeTrace: function (trace) {
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
  },

  // compute trace section
  buildCalldata: function (index, step) {
    if (step.calldata) {
      this.callDataChanges.push(index)
    }
  },

  buildMemory: function (index, step) {
    if (step.memory) {
      this.memoryChanges.push(index)
    }
  },

  buildStorage: function (index, step, currentAddress) {
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
  },

  buildDepth: function (index, step, currentDepth, callStack) {
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
  },

  // API section
  getLength: function (callback) {
    if (!this.trace) callback(0)
    callback(this.trace.length)
  },

  getStorageAt: function (stepIndex, blockNumber, txIndex, callback) {
    var stoChange = this.findLowerBound(stepIndex, this.vmTraceChangesRef)
    if (!stoChange) {
      return {}
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
      callback(storage)
    })
  },

  getCallDataAt: function (stepIndex, callback) {
    var callDataChange = this.findLowerBound(stepIndex, this.callDataChanges)
    if (!callDataChange) return ['']
    callback([this.trace[callDataChange].calldata])
  },

  getCallStackAt: function (stepIndex, callback) {
    var callStackChange = this.findLowerBound(stepIndex, this.depthChanges)
    if (!callStackChange) return ''
    callback(this.callStack[callStackChange].stack)
  },

  getStackAt: function (stepIndex, callback) {
    var stack
    if (this.trace[stepIndex].stack) { // there's always a stack
      stack = this.trace[stepIndex].stack.slice(0)
      stack.reverse()
      callback(stack)
    }
  },

  getLastDepthIndexChangeSince: function (stepIndex, callback) {
    var depthIndex = this.findLowerBound(stepIndex, this.depthChanges)
    callback(depthIndex)
  },

  getCurrentCalledAddressAt: function (stepIndex, callback) {
    var self = this
    this.getLastDepthIndexChangeSince(stepIndex, function (addressIndex) {
      callback(self.resolveAddress(addressIndex))
    })
  },

  getMemoryAt: function (stepIndex, callback) {
    var lastChanges = this.findLowerBound(stepIndex, this.memoryChanges)
    if (!lastChanges) return ''
    callback(this.trace[lastChanges].memory)
  },

  getCurrentPC: function (stepIndex, callback) {
    callback(this.trace[stepIndex].pc)
  },

  getCurrentStep: function (stepIndex, callback) {
    callback(this.trace[stepIndex].steps)
  },

  getMemExpand: function (stepIndex, callback) {
    callback(this.trace[stepIndex].memexpand ? this.trace[stepIndex].memexpand : '')
  },

  getStepCost: function (stepIndex, callback) {
    callback(this.trace[stepIndex].gascost)
  },

  getRemainingGas: function (stepIndex, callback) {
    callback(this.trace[stepIndex].gas)
  },

  // step section
  isCallInstruction: function (index) {
    var state = this.trace[index]
    return state.instname === 'CALL' || state.instname === 'CALLCODE' || state.instname === 'CREATE' || state.instname === 'DELEGATECALL'
  },

  isReturnInstruction: function (index) {
    var state = this.trace[index]
    return state.instname === 'RETURN'
  },

  findStepOverBack: function (currentStep) {
    if (this.isReturnInstruction(currentStep - 1)) {
      return this.findStepOutBack(currentStep)
    } else {
      return currentStep - 1
    }
  },

  findStepOverForward: function (currentStep) {
    if (this.isCallInstruction(currentStep)) {
      return this.findStepOutForward(currentStep)
    } else {
      return currentStep + 1
    }
  },

  findStepOutBack: function (currentStep) {
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
  },

  findStepOutForward: function (currentStep) {
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
  },

  // util section
  findLowerBound: function (target, changes) {
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
  },

  resolveAddress: function (vmTraceIndex) {
    var address = this.trace[vmTraceIndex].address
    if (vmTraceIndex > 0) {
      var stack = this.trace[vmTraceIndex - 1].stack // callcode, delegatecall, ...
      address = stack[stack.length - 2]
    }
    return address
  },

  // retrieve the storage of an account just after the execution of tx
  retrieveStorage: function (address, blockNumber, txIndex, callBack) {
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
}
