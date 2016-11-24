'use strict'
var util = require('./util')

function Address () {
  this.storageSlots = 1
  this.storageBytes = 20
  this.typeName = 'address'
}

Address.prototype.decodeFromStorage = function (location, storageContent) {
  return '0x' + util.extractHexByte(location, storageContent, this.storageBytes)
}

module.exports = Address
