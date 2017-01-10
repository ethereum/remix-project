'use strict'
var util = require('./util')
var RefType = require('./RefType')

class Struct extends RefType {
  constructor (memberDetails, location) {
    super(memberDetails.storageSlots, 32, 'struct', location)
    this.members = memberDetails.members
  }

  decodeFromStorage (location, storageContent) {
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

  decodeFromMemory (offset, memory) {
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
}

module.exports = Struct
