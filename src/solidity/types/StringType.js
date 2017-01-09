'use strict'
var DynamicBytes = require('./DynamicByteArray')

function StringType () {
  this.storageSlots = 1
  this.storageBytes = 32
  this.typeName = 'string'
  this.dynamicBytes = new DynamicBytes()
}

StringType.prototype.decodeFromStorage = function (location, storageContent) {
  var decoded = this.dynamicBytes.decodeFromStorage(location, storageContent)
  return format(decoded)
}

StringType.prototype.decodeLocals = function (stackDepth, stack, memory) {
  var decoded = this.dynamicBytes.decodeLocals(stackDepth, stack, memory)
  return format(decoded)
}

StringType.prototype.decodeFromMemory = function (offset, memory) {
  var decoded = this.dynamicBytes.decodeFromMemory(offset, memory)
  return format(decoded)
}

StringType.prototype.decodeFromMemory = function (offset, memory) {
  var decoded = this.dynamicBytes.decodeFromMemory(offset, memory)
  return format(decoded)
}

function format (decoded) {
  var value = decoded.value
  value = value.replace('0x', '').replace(/(..)/g, '%$1')
  var ret = {
    length: decoded.length,
    raw: decoded.value
  }
  try {
    ret.value = decodeURIComponent(value)
  } catch (e) {
    ret.error = 'Invalid UTF8 encoding'
    ret.raw = decoded.value
  }
  return ret
}

module.exports = StringType
