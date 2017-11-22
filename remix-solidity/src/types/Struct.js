'use strict'
var util = require('./util')
var RefType = require('./RefType')

class Struct extends RefType {
  constructor (memberDetails, location, fullType) {
    super(memberDetails.storageSlots, 32, 'struct ' + fullType, location)
    this.members = memberDetails.members
  }

  async decodeFromStorage (location, storageResolver) {
    var ret = {}
    for (var k in this.members) {
      var item = this.members[k]
      var globalLocation = {
        offset: location.offset + item.storagelocation.offset,
        slot: util.add(location.slot, item.storagelocation.slot)
      }
      try {
        ret[item.name] = await item.type.decodeFromStorage(globalLocation, storageResolver)
      } catch (e) {
        console.log(e)
        ret[item.name] = '<decoding failed - ' + e.message + '>'
      }
    }
    return {
      value: ret,
      type: this.typeName
    }
  }

  decodeFromMemoryInternal (offset, memory) {
    var ret = {}
    this.members.map((item, i) => {
      var contentOffset = offset
      var member = item.type.decodeFromMemory(contentOffset, memory)
      ret[item.name] = member
      offset += 32
    })
    return {
      value: ret,
      type: this.typeName
    }
  }
}

module.exports = Struct
