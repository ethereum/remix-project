'use strict'
var RefType = require('./RefType')
var ethutil = require('ethereumjs-util')

class Mapping extends RefType {
  constructor (underlyingTypes, location, fullType) {
    super(1, 32, fullType, 'storage')
    this.keyType = underlyingTypes.keyType
    this.valueType = underlyingTypes.valueType
  }

  setMappingElements (mappingKeyPreimages) {
    this.preimages = mappingKeyPreimages
  }

  async decodeFromStorage (location, storageResolver) {
    // location.offset should always be 0 for a mapping (?? double check)

    var ret = {}
    for (var i in this.preimages) {
      var preimage = this.preimages[i]
      var mapLocation = getMappingLocation(preimage, location.slot)
      var globalLocation = {
        offset: location.offset,
        slot: mapLocation
      }
      ret[preimage] = await this.valueType.decodeFromStorage(globalLocation, storageResolver)
    }

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
}

function getMappingLocation (key, position) {
  // mapping storage location decribed at http://solidity.readthedocs.io/en/develop/miscellaneous.html#layout-of-state-variables-in-storage
  // > the value corresponding to a mapping key k is located at keccak256(k . p) where . is concatenation.

  // key should be a hex string, and position an int
  var mappingK = ethutil.toBuffer('0x' + key)
  mappingK = ethutil.setLengthLeft(mappingK, 32)
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
