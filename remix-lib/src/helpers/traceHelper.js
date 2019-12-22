'use strict'
const ui = require('./uiHelper')

module.exports = {
  // vmTraceIndex has to point to a CALL, CODECALL, ...
  resolveCalledAddress: function (vmTraceIndex, trace) {
    const step = trace[vmTraceIndex]
    if (this.isCreateInstruction(step)) {
      return this.contractCreationToken(vmTraceIndex)
    } else if (this.isCallInstruction(step)) {
      const stack = step.stack // callcode, delegatecall, ...
      return ui.normalizeHexAddress(stack[stack.length - 2])
    }
    return undefined
  },

  isCallInstruction: function (step) {
    return step.op === 'CALL' || step.op === 'CALLCODE' || step.op === 'CREATE' || step.op === 'DELEGATECALL'
  },

  isCreateInstruction: function (step) {
    return step.op === 'CREATE'
  },

  isReturnInstruction: function (step) {
    return step.op === 'RETURN'
  },

  isJumpDestInstruction: function (step) {
    return step.op === 'JUMPDEST'
  },

  isStopInstruction: function (step) {
    return step.op === 'STOP'
  },

  isRevertInstruction: function (step) {
    return step.op === 'REVERT'
  },

  isSSTOREInstruction: function (step) {
    return step.op === 'SSTORE'
  },

  isSHA3Instruction: function (step) {
    return step.op === 'SHA3'
  },

  newContextStorage: function (step) {
    return step.op === 'CREATE' || step.op === 'CALL'
  },

  isCallToPrecompiledContract: function (index, trace) {
    // if stack empty => this is not a precompiled contract
    const step = trace[index]
    if (this.isCallInstruction(step)) {
      return index + 1 < trace.length && trace[index + 1].stack.length !== 0
    } else {
      return false
    }
  },

  contractCreationToken: function (index) {
    return '(Contract Creation - Step ' + index + ')'
  },

  isContractCreation: function (address) {
    return address.indexOf('(Contract Creation - Step') !== -1
  }
}
