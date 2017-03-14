'use strict'
var ethutil = require('ethereumjs-util')

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
  },

  /*
    Binary Search:
    Assumes that @arg array is sorted increasingly
    return Return i such that |array[i] - target| is smallest among all i and -1 for an empty array.
    Returns the smallest i for multiple candidates.
  */
  findClosestIndex: function (target, array) {
    if (array.length === 0) {
      return -1
    }
    var index = this.findLowerBound(target, array)
    if (index < 0) {
      return array[0]
    } else if (index >= array.length - 1) {
      return array[array.length - 1]
    } else {
      var middle = (array[index] + array[index + 1]) / 2
      return target <= middle ? index : index + 1
    }
  },

  /**
  * Find the call from @args rootCall which contains @args index (recursive)
  *
  * @param {Int} index - index of the vmtrace
  * @param {Object} rootCall  - call tree, built by the trace analyser
  * @return {Object} - return the call which include the @args index
  */
  findCall: findCall,

  buildCallPath: buildCallPath,

  /**
  * sha3 the given @arg value
  *
  * @param {String} value - value to sha3
  * @return {Object} - return sha3ied value
  */
  sha3: function (value) {
    var ret = ethutil.bufferToHex(ethutil.setLengthLeft(value, 32))
    ret = ethutil.sha3(ret)
    return ethutil.bufferToHex(ret)
  }
}

/**
  * Find calls path from @args rootCall which leads to @args index (recursive)
  *
  * @param {Int} index - index of the vmtrace
  * @param {Object} rootCall  - call tree, built by the trace analyser
  * @return {Array} - return the calls path to @args index
  */
function buildCallPath (index, rootCall) {
  var ret = []
  findCallInternal(index, rootCall, ret)
  return ret
}

function findCall (index, rootCall) {
  var ret = buildCallPath(index, rootCall)
  return ret[ret.length - 1]
}

function findCallInternal (index, rootCall, callsPath) {
  var calls = Object.keys(rootCall.calls)
  var ret = rootCall
  callsPath.push(rootCall)
  for (var k in calls) {
    var subCall = rootCall.calls[calls[k]]
    if (index >= subCall.start && index <= subCall.return) {
      findCallInternal(index, subCall, callsPath)
      break
    }
  }
  return ret
}
