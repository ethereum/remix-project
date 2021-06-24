'use strict'
import { nameOpCodes } from './codeUtils'

export class CodeResolver {
  getCode
  bytecodeByAddress
  instructionsByAddress
  instructionsIndexByBytesOffset
  fork

  constructor ({ getCode, fork }) {
    this.getCode = getCode
    this.bytecodeByAddress = {} // bytes code by contract addesses
    this.instructionsByAddress = {} // assembly items instructions list by contract addesses
    this.instructionsIndexByBytesOffset = {} // mapping between bytes offset and instructions index.
    this.fork = fork
  }

  clear () {
    this.bytecodeByAddress = {}
    this.instructionsByAddress = {}
    this.instructionsIndexByBytesOffset = {}
  }

  async resolveCode (address) {
    const cache = this.getExecutingCodeFromCache(address)
    if (cache) {
      return cache
    }

    const code = await this.getCode(address)
    return this.cacheExecutingCode(address, code)
  }

  cacheExecutingCode (address, hexCode) {
    const codes = this.formatCode(hexCode)
    this.bytecodeByAddress[address] = hexCode
    this.instructionsByAddress[address] = codes.code
    this.instructionsIndexByBytesOffset[address] = codes.instructionsIndexByBytesOffset
    return this.getExecutingCodeFromCache(address)
  }

  formatCode (hexCode) {
    const [code, instructionsIndexByBytesOffset] = nameOpCodes(Buffer.from(hexCode.substring(2), 'hex'), this.fork)
    return { code, instructionsIndexByBytesOffset }
  }

  getExecutingCodeFromCache (address) {
    if (!this.instructionsByAddress[address]) {
      return null
    }
    return {
      instructions: this.instructionsByAddress[address],
      instructionsIndexByBytesOffset: this.instructionsIndexByBytesOffset[address],
      bytecode: this.bytecodeByAddress[address]
    }
  }

  getInstructionIndex (address, pc) {
    return this.getExecutingCodeFromCache(address).instructionsIndexByBytesOffset[pc]
  }
}
