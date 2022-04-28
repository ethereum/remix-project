'use strict'

import { isCallInstruction, isCallToPrecompiledContract, isReturnInstruction } from './traceHelper'
import { util } from '@remix-project/remix-lib'

export class TraceStepManager {
  traceAnalyser

  constructor (_traceAnalyser) {
    this.traceAnalyser = _traceAnalyser
  }

  isCallInstruction (index) {
    const state = this.traceAnalyser.trace[index]
    return isCallInstruction(state) && !isCallToPrecompiledContract(index, this.traceAnalyser.trace)
  }

  isReturnInstruction (index) {
    const state = this.traceAnalyser.trace[index]
    return isReturnInstruction(state)
  }

  findStepOverBack (currentStep) {
    if (this.isReturnInstruction(currentStep)) {
      const call = util.findCall(currentStep, this.traceAnalyser.traceCache.callsTree.call)
      return call.start > 0 ? call.start - 1 : 0
    }
    return currentStep > 0 ? currentStep - 1 : 0
  }

  findStepOverForward (currentStep) {
    if (this.isCallInstruction(currentStep)) {
      const call = util.findCall(currentStep + 1, this.traceAnalyser.traceCache.callsTree.call)
      return call.return + 1 < this.traceAnalyser.trace.length ? call.return + 1 : this.traceAnalyser.trace.length - 1
    }
    return this.traceAnalyser.trace.length >= currentStep + 1 ? currentStep + 1 : currentStep
  }

  findNextCall (currentStep) {
    const call = util.findCall(currentStep, this.traceAnalyser.traceCache.callsTree.call)
    const subCalls = Object.keys(call.calls)
    if (subCalls.length) {
      const callStart = util.findLowerBound(currentStep, subCalls) + 1
      if (subCalls.length > callStart) {
        return parseInt(subCalls[callStart]) - 1
      }
      return currentStep
    }
    return currentStep
  }

  findStepOut (currentStep) {
    const call = util.findCall(currentStep, this.traceAnalyser.traceCache.callsTree.call)
    return call.return
  }
}
