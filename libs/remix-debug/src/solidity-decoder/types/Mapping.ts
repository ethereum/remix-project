'use strict'
import { RefType } from './RefType'
import { normalizeHex } from './util'
import { toBuffer, setLengthLeft, keccak, BN, bufferToHex, addHexPrefix } from 'ethereumjs-util'

export class Mapping extends RefType {
  keyType
  valueType
  initialDecodedState

  constructor (underlyingTypes, location, fullType) {
    super(1, 32, fullType, 'storage')
    this.keyType = underlyingTypes.keyType
    this.valueType = underlyingTypes.valueType
    this.initialDecodedState = null
  }

  async decodeFromStorage (location, storageResolver) {
    const corrections = this.valueType.members ? this.valueType.members.map((value) => { return value.storagelocation }) : []
    if (!this.initialDecodedState) { // cache the decoded initial storage
      let mappingsInitialPreimages
      try {
        mappingsInitialPreimages = await storageResolver.initialMappingsLocation(corrections)
        this.initialDecodedState = await this.decodeMappingsLocation(mappingsInitialPreimages, location, storageResolver)
      } catch (e) {
        return {
          value: e.message,
          type: this.typeName
        }
      }
    }
    const mappingPreimages = await storageResolver.mappingsLocation(corrections)
    let ret = await this.decodeMappingsLocation(mappingPreimages, location, storageResolver) // fetch mapping storage changes
    ret = Object.assign({}, this.initialDecodedState, ret) // merge changes
    return { value: ret, type: this.typeName }
  }

  decodeFromMemoryInternal (offset, memory) {
    // mappings can only exist in storage and not in memory
    // so this should never be called
    return { value: '', length: '0x0', type: this.typeName }
  }

  async decodeMappingsLocation (preimages, location, storageResolver) {
    const mapSlot = normalizeHex(bufferToHex(location.slot))
    if (!preimages[mapSlot]) {
      return {}
    }
    const ret = {}
    for (const i in preimages[mapSlot]) {
      const mapLocation = getMappingLocation(i, location.slot)
      const globalLocation = {
        offset: location.offset,
        slot: mapLocation
      }
      ret[i] = await this.valueType.decodeFromStorage(globalLocation, storageResolver)
    }
    return ret
  }
}

function getMappingLocation (key, position) {
  // mapping storage location decribed at http://solidity.readthedocs.io/en/develop/miscellaneous.html#layout-of-state-variables-in-storage
  // > the value corresponding to a mapping key k is located at keccak256(k . p) where . is concatenation.

  // key should be a hex string, and position an int
  const mappingK = toBuffer(addHexPrefix(key))
  let mappingP = toBuffer(addHexPrefix(position))
  mappingP = setLengthLeft(mappingP, 32)
  const mappingKeyBuf = concatTypedArrays(mappingK, mappingP)
  const mappingStorageLocation: Buffer = keccak(mappingKeyBuf)
  const mappingStorageLocationinBn: BN = new BN(mappingStorageLocation, 16)
  return mappingStorageLocationinBn
}

function concatTypedArrays (a, b) { // a, b TypedArray of same type
  const c = new (a.constructor)(a.length + b.length)
  c.set(a, 0)
  c.set(b, a.length)
  return c
}
