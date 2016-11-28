'use strict'
var util = require('./util')

function Bool () {
  this.storageSlots = 1
  this.storageBytes = 1
  this.typeName = 'bool'
}

Bool.prototype.decodeFromStorage = function (location, storageContent) {
  var value = util.extractHexValue(location, storageContent, this.storageBytes)
  return value !== '00'
}

module.exports = Bool
