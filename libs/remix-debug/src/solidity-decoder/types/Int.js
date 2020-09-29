'use strict'
const util = require('./util')
const ValueType = require('./ValueType')

class Int extends ValueType {
  constructor (storageBytes) {
    super(1, storageBytes, 'int' + storageBytes * 8)
  }

  decodeValue (value) {
    value = util.extractHexByteSlice(value, this.storageBytes, 0)
    return util.decodeIntFromHex(value, this.storageBytes, true)
  }
}

module.exports = Int
