'use strict'
var codeUtils = require('./codeUtils')

function CodeResolver (options) {
  this.web3 = options.web3

  this.bytecodeByAddress = {} // bytes code by contract addesses
  this.instructionsByAddress = {} // assembly items instructions list by contract addesses
  this.instructionsIndexByBytesOffset = {} // mapping between bytes offset and instructions index.
}

CodeResolver.prototype.clear = function () {
  this.bytecodeByAddress = {}
  this.instructionsByAddress = {}
  this.instructionsIndexByBytesOffset = {}
}

CodeResolver.prototype.resolveCode = function (address, callBack) {
  var cache = this.getExecutingCodeFromCache(address)
  if (cache) {
    callBack(address, cache)
    return
  }

  var self = this
  this.loadCode(address, function (code) {
    callBack(address, self.cacheExecutingCode(address, code))
  })
}

CodeResolver.prototype.loadCode = function (address, callback) {
  console.log('loading new code from web3 ' + address)
  this.web3.eth.getCode(address, function (error, result) {
    if (error) {
      console.log(error)
    } else {
      callback(result)
    }
  })
}

CodeResolver.prototype.cacheExecutingCode = function (address, hexCode) {
  var codes = this.formatCode(hexCode)
  this.bytecodeByAddress[address] = hexCode
  this.instructionsByAddress[address] = codes.code
  this.instructionsIndexByBytesOffset[address] = codes.instructionsIndexByBytesOffset
  return this.getExecutingCodeFromCache(address)
}

CodeResolver.prototype.formatCode = function (hexCode) {
  var code = codeUtils.nameOpCodes(new Buffer(hexCode.substring(2), 'hex'))
  return {
    code: code[0],
    instructionsIndexByBytesOffset: code[1]
  }
}

CodeResolver.prototype.getExecutingCodeFromCache = function (address) {
  if (this.instructionsByAddress[address]) {
    return {
      instructions: this.instructionsByAddress[address],
      instructionsIndexByBytesOffset: this.instructionsIndexByBytesOffset[address],
      bytecode: this.bytecodeByAddress[address]
    }
  } else {
    return null
  }
}

CodeResolver.prototype.getInstructionIndex = function (address, pc) {
  return this.getExecutingCodeFromCache(address).instructionsIndexByBytesOffset[pc]
}

module.exports = CodeResolver
