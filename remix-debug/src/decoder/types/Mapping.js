'use strict'
var RefType = require('./RefType')
var util = require('./util')
var ethutil = require('ethereumjs-util')

class Mapping extends RefType {
  constructor (underlyingTypes, location, fullType) {
    super(1, 32, fullType, 'storage')
    this.keyType = underlyingTypes.keyType
    this.valueType = underlyingTypes.valueType
    this.initialDecodedState = null
  }

  async decodeFromStorage (location, storageResolver) {
    if (!this.initialDecodedState) { // cache the decoded initial storage
      var mappingsInitialPreimages
      try {
        mappingsInitialPreimages = await storageResolver.initialMappingsLocation()
        this.initialDecodedState = await this.decodeMappingsLocation(mappingsInitialPreimages, location, storageResolver)
      } catch (e) {
        return {
          value: e.message,
          type: this.typeName
        }
      }
    }
    var mappingPreimages = await storageResolver.mappingsLocation()
    var ret = await this.decodeMappingsLocation(mappingPreimages, location, storageResolver) // fetch mapping storage changes
    ret = Object.assign({}, this.initialDecodedState, ret) // merge changes
    return {
      value: ret,
      type: this.typeName
    }
  }

  decodeFromMemoryInternal (offset, memory) {
    // mappings can only exist in storage and not in memory
    // so this should never be called
    return {
      value: '<not implemented>',
      length: '0x',
      type: this.typeName
    }
  }

  async decodeMappingsLocation (preimages, location, storageResolver) {
    var mapSlot = util.normalizeHex(ethutil.bufferToHex(location.slot))
    if (!preimages[mapSlot]) {
      return {}
    }
    var ret = {}
    for (var i in preimages[mapSlot]) {
      var mapLocation = getMappingLocation(i, location.slot)
      var globalLocation = {
        offset: location.offset,
        slot: mapLocation
      }
      ret[i] = await this.valueType.decodeFromStorage(globalLocation, storageResolver)
      console.log('global location', globalLocation, i, ret[i])
    }
    return ret
  }
}

function getMappingLocation (key, position) {
  // mapping storage location decribed at http://solidity.readthedocs.io/en/develop/miscellaneous.html#layout-of-state-variables-in-storage
  // > the value corresponding to a mapping key k is located at keccak256(k . p) where . is concatenation.

  // key should be a hex string, and position an int
  var mappingK = ethutil.toBuffer('0x' + key)
  var mappingP = ethutil.intToBuffer(position)
  mappingP = ethutil.setLengthLeft(mappingP, 32)
  var mappingKeyBuf = concatTypedArrays(mappingK, mappingP)
  var mappingKeyPreimage = '0x' + mappingKeyBuf.toString('hex')
  var mappingStorageLocation = ethutil.sha3(mappingKeyPreimage)
  mappingStorageLocation = new ethutil.BN(mappingStorageLocation, 16)
  return mappingStorageLocation
}

function concatTypedArrays (a, b) { // a, b TypedArray of same type
  let c = new (a.constructor)(a.length + b.length)
  c.set(a, 0)
  c.set(b, a.length)
  return c
}

module.exports = Mapping
