'use strict'
function TraceCache () {
  this.init()
}

TraceCache.prototype.init = function () {
  // ...Changes contains index in the vmtrace of the corresponding changes

  this.callChanges = []
  this.returnChanges = []
  this.calls = {}
  this.callsData = {}
  this.contractCreation = {}

  this.callDataChanges = []
  this.memoryChanges = []
  this.storageChanges = []
  this.sstore = {} // all sstore occurence in the trace
  this.callStack = {} // contains all callStack by vmtrace index (we need to rebuild it, callstack is not included in the vmtrace)
}

TraceCache.prototype.pushCallDataChanges = function (value, calldata) {
  this.callDataChanges.push(value)
  this.callsData[value] = calldata
}

TraceCache.prototype.pushMemoryChanges = function (value) {
  this.memoryChanges.push(value)
}

TraceCache.prototype.pushCallChanges = function (step, value) {
  this.callChanges.push(value)
  this.calls[value] = {
    op: step.op
  }
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

TraceCache.prototype.pushReturnChanges = function (value) {
  this.returnChanges.push(value)
}

TraceCache.prototype.pushCallStack = function (index, callStack) {
  this.callStack[index] = callStack
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
