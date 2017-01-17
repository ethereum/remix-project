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
        offset: location.offset + item.storagelocation.offset,
        slot: util.add(location.slot, item.storagelocation.slot)
      }
      ret[item.name] = item.type.decodeFromStorage(globalLocation, storageContent)
    })
    return ret
  }

  decodeFromMemoryInternal (offset, memory) {
    var ret = {}
    this.members.map((item, i) => {
      var contentOffset = offset
      var member = item.type.decodeFromMemory(contentOffset, memory)
      ret[item.name] = member
      offset += 32
    })
    return ret
  }
}

module.exports = Struct
