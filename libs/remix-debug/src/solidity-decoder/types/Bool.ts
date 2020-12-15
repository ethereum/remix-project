'use strict'
import { ValueType } from './ValueType'
import { extractHexByteSlice } from './util'

export class Bool extends ValueType {
  constructor () {
    super(1, 1, 'bool')
  }

  decodeValue (value) {
    if (!value) {
      return false
    }
    value = extractHexByteSlice(value, this.storageBytes, 0)
    return value !== '00'
  }
}
