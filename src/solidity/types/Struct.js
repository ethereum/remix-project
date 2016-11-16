'use strict'

function Struct (memberDetails) {
  this.storageSlots = memberDetails.storageSlots
  this.storageBytes = 32
  this.members = memberDetails.members
  this.typeName = 'struct'
}

Struct.prototype.decodeFromStorage = function (location, storageContent) {
  return '<not implemented yet>'
}

module.exports = Struct
