'use strict'
var util = require('./util')

function Int (storageBytes) {
  this.storageSlots = 1
  this.storageBytes = storageBytes
  this.typeName = 'int'
}

Int.prototype.decodeFromStorage = function (location, storageContent) {
  return util.decodeInt(location, storageContent, this.storageBytes, true)
}

Int.prototype.decodeLocals = function (stackHeight, stack, memory) {
  if (stack.length - 1 < stackHeight) {
    return '0'
  } else {
    return util.decodeIntFromHex(stack[stack.length - 1 - stackHeight].replace('0x', ''), 32, true)
  }
}

module.exports = Int
