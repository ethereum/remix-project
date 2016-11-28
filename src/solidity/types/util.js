'use strict'
var ethutil = require('ethereumjs-util')
var BN = require('ethereumjs-util').BN

module.exports = {
  readFromStorage: readFromStorage,
  decodeInt: decodeInt,
  extractHexByte: extractHexByte,
  sha3: sha3
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

/**
 * @returns a hex encoded byte slice of length @arg byteLength from inside @arg slotValue.
 *
 * @param {String} slotValue  - right aligned hex encoded value to extract the byte slice from (can have 0x prefix)
 * @param {Int} byteLength  - Length of the byte slice to extract
 * @param {Int} offsetFromLSB  - byte distance from the right end slot value to the right end of the byte slice
 */
function extractHexByteSlice (slotValue, byteLength, offsetFromLSB) {
  slotValue = slotValue.replace('0x', '')
  if (slotValue.length < 64) {
    slotValue = (new Array(64 - slotValue.length + 1).join('0')) + slotValue
  }
  var offset = slotValue.length - 2 * offsetFromLSB - 2 * byteLength
  return slotValue.substr(offset, 2 * byteLength)
}

/**
 * @returns a hex encoded storage content at the given @arg location. it does not have Ox prefix but always has the full length.
 *
 * @param {Object} location  - object containing the slot and offset of the data to extract.
 * @param {Object} storageContent  - full storage mapping.
 * @param {Int} byteLength  - Length of the byte slice to extract
 */
function extractHexByte (location, storageContent, byteLength) {
  var slotvalue = readFromStorage(location.slot, storageContent)
  return extractHexByteSlice(slotvalue, byteLength, location.offset)
}

function sha3 (slot) {
  var remoteSlot = ethutil.bufferToHex(ethutil.setLengthLeft(slot, 32))
  var key = ethutil.sha3(remoteSlot)
  return ethutil.bufferToHex(key)
}
