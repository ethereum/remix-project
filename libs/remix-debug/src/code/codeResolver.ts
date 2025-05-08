'use strict'
import { nameOpCodes } from './codeUtils'
import { eip7702Constants } from '@remix-project/remix-lib'

export class CodeResolver {
  getCode
  bytecodeByAddress
  instructionsByAddress
  instructionsIndexByBytesOffset
  fork

  constructor ({ getCode, fork }) {
    this.getCode = getCode
    this.bytecodeByAddress = {} // bytes code by contract addresses
    this.instructionsByAddress = {} // assembly items instructions list by contract addresses
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
    let code = await this.getCode(address)
    if (code && code.startsWith(eip7702Constants.EIP7702_CODE_INDICATOR_FLAG)) {
      code = await this.getCode('0x' + code.replace(eip7702Constants.EIP7702_CODE_INDICATOR_FLAG, ''))
    }
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
