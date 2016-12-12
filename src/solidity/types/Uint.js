'use strict'
var util = require('./util')

function Uint (storageBytes) {
  this.storageSlots = 1
  this.storageBytes = storageBytes
  this.typeName = 'uint'
}

Uint.prototype.decodeFromStorage = function (location, storageContent) {
  return util.decodeInt(location, storageContent, this.storageBytes, false)
}

Uint.prototype.decodeLocals = function (stackHeight, stack, memory) {
  if (stack.length < stackHeight) {
    return '0'
  } else {
    return util.decodeIntFromHex(stack[stack.length - 1 - stackHeight].replace('0x', ''), this.storageBytes, false)
  }
}

module.exports = Uint
