'use strict'
const ethutil = require('ethereumjs-util')

module.exports = {
  /*
    ints: IntArray
  */
  hexConvert: function (ints) {
    let ret = '0x'
    for (let i = 0; i < ints.length; i++) {
      const h = ints[i]
      if (h) {
        ret += (h <= 0xf ? '0' : '') + h.toString(16)
      } else {
        ret += '00'
      }
    }
    return ret
  },

  /**
   * Converts a hex string to an array of integers.
   */
  hexToIntArray: function (hexString) {
    if (hexString.slice(0, 2) === '0x') {
      hexString = hexString.slice(2)
    }
    const integers = []
    for (let i = 0; i < hexString.length; i += 2) {
      integers.push(parseInt(hexString.slice(i, i + 2), 16))
    }
    return integers
  },

  /*
    ints: list of BNs
  */
  hexListFromBNs: function (bnList) {
    const ret = []
    for (let k in bnList) {
      const v = bnList[k]
      if (ethutil.BN.isBN(v)) {
        ret.push('0x' + v.toString('hex', 64))
      } else {
        ret.push('0x' + (new ethutil.BN(v)).toString('hex', 64)) // TEMP FIX TO REMOVE ONCE https://github.com/ethereumjs/ethereumjs-vm/pull/293 is released
      }
    }
    return ret
  },

  /*
    ints: list of IntArrays
  */
  hexListConvert: function (intsList) {
    const ret = []
    for (let k in intsList) {
      ret.push(this.hexConvert(intsList[k]))
    }
    return ret
  }
}
