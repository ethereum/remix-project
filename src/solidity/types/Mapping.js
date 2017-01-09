'use strict'

function Mapping () {
  this.storageSlots = 1
  this.storageBytes = 32
  this.typeName = 'mapping'
}

Mapping.prototype.decodeFromStorage = function (location, storageContent) {
  return '<not implemented>'
}

module.exports = Mapping
