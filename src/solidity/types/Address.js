'use strict'
var util = require('./util')

function Address () {
  this.storageSlots = 1
  this.storageBytes = 20
  this.typeName = 'address'
}

Address.prototype.decodeFromStorage = function (location, storageContent) {
  var value = util.extractHexValue(location, storageContent, this.storageBytes)
  return '0x' + value.toUpperCase()
}

module.exports = Address
