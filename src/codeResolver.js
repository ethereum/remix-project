'use strict'
var codeUtils = require('./codeUtils')

module.exports = {
  web3: null,

  codes: {}, // assembly items instructions list by contract addesses
  instructionsIndexByBytesOffset: {}, // mapping between bytes offset and instructions index.

  setWeb3: function (web3) {
    this.web3 = web3
  },

  resolveCode: function (address, vmTraceIndex, transaction, callBack) {
    var cache = this.getExecutingCodeFromCache(address)
    if (cache) {
      callBack(address, cache.code)
      return
    }

    if (vmTraceIndex === 0 && transaction.to === null) { // start of the trace
      callBack(address, this.cacheExecutingCode(address, transaction.input).code)
      return
    }

    var self = this
    this.loadCode(address, function (code) {
      callBack(address, self.cacheExecutingCode(address, code).code)
    })
  },

  loadCode: function (address, callback) {
    console.log('loading new code from web3 ' + address)
    this.web3.eth.getCode(address, function (error, result) {
      if (error) {
        console.log(error)
      } else {
        callback(result)
      }
    })
  },

  cacheExecutingCode: function (address, hexCode) {
    var code = codeUtils.nameOpCodes(new Buffer(hexCode.substring(2), 'hex'))
    this.codes[address] = code[0]
    this.instructionsIndexByBytesOffset[address] = code[1]
    return {
      code: code[0],
      instructionsIndexByBytesOffset: code[1]
    }
  },

  getExecutingCodeFromCache: function (address) {
    if (this.codes[address]) {
      return {
        code: this.codes[address],
        instructionsIndexByBytesOffset: this.instructionsIndexByBytesOffset[address]
      }
    } else {
      return null
    }
  },

  getInstructionIndex: function (address, pc) {
    return this.getExecutingCodeFromCache(address).instructionsIndexByBytesOffset[pc]
  }
}
