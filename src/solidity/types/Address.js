'use strict'

function Address () {
  this.storageSlots = 1
  this.storageBytes = 20
  this.typeName = 'address'
}

Address.prototype.decodeFromStorage = function (location, storageContent) {
  return '<not implemented yet>'
}

module.exports = Address
