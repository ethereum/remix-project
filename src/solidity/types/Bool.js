'use strict'
var util = require('./util')

function Bool () {
  this.storageSlots = 1
  this.storageBytes = 1
  this.typeName = 'bool'
}

Bool.prototype.decodeFromStorage = function (location, storageContent) {
  var value = util.extractValue(location, storageContent, this.storageBytes)
  return value !== '0x00'
}

module.exports = Bool
