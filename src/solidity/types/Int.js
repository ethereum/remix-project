'use strict'
var util = require('./util')
var ValueType = require('./ValueType')

class Int extends ValueType {
  constructor (storageBytes) {
    super(1, storageBytes, 'int')
  }

  decodeFromStorage (location, storageContent) {
    return util.decodeInt(location, storageContent, this.storageBytes, true)
  }

  decodeFromStack (stackDepth, stack, memory) {
    if (stackDepth >= stack.length) {
      return '0'
    } else {
      return util.decodeIntFromHex(stack[stack.length - 1 - stackDepth].replace('0x', ''), 32, true)
    }
  }

  decodeFromMemory (offset, memory) {
    var value = memory.substr(offset, 64)
    return util.decodeIntFromHex(value, 32, true)
  }
}

module.exports = Int
