'use strict'
var util = require('./util')

function Bool () {
  this.storageSlots = 1
  this.storageBytes = 1
  this.typeName = 'bool'
}

Bool.prototype.decodeFromStorage = function (location, storageContent) {
  var value = util.extractHexValue(location, storageContent, this.storageBytes)
  return value !== '00'
}

Bool.prototype.decodeLocals = function (stackDepth, stack, memory) {
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
