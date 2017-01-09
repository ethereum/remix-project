'use strict'
var util = require('./util')
var ValueType = require('./ValueType')

class Enum extends ValueType {
  constructor (enumDef) {
    var storageBytes = 0
    var length = enumDef.children.length
    while (length > 1) {
      length = length / 256
      storageBytes++
    }
    super(1, storageBytes, 'enum')
    this.enumDef = enumDef
  }
}

Enum.prototype.decodeFromStorage = function (location, storageContent) {
  var value = util.extractHexValue(location, storageContent, this.storageBytes)
  value = parseInt(value, 16)
  return output(value, this.enumDef)
}

Enum.prototype.decodeLocals = function (stackDepth, stack, memory) {
  var defaultValue = 0
  if (stack.length - 1 < stackDepth) {
    defaultValue = 0
  } else {
    defaultValue = util.extractHexByteSlice(stack[stack.length - 1 - stackDepth], this.storageBytes, 0)
    defaultValue = parseInt(defaultValue, 16)
  }
  return output(defaultValue, this.enumDef)
}

Enum.prototype.decodeFromMemory = function (offset, memory) {
  var value = memory.substr(offset, 64)
  value = util.extractHexByteSlice(value, this.storageBytes, 0)
  value = parseInt(value, 16)
  return output(value, this.enumDef)
}

function output (value, enumDef) {
  if (enumDef.children.length > value) {
    return enumDef.children[value].attributes.name
  } else {
    return 'INVALID_ENUM<' + value + '>'
  }
}

module.exports = Enum
