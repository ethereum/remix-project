'use strict'
const traceHelper = require('../helpers/traceHelper')

function TraceAnalyser (_cache) {
  this.traceCache = _cache
  this.trace = null
}

TraceAnalyser.prototype.analyse = function (trace, tx, callback) {
  this.trace = trace
  this.traceCache.pushStoreChanges(0, tx.to)
  let context = {
    storageContext: [tx.to],
    currentCallIndex: 0,
    lastCallIndex: 0
  }
  const callStack = [tx.to]
  this.traceCache.pushCall(trace[0], 0, callStack[0], callStack.slice(0))
  if (traceHelper.isContractCreation(tx.to)) {
    this.traceCache.pushContractCreation(tx.to, tx.input)
  }
  this.buildCalldata(0, this.trace[0], tx, true)
  for (let k = 0; k < this.trace.length; k++) {
    const step = this.trace[k]
    this.buildMemory(k, step)
    context = this.buildDepth(k, step, tx, callStack, context)
    context = this.buildStorage(k, step, context)
    this.buildReturnValues(k, step)
  }
  callback(null, true)
}

TraceAnalyser.prototype.buildReturnValues = function (index, step) {
  if (traceHelper.isReturnInstruction(step)) {
    const offset = 2 * parseInt(step.stack[step.stack.length - 1], 16)
    const size = 2 * parseInt(step.stack[step.stack.length - 2], 16)
    const memory = this.trace[this.traceCache.memoryChanges[this.traceCache.memoryChanges.length - 1]].memory
    this.traceCache.pushReturnValue(index, '0x' + memory.join('').substr(offset, size))
  }
}

TraceAnalyser.prototype.buildCalldata = function (index, step, tx, newContext) {
  let calldata = ''
  if (index === 0) {
    calldata = tx.input
    this.traceCache.pushCallDataChanges(index, calldata)
  } else if (!newContext) {
    const lastCall = this.traceCache.callsData[this.traceCache.callDataChanges[this.traceCache.callDataChanges.length - 2]]
    this.traceCache.pushCallDataChanges(index + 1, lastCall)
  } else {
    const memory = this.trace[this.traceCache.memoryChanges[this.traceCache.memoryChanges.length - 1]].memory
    const callStep = this.trace[index]
    const stack = callStep.stack
    let offset = ''
    let size = ''
    if (callStep.op === 'DELEGATECALL') {
      offset = 2 * parseInt(stack[stack.length - 3], 16)
      size = 2 * parseInt(stack[stack.length - 4], 16)
    } else {
      offset = 2 * parseInt(stack[stack.length - 4], 16)
      size = 2 * parseInt(stack[stack.length - 5], 16)
    }
    calldata = '0x' + memory.join('').substr(offset, size)
    this.traceCache.pushCallDataChanges(index + 1, calldata)
  }
}

TraceAnalyser.prototype.buildMemory = function (index, step) {
  if (step.memory) {
    this.traceCache.pushMemoryChanges(index)
  }
}

TraceAnalyser.prototype.buildStorage = function (index, step, context) {
  if (traceHelper.newContextStorage(step) && !traceHelper.isCallToPrecompiledContract(index, this.trace)) {
    const calledAddress = traceHelper.resolveCalledAddress(index, this.trace)
    if (calledAddress) {
      context.storageContext.push(calledAddress)
    } else {
      console.log('unable to build storage changes. ' + index + ' does not match with a CALL. storage changes will be corrupted')
    }
    this.traceCache.pushStoreChanges(index + 1, context.storageContext[context.storageContext.length - 1])
  } else if (traceHelper.isSSTOREInstruction(step)) {
    this.traceCache.pushStoreChanges(index + 1, context.storageContext[context.storageContext.length - 1], step.stack[step.stack.length - 1], step.stack[step.stack.length - 2])
  } else if (traceHelper.isReturnInstruction(step) || traceHelper.isStopInstruction(step)) {
    context.storageContext.pop()
    this.traceCache.pushStoreChanges(index + 1, context.storageContext[context.storageContext.length - 1])
  } else if (traceHelper.isRevertInstruction(step)) {
    context.storageContext.pop()
    this.traceCache.resetStoreChanges()
  }
  return context
}

TraceAnalyser.prototype.buildDepth = function (index, step, tx, callStack, context) {
  if (traceHelper.isCallInstruction(step) && !traceHelper.isCallToPrecompiledContract(index, this.trace)) {
    let newAddress
    if (traceHelper.isCreateInstruction(step)) {
      newAddress = traceHelper.contractCreationToken(index)
      callStack.push(newAddress)
      const lastMemoryChange = this.traceCache.memoryChanges[this.traceCache.memoryChanges.length - 1]
      this.traceCache.pushContractCreationFromMemory(index, newAddress, this.trace, lastMemoryChange)
    } else {
      newAddress = traceHelper.resolveCalledAddress(index, this.trace)
      if (newAddress) {
        callStack.push(newAddress)
      } else {
        console.log('unable to build depth changes. ' + index + ' does not match with a CALL. depth changes will be corrupted')
      }
    }
    this.traceCache.pushCall(step, index + 1, newAddress, callStack.slice(0))
    this.buildCalldata(index, step, tx, true)
    this.traceCache.pushSteps(index, context.currentCallIndex)
    context.lastCallIndex = context.currentCallIndex
    context.currentCallIndex = 0
  } else if (traceHelper.isReturnInstruction(step) || traceHelper.isStopInstruction(step) || step.error || step.invalidDepthChange) {
    if (index < this.trace.length) {
      callStack.pop()
      this.traceCache.pushCall(step, index + 1, null, callStack.slice(0), step.error || step.invalidDepthChange)
      this.buildCalldata(index, step, tx, false)
      this.traceCache.pushSteps(index, context.currentCallIndex)
      context.currentCallIndex = context.lastCallIndex + 1
    }
  } else {
    this.traceCache.pushSteps(index, context.currentCallIndex)
    context.currentCallIndex++
  }
  return context
}

module.exports = TraceAnalyser
