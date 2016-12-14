'use strict'
var util = require('./util')

function FixedByteArray (storageBytes) {
  this.storageSlots = 1
  this.storageBytes = storageBytes
  this.typeName = 'bytesX'
}

FixedByteArray.prototype.decodeFromStorage = function (location, storageContent) {
  var value = util.extractHexValue(location, storageContent, this.storageBytes)
  return '0x' + value.toUpperCase()
}

FixedByteArray.prototype.decodeLocals = function (stackHeight, stack, memory) {
  if (stack.length - 1 < stackHeight) {
    return '0x'
  } else {
    var value = stack[stack.length - 1 - stackHeight]
    return '0x' + value.substr(2, 2 * this.storageBytes).toUpperCase()
  }
}

FixedByteArray.prototype.decodeFromMemory = function (offset, memory) {
  var value = memory.substr(offset, 64)
  return util.extractHexByteSlice(value, this.storageBytes, 0).toUpperCase()
}

module.exports = FixedByteArray
