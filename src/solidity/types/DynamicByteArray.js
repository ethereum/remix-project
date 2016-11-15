'use strict'

function DynamicByteArray () {
  this.storageSlots = 1
  this.storageBytes = 32
  this.typeName = 'bytes'
}

DynamicByteArray.prototype.decodeFromStorage = function (location, storageContent) {
  return '<not implemented yet>'
}

module.exports = DynamicByteArray
