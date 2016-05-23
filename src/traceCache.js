'use strict'
function TraceCache () {
  this.init()
}

TraceCache.prototype.init = function () {
  // ...Changes contains index in the vmtrace of the corresponding changes
  this.depthChanges = []
  this.memoryChanges = []
  this.callDataChanges = []
  this.storageChanges = []
  this.sstore = {} // all sstore occurence in the trace
  this.callStack = {} // contains all callStack by vmtrace index (we need to rebuild it, callstack is not included in the vmtrace)
}

TraceCache.prototype.pushCallDataChanges = function (value) {
  this.callDataChanges.push(value)
}

TraceCache.prototype.pushMemoryChanges = function (value) {
  this.memoryChanges.push(value)
}

TraceCache.prototype.pushDepthChanges = function (value) {
  this.depthChanges.push(value)
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
