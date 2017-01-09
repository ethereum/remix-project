'use strict'
var util = require('./util')

function Address () {
  this.storageSlots = 1
  this.storageBytes = 20
  this.typeName = 'address'
}

Address.prototype.decodeFromStorage = function (location, storageContent) {
  var value = util.extractHexValue(location, storageContent, this.storageBytes)
  return '0x' + value.toUpperCase()
}

Address.prototype.decodeLocals = function (stackDepth, stack, memory) {
  if (stackDepth >= stack.length) {
    return '0x0000000000000000000000000000000000000000'
  } else {
    return '0x' + util.extractHexByteSlice(stack[stack.length - 1 - stackDepth], this.storageBytes, 0)
  }
}

Address.prototype.decodeFromMemory = function (offset, memory) {
  var value = memory.substr(offset, 64)
  value = util.extractHexByteSlice(value, this.storageBytes, 0)
  return value
}

module.exports = Address
