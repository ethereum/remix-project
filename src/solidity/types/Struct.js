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
    offset = 2 * offset
    var ret = {}
    this.members.map((item, i) => {
      var contentOffset = offset
      if (item.type.basicType === 'RefType') {
        contentOffset = memory.substr(contentOffset, 64)
        contentOffset = parseInt(contentOffset, 16)
      }
      item.type.location = this.location
      var member = item.type.decode(contentOffset, memory)
      ret[item.name] = member
      offset += 64
    })
    return ret
  }
}

module.exports = Struct
