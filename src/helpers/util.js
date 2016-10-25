'use strict'
module.exports = {
  /*
    ints: IntArray
  */
  hexConvert: function (ints) {
    var ret = '0x'
    for (var i = 0; i < ints.length; i++) {
      var h = ints[i]
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
    var integers = []
    for (var i = 0; i < hexString.length; i += 2) {
      integers.push(parseInt(hexString.slice(i, i + 2), 16))
    }
    return integers
  },

  /*
    ints: list of IntArrays
  */
  hexListConvert: function (intsList) {
    var ret = []
    for (var k in intsList) {
      ret.push(this.hexConvert(intsList[k]))
    }
    return ret
  },

  /*
    ints: ints: IntArray
  */
  formatMemory: function (mem) {
    var hexMem = this.hexConvert(mem).substr(2)
    var ret = []
    for (var k = 0; k < hexMem.length; k += 32) {
      var row = hexMem.substr(k, 32)
      ret.push(row)
    }
    return ret
  },

  /*
    Binary Search:
    Assumes that @arg array is sorted increasingly
    return largest i such that array[i] <= target; return -1 if array[0] > target || array is empty
  */
  findLowerBound: function (target, array) {
    var start = 0
    var length = array.length
    while (length > 0) {
      var half = length >> 1
      var middle = start + half
      if (array[middle] <= target) {
        length = length - 1 - half
        start = middle + 1
      } else {
        length = half
      }
    }
    return start - 1
  },

  /*
    Binary Search:
    Assumes that @arg array is sorted increasingly
    return largest array[i] such that array[i] <= target; return null if array[0] > target || array is empty
  */
  findLowerBoundValue: function (target, array) {
    var index = this.findLowerBound(target, array)
    return index >= 0 ? array[index] : null
  }
}
