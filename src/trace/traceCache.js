'use strict'
function TraceCache () {
  this.init()
}

TraceCache.prototype.init = function () {
  // ...Changes contains index in the vmtrace of the corresponding changes

  this.returnValues = {}
  this.currentCall = null
  this.callsTree = null
  this.callsData = {}
  this.contractCreation = {}
  this.steps = {}
  this.addresses = []

  this.callDataChanges = []
  this.memoryChanges = []
  this.storageChanges = []
  this.sstore = {} // all sstore occurence in the trace
}

TraceCache.prototype.pushSteps = function (index, currentCallIndex) {
  this.steps[index] = currentCallIndex
}

TraceCache.prototype.pushCallDataChanges = function (value, calldata) {
  this.callDataChanges.push(value)
  this.callsData[value] = calldata
}

TraceCache.prototype.pushMemoryChanges = function (value) {
  this.memoryChanges.push(value)
}

TraceCache.prototype.pushCall = function (step, index, address, callStack, reverted, outOfGas) {
  if (step.op === 'RETURN' || step.op === 'STOP' || reverted) {
    if (this.currentCall) {
      this.currentCall.call.return = index - 1
      this.currentCall.call.reverted = reverted
      this.currentCall.call.outOfGas = outOfGas
      var parent = this.currentCall.parent
      this.currentCall = parent ? { call: parent.call, parent: parent.parent } : null
    }
  } else {
    var call = {
      op: step.op,
      address: address,
      callStack: callStack,
      calls: {},
      start: index
    }
    this.addresses.push(address)
    if (this.currentCall) {
      this.currentCall.call.calls[index] = call
    } else {
      this.callsTree = { call: call }
    }
    this.currentCall = { call: call, parent: this.currentCall }
  }
}

TraceCache.prototype.pushReturnValue = function (step, value) {
  this.returnValues[step] = value
}

TraceCache.prototype.pushContractCreationFromMemory = function (index, token, trace, lastMemoryChange) {
  var memory = trace[lastMemoryChange].memory
  var stack = trace[index].stack
  var offset = 2 * parseInt(stack[stack.length - 2], 16)
  var size = 2 * parseInt(stack[stack.length - 3], 16)
  this.contractCreation[token] = '0x' + memory.join('').substr(offset, size)
}

TraceCache.prototype.pushContractCreation = function (token, code) {
  this.contractCreation[token] = code
}

TraceCache.prototype.pushStoreChanges = function (index, address, key, value) {
  this.sstore[index] = {
    'address': address,
    'key': key,
    'value': value
  }
  this.storageChanges.push(index)
}

TraceCache.prototype.rebuildStorage = function (address, storage, index) {
  for (var k in this.storageChanges) {
    var changesIndex = this.storageChanges[k]
    if (changesIndex > index) {
      return storage
    }
    var sstore = this.sstore[changesIndex]
    if (sstore.address === address && sstore.key) {
      storage[sstore.key] = sstore.value
    }
  }
  return storage
}

module.exports = TraceCache
