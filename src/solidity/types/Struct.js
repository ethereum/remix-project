'use strict'

function Struct (memberDetails) {
  this.storageSlots = Math.ceil(memberDetails.storageBytes / 32)
  this.storageBytes = 32
  this.members = memberDetails.members
  this.typeName = 'struct'
}

Struct.prototype.decodeFromStorage = function (location, storageContent) {
  return '<not implemented yet>'
}

module.exports = Struct
