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
  },

  /*
    Binary Search:
    Assumes that @arg array is sorted increasingly
    return smallest i such that changes[i] <= target does not hold,
    or changes.length if all elements are < target.
    It returns the index where target could be inserted to maintain the order of the array
  */
  findLowerBound: function (target, array) {
    return findLowerBoundInternal(target, array, 0, array.length)
  },

  findLowerBoundValue: function (target, array) {
    var index = this.findLowerBound(target, array)
    return array[index]
  }
}

function findLowerBoundInternal (target, array, lowerbound, length) {
  while (length > 1) {
    var half = length >> 1
    var middle = lowerbound + half
    if (array[middle] < target) {
      length = length - (middle - lowerbound)
      lowerbound = middle
    } else if (array[middle] === target) {
      return middle
    } else {
      length = half
    }
  }
  return lowerbound
}
