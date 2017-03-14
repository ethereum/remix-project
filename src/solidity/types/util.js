'use strict'
var ethutil = require('ethereumjs-util')
var BN = require('ethereumjs-util').BN

module.exports = {
  readFromStorage: readFromStorage,
  decodeIntFromHex: decodeIntFromHex,
  extractHexValue: extractHexValue,
  extractHexByteSlice: extractHexByteSlice,
  sha3: sha3,
  toBN: toBN,
  add: add,
  extractLocation: extractLocation,
  removeLocation: removeLocation
}

function decodeIntFromHex (value, byteLength, signed) {
  var bigNumber = new BN(value, 16)
  if (signed) {
    bigNumber = bigNumber.fromTwos(8 * byteLength)
  }
  return bigNumber.toString(10)
}

async function readFromStorage (slot, storageContent) {
  var ret
  var hexSlot = ethutil.bufferToHex(slot)
  return new Promise((resolve, reject) => {
    if (storageContent[hexSlot] !== undefined) {
      ret = storageContent[hexSlot].replace(/^0x/, '')
    } else {
      hexSlot = ethutil.bufferToHex(ethutil.setLengthLeft(slot, 32))
      if (storageContent[hexSlot] !== undefined) {
        ret = storageContent[hexSlot].replace(/^0x/, '')
      } else {
        ret = '000000000000000000000000000000000000000000000000000000000000000'
      }
    }
    if (ret.length < 64) {
      ret = (new Array(64 - ret.length + 1).join('0')) + ret
    }
    return resolve(ret)
  })
}

/**
 * @returns a hex encoded byte slice of length @arg byteLength from inside @arg slotValue.
 *
 * @param {String} slotValue  - hex encoded value to extract the byte slice from
 * @param {Int} byteLength  - Length of the byte slice to extract
 * @param {Int} offsetFromLSB  - byte distance from the right end slot value to the right end of the byte slice
 */
function extractHexByteSlice (slotValue, byteLength, offsetFromLSB) {
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
async function extractHexValue (location, storageContent, byteLength) {
  var slotvalue = await readFromStorage(location.slot, storageContent)
  return extractHexByteSlice(slotvalue, byteLength, location.offset)
}

function sha3 (slot) {
  var remoteSlot = ethutil.bufferToHex(ethutil.setLengthLeft(slot, 32))
  var key = ethutil.sha3(remoteSlot)
  return ethutil.bufferToHex(key)
}

function toBN (value) {
  if (value instanceof BN) {
    return value
  } else if (value.indexOf && value.indexOf('0x') === 0) {
    value = ethutil.unpad(value.replace('Ox', ''))
    value = new BN(value === '' ? '0' : value, 16)
  } else if (!isNaN(value)) {
    value = new BN(value)
  }
  return value
}

function add (value1, value2) {
  return toBN(value1).add(toBN(value2))
}

function removeLocation (type) {
  return type.replace(/( storage ref| storage pointer| memory| calldata)/g, '')
}

function extractLocation (type) {
  var match = type.match(/( storage ref| storage pointer| memory| calldata)?$/)
  if (match[1] !== '') {
    return match[1].trim()
  } else {
    return null
  }
}
