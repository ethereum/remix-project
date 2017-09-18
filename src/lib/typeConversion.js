'use strict'
var ethJSUtil = require('ethereumjs-util')
var BN = ethJSUtil.BN

module.exports = {
  hexToInt: (h) => {
    return (new BN(h.replace('0x', ''), 16)).toString(10)
  },
  stringify: stringify
}

function stringify (v) {
  try {
    if (v instanceof Array) {
      var ret = []
      for (var k in v) {
        ret.push(stringify(v[k]))
      }
      return ret
    } else if (BN.isBN(v) || (v.constructor && v.constructor.name === 'BigNumber')) {
      return v.toString(10)
    } else if (v._isBuffer) {
      return ethJSUtil.bufferToHex(v)
    } else if (typeof v === 'object') {
      var retObject = {}
      for (var i in v) {
        retObject[i] = stringify(v[i])
      }
      return retObject
    } else {
      return v
    }
  } catch (e) {
    console.log(e)
    return v
  }
}
