'use strict'
var util = require('./util')

class RefType {
  constructor (storageSlots, storageBytes, typeName, location) {
    this.location = location
    this.storageSlots = storageSlots
    this.storageBytes = storageBytes
    this.typeName = typeName
  }

  decodeFromStack (stackDepth, stack, memory, storage) {
    if (stack.length - 1 < stackDepth) {
      return []
    }
    var offset = stack[stack.length - 1 - stackDepth]
    offset = 2 * parseInt(offset, 16)
    if (util.storageStore(this)) {
      return this.decodeFromStorage(offset, storage)
    } else if (util.memoryStore(this)) {
      return this.decodeFromMemory(offset, memory)
    } else {
      return '<decoding failed - no decoder for ' + this.location + '>'
    }
  }
}

module.exports = RefType
