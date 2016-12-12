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

Address.prototype.decodeLocals = function (stackHeight, stack, memory) {
  if (stack.length < stackHeight) {
    return '0x0000000000000000000000000000000000000000'
  } else {
    return '0x' + util.extractHexByteSlice(stack[stack.length - 1 - stackHeight], this.storageBytes, 0)
  }
}

module.exports = Address
