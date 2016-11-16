'use strict'
var util = require('./util')
var ethutil = require('ethereumjs-util')
var BN = require('ethereumjs-util').BN

function Uint (storageBytes) {
  this.storageSlots = 1
  this.storageBytes = storageBytes
  this.typeName = 'uint'
}

Uint.prototype.decodeFromStorage = function (location, storageContent) {
  var slot = ethutil.bufferToHex(ethutil.setLengthLeft(location.slot, 32))
  if (!storageContent[slot]) {
    return '0'
  }
  var value = util.extractValue(storageContent[slot], this.storageBytes, location)
  var bigNumber = new BN(value.replace('0x', ''), 16)
  return bigNumber.toString(10)
}

module.exports = Uint
