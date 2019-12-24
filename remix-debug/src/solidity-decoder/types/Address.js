'use strict'
const util = require('./util')
const ValueType = require('./ValueType')

class Address extends ValueType {
  constructor () {
    super(1, 20, 'address')
  }

  decodeValue (value) {
    if (!value) {
      return '0x0000000000000000000000000000000000000000'
    } else {
      return '0x' + util.extractHexByteSlice(value, this.storageBytes, 0).toUpperCase()
    }
  }
}

module.exports = Address
