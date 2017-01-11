'use strict'
var DynamicBytes = require('./DynamicByteArray')

class StringType extends DynamicBytes {
  constructor (location) {
    super(location)
    this.typeName = 'string'
  }

  decodeFromStorage (location, storageContent) {
    var decoded = super.decodeFromStorage(location, storageContent)
    return format(decoded)
  }

  decodeFromStack (stackDepth, stack, memory) {
    return super.decodeFromStack(stackDepth, stack, memory)
  }

  decodeFromMemory (offset, memory) {
    var decoded = super.decodeFromMemory(offset, memory)
    return format(decoded)
  }
}

function format (decoded) {
  if (decoded.error) {
    return decoded
  }
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
