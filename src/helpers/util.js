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
    returns the smallest i such that target >= changes[i]
    returns arary.length - 1 (if all elements in array are smaller than target)
    returns 0 (if target is smaller than the first element of array || if array is empty)
  */
  findLowerBound: function (target, array) {
    if (array.length === 0) {
      return 0
    }
    return findLowerBoundInternal(target, array, 0, array.length - 1)
  }
}

function findLowerBoundInternal (target, array, lowerbound, higherbound) {
  if (array[higherbound] < target) {
    return higherbound
  } else if (array[lowerbound] > target) {
    return lowerbound
  }
  var middle
  while (lowerbound + 1 !== higherbound) {
    middle = Math.floor((higherbound + lowerbound) / 2)
    if (array[middle] > target) {
      higherbound = middle
    } else if (array[middle] < target) {
      lowerbound = middle
      higherbound = array.length - 1
    } else if (array[middle] === target) {
      return middle
    }
  }
  return lowerbound
}
