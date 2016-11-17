'use strict'
var IntType = require('./Int')
var util = require('./util')

function Uint (storageBytes) {
  this.storageSlots = 1
  this.storageBytes = storageBytes
  this.typeName = 'uint'
  this.decodeInt = new IntType(storageBytes)
}

Uint.prototype.decodeFromStorage = function (location, storageContent) {
  return util.decodeInt(location, storageContent, this.storageBytes)
}

module.exports = Uint
