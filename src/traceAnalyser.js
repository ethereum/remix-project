'use strict'
var traceManagerUtil = require('./traceManagerUtil')

function TraceAnalyser (_cache) {
  this.traceCache = _cache
  this.trace = null
}

TraceAnalyser.prototype.analyse = function (trace, tx, callback) {
  this.trace = trace
  this.traceCache.pushStoreChanges(0, tx.to)
  var context = {
    currentStorageAddress: tx.to,
    previousStorageAddress: tx.to
  }
  var callStack = [tx.to]
  this.traceCache.pushCallStack(0, {
    callStack: callStack.slice(0)
  })

  if (tx.to === '(Contract Creation Code)') {
    this.traceCache.pushContractCreation(tx.to, tx.input)
  }

  for (var k = 0; k < this.trace.length; k++) {
    var step = this.trace[k]
    this.buildCalldata(k, step)
    this.buildMemory(k, step)
    this.buildDepth(k, step, callStack)
    context = this.buildStorage(k, step, context)
  }
  callback(null, true)
}

TraceAnalyser.prototype.buildCalldata = function (index, step) {
  if (step.calldata) {
    this.traceCache.pushCallDataChanges(index)
  }
}

TraceAnalyser.prototype.buildMemory = function (index, step) {
  if (step.memory) {
    this.traceCache.pushMemoryChanges(index)
  }
}

TraceAnalyser.prototype.buildStorage = function (index, step, context) {
  if (traceManagerUtil.newContextStorage(step)) {
    var calledAddress = traceManagerUtil.resolveCalledAddress(index, this.trace)
    if (calledAddress) {
      context.currentStorageAddress = calledAddress
    } else {
      console.log('unable to build storage changes. ' + index + ' does not match with a CALL. storage changes will be corrupted')
    }
    this.traceCache.pushStoreChanges(index + 1, context.currentStorageAddress)
  } else if (step.op === 'SSTORE') {
    this.traceCache.pushStoreChanges(index + 1, context.currentStorageAddress, step.stack[step.stack.length - 1], step.stack[step.stack.length - 2])
  } else if (traceManagerUtil.isReturnInstruction(step)) {
    context.currentStorageAddress = context.previousStorageAddress
    this.traceCache.pushStoreChanges(index + 1, context.currentStorageAddress)
  }
  return context
}

TraceAnalyser.prototype.buildDepth = function (index, step, callStack) {
  if (traceManagerUtil.isCallInstruction(step) && !traceManagerUtil.isCallToPrecompiledContract(index, this.trace)) {
    if (traceManagerUtil.isCreateInstruction(step)) {
      var contractToken = '(Contract Creation Code) ' + index
      callStack.push(contractToken)
      var lastMemoryChange = this.traceCache.memoryChanges[this.traceCache.memoryChanges.length - 1]
      this.traceCache.pushContractCreationFromMemory(index, contractToken, this.trace, lastMemoryChange)
    } else {
      var newAddress = traceManagerUtil.resolveCalledAddress(index, this.trace)
      if (newAddress) {
        callStack.push(newAddress)
      } else {
        console.log('unable to build depth changes. ' + index + ' does not match with a CALL. depth changes will be corrupted')
      }
    }
    this.traceCache.pushCallChanges(step, index + 1)
    this.traceCache.pushCallStack(index + 1, {
      callStack: callStack.slice(0)
    })
  } else if (traceManagerUtil.isReturnInstruction(step)) {
    callStack.pop()
    this.traceCache.pushCallChanges(step, index + 1)
    this.traceCache.pushCallStack(index + 1, {
      callStack: callStack.slice(0)
    })
  }
}

module.exports = TraceAnalyser
