'use strict'
const codeUtils = require('./codeUtils')

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
  const cache = this.getExecutingCodeFromCache(address)
  if (cache) {
    return callBack(address, cache)
  }

  this.loadCode(address, (code) => {
    callBack(address, this.cacheExecutingCode(address, code))
  })
}

CodeResolver.prototype.loadCode = function (address, callback) {
  this.web3.eth.getCode(address, (error, result) => {
    if (error) {
      console.log(error)
    } else {
      callback(result)
    }
  })
}

CodeResolver.prototype.cacheExecutingCode = function (address, hexCode) {
  const codes = this.formatCode(hexCode)
  this.bytecodeByAddress[address] = hexCode
  this.instructionsByAddress[address] = codes.code
  this.instructionsIndexByBytesOffset[address] = codes.instructionsIndexByBytesOffset
  return this.getExecutingCodeFromCache(address)
}

CodeResolver.prototype.formatCode = function (hexCode) {
  const code = codeUtils.nameOpCodes(Buffer.from(hexCode.substring(2), 'hex'))
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
  }
  return null
}

CodeResolver.prototype.getInstructionIndex = function (address, pc) {
  return this.getExecutingCodeFromCache(address).instructionsIndexByBytesOffset[pc]
}

module.exports = CodeResolver
