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
        h = h.toString(16)
        ret += ('0x' + h) < 0x10 ? '0' + h : h
      } else {
        ret += '00'
      }
    }
    return ret
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
  }
}
