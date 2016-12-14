'use strict'
var util = require('./util')

function Struct (memberDetails) {
  this.storageSlots = memberDetails.storageSlots
  this.storageBytes = 32
  this.members = memberDetails.members
  this.typeName = 'struct'
}

Struct.prototype.decodeFromStorage = function (location, storageContent) {
  var ret = {}
  this.members.map(function (item, i) {
    var globalLocation = {
      offset: location.offset + item.location.offset,
      slot: util.add(location.slot, item.location.slot)
    }
    ret[item.name] = item.type.decodeFromStorage(globalLocation, storageContent)
  })
  return ret
}

Struct.prototype.decodeLocals = function (stackHeight, stack, memory) {
  if (stack.length - 1 < stackHeight) {
    return {}
  } else { // TODO manage decoding locals from storage
    var offset = stack[stack.length - 1 - stackHeight]
    offset = 2 * parseInt(offset, 16)
    return this.decodeFromMemory(offset, memory)
  }
}

Struct.prototype.decodeFromMemory = function (offset, memory) {
  var ret = {}
  this.members.map(function (item, i) {
    var contentOffset = offset
    if (item.type.typeName === 'bytes' || item.type.typeName === 'string' || item.type.typeName === 'array' || item.type.typeName === 'struct') {
      contentOffset = memory.substr(offset, 64)
      contentOffset = 2 * parseInt(contentOffset, 16)
    }
    var member = item.type.decodeFromMemory(contentOffset, memory)
    ret[item.name] = member
    offset += 64
  })
  return ret
}

module.exports = Struct
