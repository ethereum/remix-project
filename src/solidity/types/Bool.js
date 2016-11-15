'use strict'

function Bool () {
  this.storageSlots = 1
  this.storageBytes = 1
  this.typeName = 'bool'
}

Bool.prototype.decodeFromStorage = function (location, storageContent) {
  return '<not implemented yet>'
}

module.exports = Bool
