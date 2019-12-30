'use strict'
const helper = require('../util')

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

// outOfGas has been removed because gas left logging is apparently made differently
// in the vm/geth/eth. TODO add the error property (with about the error in all clients)
TraceCache.prototype.pushCall = function (step, index, address, callStack, reverted) {
  let validReturnStep = step.op === 'RETURN' || step.op === 'STOP'
  if (validReturnStep || reverted) {
    if (this.currentCall) {
      this.currentCall.call.return = index - 1
      if (!validReturnStep) {
        this.currentCall.call.reverted = reverted
      }
      var parent = this.currentCall.parent
      this.currentCall = parent ? { call: parent.call, parent: parent.parent } : null
    }
  } else {
    let call = {
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
  const memory = trace[lastMemoryChange].memory
  const stack = trace[index].stack
  const offset = 2 * parseInt(stack[stack.length - 2], 16)
  const size = 2 * parseInt(stack[stack.length - 3], 16)
  this.contractCreation[token] = '0x' + memory.join('').substr(offset, size)
}

TraceCache.prototype.pushContractCreation = function (token, code) {
  this.contractCreation[token] = code
}

TraceCache.prototype.resetStoreChanges = function (index, address, key, value) {
  this.sstore = {}
  this.storageChanges = []
}

TraceCache.prototype.pushStoreChanges = function (index, address, key, value) {
  this.sstore[index] = {
    'address': address,
    'key': key,
    'value': value,
    'hashedKey': helper.sha3_256(key)
  }
  this.storageChanges.push(index)
}

TraceCache.prototype.accumulateStorageChanges = function (index, address, storage) {
  const ret = Object.assign({}, storage)
  for (var k in this.storageChanges) {
    const changesIndex = this.storageChanges[k]
    if (changesIndex > index) {
      return ret
    }
    var sstore = this.sstore[changesIndex]
    if (sstore.address === address && sstore.key) {
      ret[sstore.hashedKey] = {
        key: sstore.key,
        value: sstore.value
      }
    }
  }
  return ret
}

module.exports = TraceCache
