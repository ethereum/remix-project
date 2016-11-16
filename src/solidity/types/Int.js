'use strict'
var util = require('./util')
var BN = require('ethereumjs-util').BN
var ethutil = require('ethereumjs-util')

function Int (storageBytes) {
  this.storageSlots = 1
  this.storageBytes = storageBytes
  this.typeName = 'int'
}

Int.prototype.decodeFromStorage = function (location, storageContent) {
  var slot = ethutil.bufferToHex(ethutil.setLengthLeft(location.slot, 32))
  if (!storageContent[slot]) {
    return '0'
  }
  var value = util.extractValue(storageContent[slot], this.storageBytes, location)
  var bigNumber = new BN(value.replace('0x', ''), 16)
  if (isNegative(bigNumber, this.storageBytes)) {
    return ethutil.fromSigned(ethutil.toUnsigned(bigNumber)).toString(10)
  } else {
    return bigNumber.toString(10)
  }
}

module.exports = Int

function isNegative (value, storageBytes) {
  var binary = value.toString(2)
  return binary.length < storageBytes ? false : binary[0] === '1'
}
