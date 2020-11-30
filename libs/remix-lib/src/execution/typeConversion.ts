'use strict'
const ethJSUtil = require('ethereumjs-util')
const BN = ethJSUtil.BN

module.exports = {
  toInt: (h) => {
    if (h.indexOf && h.indexOf('0x') === 0) {
      return (new BN(h.replace('0x', ''), 16)).toString(10)
    } else if (h.constructor && h.constructor.name === 'BigNumber' || BN.isBN(h)) {
      return h.toString(10)
    }
    return h
  },
  stringify: stringify
}

function stringify (v) {
  try {
    if (v instanceof Array) {
      const ret = []
      for (var k in v) {
        ret.push(stringify(v[k]))
      }
      return ret
    } else if (BN.isBN(v) || (v.constructor && v.constructor.name === 'BigNumber')) {
      return v.toString(10)
    } else if (v._isBuffer) {
      return ethJSUtil.bufferToHex(v)
    } else if (typeof v === 'object') {
      const retObject = {}
      for (let i in v) {
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
