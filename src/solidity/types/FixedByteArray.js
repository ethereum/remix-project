'use strict'
var util = require('./util')
var ValueType = require('./ValueType')

class FixedByteArray extends ValueType {
  constructor (storageBytes) {
    super(1, storageBytes, 'bytesX')
  }

  decodeFromStorage (location, storageContent) {
    var value = util.extractHexValue(location, storageContent, this.storageBytes)
    return '0x' + value.toUpperCase()
  }

  decodeLocals (stackDepth, stack, memory) {
    if (stack.length - 1 < stackDepth) {
      return '0x'
    } else {
      var value = stack[stack.length - 1 - stackDepth]
      return '0x' + value.substr(2, 2 * this.storageBytes).toUpperCase()
    }
  }

  decodeFromMemory (offset, memory) {
    var value = memory.substr(offset, 64)
    return util.extractHexByteSlice(value, this.storageBytes, 0).toUpperCase()
  }
}

module.exports = FixedByteArray
