'use strict'

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
      slot: location.slot + item.location.slot
    }
    ret[item.name] = item.type.decodeFromStorage(globalLocation, storageContent)
  })
  return ret
}

module.exports = Struct
