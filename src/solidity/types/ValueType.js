'use strict'
var util = require('./util')

class ValueType {
  constructor (storageSlots, storageBytes, typeName) {
    this.storageSlots = storageSlots
    this.storageBytes = storageBytes
    this.typeName = typeName
    this.basicType = 'ValueType'
  }

  decodeFromStorage (location, storageContent) {
    var value = util.extractHexValue(location, storageContent, this.storageBytes)
    return this.decodeValue(value)
  }

  decodeFromStack (stackDepth, stack, memory) {
    if (stackDepth >= stack.length) {
      return this.decodeValue('')
    } else {
      return this.decodeValue(stack[stack.length - 1 - stackDepth].replace('0x', ''))
    }
  }

  decodeFromMemory (offset, memory) {
    var value = memory.substr(2 * offset, 64)
    return this.decodeValue(util.extractHexByteSlice(value, this.storageBytes, 0))
  }

  decode (offset, memory) {
    offset = offset / 2
    return this.decodeFromMemory(offset, memory)
  }
}

module.exports = ValueType
