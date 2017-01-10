'use strict'
var util = require('./util')
var ValueType = require('./ValueType')

class Bool extends ValueType {
  constructor () {
    super(1, 1, 'bool')
  }
}

Bool.prototype.decodeFromStorage = function (location, storageContent) {
  var value = util.extractHexValue(location, storageContent, this.storageBytes)
  return value !== '00'
}

Bool.prototype.decodeFromStack = function (stackDepth, stack, memory) {
  if (stack.length - 1 < stackDepth) {
    return false
  } else {
    return util.extractHexByteSlice(stack[stack.length - 1 - stackDepth], this.storageBytes, 0) !== '00'
  }
}

Bool.prototype.decodeFromMemory = function (offset, memory) {
  var value = memory.substr(offset, 64)
  return util.extractHexByteSlice(value, this.storageBytes, 0) !== '00'
}

module.exports = Bool
