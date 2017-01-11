'use strict'
var util = require('./util')

class RefType {
  constructor (storageSlots, storageBytes, typeName, location) {
    this.location = location
    this.storageSlots = storageSlots
    this.storageBytes = storageBytes
    this.typeName = typeName
    this.basicType = 'RefType'
  }

  decodeFromStack (stackDepth, stack, memory, storage) {
    if (!storage) {
      storage = {} // TODO this is a fallback, should manage properly locals store in storage
    }
    if (stack.length - 1 < stackDepth) {
      return { error: '<decoding failed - stack underflow ' + stackDepth + '>' }
    }
    var offset = stack[stack.length - 1 - stackDepth]
    offset = parseInt(offset, 16)
    return this.decode(offset, memory, storage)
  }

  decode (offset, memory, storage) {
    if (!storage) {
      storage = {} // TODO this is a fallback, should manage properly locals store in storage
    }
    if (util.storageStore(this)) {
      return this.decodeFromStorage({ offset: 0, slot: offset }, storage)
    } else if (util.memoryStore(this)) {
      return this.decodeFromMemory(offset, memory)
    } else {
      return { error: '<decoding failed - no decoder for ' + this.location + '>' }
    }
  }
}

module.exports = RefType
