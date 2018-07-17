'use strict'
var util = require('./util')
var ValueType = require('./ValueType')

class Uint extends ValueType {
  constructor (storageBytes) {
    super(1, storageBytes, 'uint' + storageBytes * 8)
  }

  decodeValue (value) {
    value = util.extractHexByteSlice(value, this.storageBytes, 0)
    return util.decodeIntFromHex(value, this.storageBytes, false)
  }
}

module.exports = Uint
