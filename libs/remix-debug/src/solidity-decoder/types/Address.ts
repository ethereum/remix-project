'use strict'
const util = require('./util')
const ValueType = require('./ValueType')

export class Address extends ValueType {
  constructor () {
    super(1, 20, 'address')
  }

  decodeValue (value) {
    if (!value) {
      return '0x0000000000000000000000000000000000000000'
    }
    return '0x' + util.extractHexByteSlice(value, this.storageBytes, 0).toUpperCase()
  }
}
