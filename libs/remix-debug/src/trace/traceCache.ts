'use strict'
import { util } from '@remix-project/remix-lib'
// eslint-disable-next-line camelcase
const { sha3_256 } = util

export class TraceCache {
  returnValues
  stopIndexes
  outofgasIndexes
  currentCall
  callsTree
  callsData
  contractCreation
  steps
  addresses
  callDataChanges
  memoryChanges
  storageChanges
  sstore

  constructor () {
    this.init()
  }

  init () {
    // ...Changes contains index in the vmtrace of the corresponding changes

    this.returnValues = {}
    this.stopIndexes = []
    this.outofgasIndexes = []
    this.currentCall = null
    this.callsTree = null
    this.callsData = {}
    this.contractCreation = {}
    this.steps = {}
    this.addresses = []
    this.callDataChanges = []
    this.memoryChanges = []
    this.storageChanges = []
    this.sstore = {} // all sstore occurence in the trace
  }

  pushSteps (index, currentCallIndex) {
    this.steps[index] = currentCallIndex
  }

  pushCallDataChanges (value, calldata) {
    this.callDataChanges.push(value)
    this.callsData[value] = calldata
  }

  pushMemoryChanges (value) {
    this.memoryChanges.push(value)
  }

  // outOfGas has been removed because gas left logging is apparently made differently
  // in the vm/geth/eth. TODO add the error property (with about the error in all clients)
  pushCall (step, index, address, callStack, reverted) {
    const validReturnStep = step.op === 'RETURN' || step.op === 'STOP'
    if ((validReturnStep || reverted) && (this.currentCall)) {
      this.currentCall.call.return = index - 1
      if (!validReturnStep) {
        this.currentCall.call.reverted = reverted
      }
      const parent = this.currentCall.parent
      if (parent) this.currentCall = { call: parent.call, parent: parent.parent }
      return
    }
    const call = {
      op: step.op,
      address: address,
      callStack: callStack,
      calls: {},
      start: index
    }
    this.addresses.push(address)
    if (this.currentCall) {
      this.currentCall.call.calls[index] = call
    } else {
      this.callsTree = { call: call }
    }
    this.currentCall = { call: call, parent: this.currentCall }
  }

  pushOutOfGasIndex (index, address) {
    this.outofgasIndexes.push({ index, address })
  }

  pushStopIndex (index, address) {
    this.stopIndexes.push({ index, address })
  }

  pushReturnValue (step, value) {
    this.returnValues[step] = value
  }

  pushContractCreationFromMemory (index, token, trace, lastMemoryChange) {
    const memory = trace[lastMemoryChange].memory
    const stack = trace[index].stack
    const offset = 2 * parseInt(stack[stack.length - 2], 16)
    const size = 2 * parseInt(stack[stack.length - 3], 16)
    this.contractCreation[token] = '0x' + memory.join('').substr(offset, size)
  }

  pushContractCreation (token, code) {
    this.contractCreation[token] = code
  }

  resetStoreChanges (index, address, key, value) {
    this.sstore = {}
    this.storageChanges = []
  }

  pushStoreChanges (index, address, key, value) {
    this.sstore[index] = {
      address: address,
      key: key,
      value: value,
      hashedKey: key && sha3_256(key)
    }
    this.storageChanges.push(index)
  }

  accumulateStorageChanges (index, address, storage) {
    const ret = Object.assign({}, storage)
    for (const k in this.storageChanges) {
      const changesIndex = this.storageChanges[k]
      if (changesIndex > index) {
        return ret
      }
      const sstore = this.sstore[changesIndex]
      if (sstore.address === address && sstore.key) {
        ret[sstore.hashedKey] = {
          key: sstore.key,
          value: sstore.value
        }
      }
    }
    return ret
  }
}
