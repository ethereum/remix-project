'use strict'
var util = require('./util')
var ValueType = require('./ValueType')

class Address extends ValueType {
  constructor () {
    super(1, 20, 'address')
  }

  decodeFromStorage (location, storageContent) {
    var value = util.extractHexValue(location, storageContent, this.storageBytes)
    return '0x' + value.toUpperCase()
  }

  decodeFromStack (stackDepth, stack, memory) {
    if (stackDepth >= stack.length) {
      return '0x0000000000000000000000000000000000000000'
    } else {
      return '0x' + util.extractHexByteSlice(stack[stack.length - 1 - stackDepth], this.storageBytes, 0)
    }
  }

  decodeFromMemory (offset, memory) {
    var value = memory.substr(offset, 64)
    value = util.extractHexByteSlice(value, this.storageBytes, 0)
    return value
  }
}

module.exports = Address
