'use strict'
var util = require('./util')
var utileth = require('ethereumjs-util')

function FixedByteArray (storageBytes) {
  this.storageSlots = 1
  this.storageBytes = storageBytes
  this.typeName = 'bytesX'
}

FixedByteArray.prototype.decodeFromStorage = function (location, storageContent) {
  var value = util.extractHexByte(location, storageContent, this.storageBytes)
  return '0x' + utileth.unpad(value).toUpperCase()
}

module.exports = FixedByteArray
