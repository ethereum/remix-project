'use strict'
import { ValueType } from './ValueType'

export class FixedByteArray extends ValueType {
  constructor (storageBytes) {
    super(1, storageBytes, 'bytes' + storageBytes)
  }

  decodeValue (value) {
    return '0x' + value.substr(0, 2 * this.storageBytes).toUpperCase()
  }
}
