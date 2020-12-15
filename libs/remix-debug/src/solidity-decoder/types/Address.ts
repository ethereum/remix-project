'use strict'
import { extractHexByteSlice } from './util'
import { ValueType } from './ValueType'

export class Address extends ValueType {
  constructor () {
    super(1, 20, 'address')
  }

  decodeValue (value) {
    if (!value) {
      return '0x0000000000000000000000000000000000000000'
    }
    return '0x' + extractHexByteSlice(value, this.storageBytes, 0).toUpperCase()
  }
}
