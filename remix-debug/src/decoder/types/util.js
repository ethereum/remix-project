'use strict'
var ethutil = require('ethereumjs-util')
var BN = require('ethereumjs-util').BN

module.exports = {
  readFromStorage: readFromStorage,
  decodeIntFromHex: decodeIntFromHex,
  extractHexValue: extractHexValue,
  extractHexByteSlice: extractHexByteSlice,
  toBN: toBN,
  add: add,
  extractLocation: extractLocation,
  removeLocation: removeLocation,
  normalizeHex: normalizeHex,
  extractLocationFromAstVariable: extractLocationFromAstVariable
}

function decodeIntFromHex (value, byteLength, signed) {
  var bigNumber = new BN(value, 16)
  if (signed) {
    bigNumber = bigNumber.fromTwos(8 * byteLength)
  }
  return bigNumber.toString(10)
}

function readFromStorage (slot, storageResolver) {
  var hexSlot = '0x' + normalizeHex(ethutil.bufferToHex(slot))
  return new Promise((resolve, reject) => {
    storageResolver.storageSlot(hexSlot, (error, slot) => {
      if (error) {
        return reject(error)
      } else {
        if (!slot) {
          slot = {
            key: slot,
            value: ''
          }
        }
        return resolve(normalizeHex(slot.value))
      }
    })
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
 * @param {Object} storageResolver  - storage resolver
 * @param {Int} byteLength  - Length of the byte slice to extract
 */
async function extractHexValue (location, storageResolver, byteLength) {
  var slotvalue
  try {
    slotvalue = await readFromStorage(location.slot, storageResolver)
  } catch (e) {
    console.log(e)
    return '0x'
  }
  return extractHexByteSlice(slotvalue, byteLength, location.offset)
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

function extractLocationFromAstVariable (node) {
  if (node.attributes.storageLocation !== 'default') {
    return node.attributes.storageLocation
  } else if (node.attributes.stateVariable) {
    return 'storage'
  } else {
    return 'default' // local variables => storage, function parameters & return values => memory, state => storage
  }
}

function normalizeHex (hex) {
  hex = hex.replace('0x', '')
  if (hex.length < 64) {
    return (new Array(64 - hex.length + 1).join('0')) + hex
  }
  return hex
}
