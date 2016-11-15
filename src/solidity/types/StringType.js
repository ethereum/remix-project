'use strict'

function StringType () {
  this.storageSlots = 1
  this.storageBytes = 32
  this.typeName = 'string'
}

StringType.prototype.decodeFromStorage = function (location, storageContent) {
  return '<not implemented yet>'
}

module.exports = StringType
