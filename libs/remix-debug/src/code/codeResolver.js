'use strict'
const codeUtils = require('./codeUtils')

function CodeResolver ({getCode}) {
  this.getCode = getCode

  this.bytecodeByAddress = {} // bytes code by contract addesses
  this.instructionsByAddress = {} // assembly items instructions list by contract addesses
  this.instructionsIndexByBytesOffset = {} // mapping between bytes offset and instructions index.
}

CodeResolver.prototype.clear = function () {
  this.bytecodeByAddress = {}
  this.instructionsByAddress = {}
  this.instructionsIndexByBytesOffset = {}
}

CodeResolver.prototype.resolveCode = async function (address) {
  const cache = this.getExecutingCodeFromCache(address)
  if (cache) {
    return cache
  }

  const code = await this.getCode(address)
  return this.cacheExecutingCode(address, code)
}

CodeResolver.prototype.cacheExecutingCode = function (address, hexCode) {
  const codes = this.formatCode(hexCode)
  this.bytecodeByAddress[address] = hexCode
  this.instructionsByAddress[address] = codes.code
  this.instructionsIndexByBytesOffset[address] = codes.instructionsIndexByBytesOffset
  return this.getExecutingCodeFromCache(address)
}

CodeResolver.prototype.formatCode = function (hexCode) {
  const [code, instructionsIndexByBytesOffset] = codeUtils.nameOpCodes(Buffer.from(hexCode.substring(2), 'hex'))
  return {code, instructionsIndexByBytesOffset}
}

CodeResolver.prototype.getExecutingCodeFromCache = function (address) {
  if (!this.instructionsByAddress[address]) {
    return null
  }
  return {
    instructions: this.instructionsByAddress[address],
    instructionsIndexByBytesOffset: this.instructionsIndexByBytesOffset[address],
    bytecode: this.bytecodeByAddress[address]
  }
}

CodeResolver.prototype.getInstructionIndex = function (address, pc) {
  return this.getExecutingCodeFromCache(address).instructionsIndexByBytesOffset[pc]
}

module.exports = CodeResolver
