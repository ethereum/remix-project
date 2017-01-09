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

Uint.prototype.decodeLocals = function (stackDepth, stack, memory) {
  if (stackDepth >= stack.length) {
    return '0'
  } else {
    return util.decodeIntFromHex(stack[stack.length - 1 - stackDepth].replace('0x', ''), this.storageBytes, false)
  }
}

Uint.prototype.decodeFromMemory = function (offset, memory) {
  var value = memory.substr(offset, 64)
  return util.decodeIntFromHex(value, this.storageBytes, false)
}

module.exports = Uint
