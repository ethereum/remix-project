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
    if (stack.length - 1 < stackDepth) {
      return { error: '<decoding failed - stack underflow ' + stackDepth + '>' }
    }
    var offset = stack[stack.length - 1 - stackDepth]
    offset = parseInt(offset, 16)
    return decodeInternal(this, offset, memory, storage)
  }

  decode (offset, memory, storage) {
    offset = memory.substr(2 * offset, 64)
    offset = parseInt(offset, 16)
    return decodeInternal(this, offset, memory, storage)
  }
}

function decodeInternal (self, offset, memory, storage) {
  if (!storage) {
    storage = {} // TODO this is a fallback, should manage properly locals store in storage
  }
  if (util.storageStore(self)) {
    return self.decodeFromStorage({ offset: 0, slot: offset }, storage)
  } else if (util.memoryStore(self)) {
    return self.decodeFromMemory(offset, memory)
  } else {
    return { error: '<decoding failed - no decoder for ' + self.location + '>' }
  }
}

module.exports = RefType
