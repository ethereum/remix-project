'use strict'
import Common from '@ethereumjs/common'
import { getOpcodesForHF } from '@ethereumjs/vm/dist/evm/opcodes'
import getOpcodes from './opcodes'

export function nameOpCodes (raw, hardfork) {
  const common = new Common({ chain: 'mainnet', hardfork })
  const opcodes = getOpcodesForHF(common)

  let pushData = ''
  const codeMap = {}
  const code = []

  for (let i = 0; i < raw.length; i++) {
    const pc = i
    let curOpCode
    try {
      curOpCode = opcodes.get(raw[pc]).fullName
    } catch (e) {
      curOpCode = 'INVALID'
    }
    codeMap[i] = code.length
    // no destinations into the middle of PUSH
    if (curOpCode.slice(0, 4) === 'PUSH') {
      const jumpNum = raw[pc] - 0x5f
      pushData = raw.slice(pc + 1, pc + jumpNum + 1)
      i += jumpNum
    }

    const data = (pushData as any).toString('hex') !== '' ? ' ' + (pushData as any).toString('hex') : ''

    code.push(pad(pc, roundLog(raw.length, 10)) + ' ' + curOpCode + data)
    pushData = ''
  }
  return [code, codeMap]
}

type Opcode = {
  name: string,
  pushData?: Array<number>
  in?: number
  out?: number
}
/**
 * Parses code as a list of integers into a list of objects containing
 * information about the opcode.
 */
export function parseCode (raw) {
  const common = new Common({ chain: 'mainnet', hardfork: 'london' })
  const opcodes = getOpcodesForHF(common)

  const code = []
  for (let i = 0; i < raw.length; i++) {
    const opcode: Opcode = { name: 'INVALID' }
    try {
      const code = opcodes.get(raw[i])
      const opcodeDetails = getOpcodes(raw[i], false)
      opcode.in = opcodeDetails.in
      opcode.out = opcodeDetails.out
      opcode.name = code.fullName
    } catch (e) {
      opcode.name = 'INVALID'
    }
    if (opcode.name.slice(0, 4) === 'PUSH') {
      const length = raw[i] - 0x5f
      opcode.pushData = raw.slice(i + 1, i + length + 1)
      // in case pushdata extends beyond code
      if (i + 1 + length > raw.length) {
        for (let j = opcode['pushData'].length; j < length; j++) {
          opcode['pushData'].push(0)
        }
      }
      i += length
    }
    code.push(opcode)
  }
  return code
}

export function pad (num, size) {
  let s = num + ''
  while (s.length < size) s = '0' + s
  return s
}

export function log (num, base) {
  return Math.log(num) / Math.log(base)
}

export function roundLog (num, base) {
  return Math.ceil(log(num, base))
}
