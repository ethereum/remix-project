'use strict'
const ValueType = require('./ValueType')
const util = require('./util')

export class Bool extends ValueType {
  constructor () {
    super(1, 1, 'bool')
  }

  decodeValue (value) {
    if (!value) {
      return false
    }
    value = util.extractHexByteSlice(value, this.storageBytes, 0)
    return value !== '00'
  }
}
