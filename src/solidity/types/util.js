'use strict'
var ethutil = require('ethereumjs-util')
var BN = require('ethereumjs-util').BN

module.exports = {
  extractHexByteSlice: extractHexByteSlice,
  readFromStorage: readFromStorage,
  decodeInt: decodeInt
}

function decodeInt (location, storageContent, byteLength, signed) {
  var slotvalue = readFromStorage(location.slot, storageContent)
  var value = extractHexByteSlice(slotvalue, byteLength, location.offset)
  var bigNumber = new BN(value, 16)
  if (signed) {
    bigNumber = bigNumber.fromTwos(8 * byteLength)
  }
  return bigNumber.toString(10)
}

function readFromStorage (slot, storageContent) {
  var hexSlot = ethutil.bufferToHex(slot)
  if (storageContent[hexSlot] !== undefined) {
    return storageContent[hexSlot]
  } else {
    hexSlot = ethutil.bufferToHex(ethutil.setLengthLeft(slot, 32))
    if (storageContent[hexSlot] !== undefined) {
      return storageContent[hexSlot]
    } else {
      return '0x0'
    }
  }
}

function extractHexByteSlice (slotValue, byteLength, offsetFromLSB) {
  slotValue = slotValue.replace('0x', '')
  if (slotValue.length < 64) {
    slotValue = (new Array(64 - slotValue.length + 1).join('0')) + slotValue
  }
  var offset = slotValue.length - 2 * offsetFromLSB - 2 * byteLength
  return slotValue.substr(offset, 2 * byteLength)
}
