'use strict'
var traceHelper = require('../helpers/traceHelper')

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

  if (traceHelper.isContractCreation(tx.to)) {
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
  if (traceHelper.newContextStorage(step)) {
    var calledAddress = traceHelper.resolveCalledAddress(index, this.trace)
    if (calledAddress) {
      context.currentStorageAddress = calledAddress
    } else {
      console.log('unable to build storage changes. ' + index + ' does not match with a CALL. storage changes will be corrupted')
    }
    this.traceCache.pushStoreChanges(index + 1, context.currentStorageAddress)
  } else if (traceHelper.isSSTOREInstruction(step)) {
    this.traceCache.pushStoreChanges(index + 1, context.currentStorageAddress, step.stack[step.stack.length - 1], step.stack[step.stack.length - 2])
  } else if (traceHelper.isReturnInstruction(step)) {
    context.currentStorageAddress = context.previousStorageAddress
    this.traceCache.pushStoreChanges(index + 1, context.currentStorageAddress)
  }
  return context
}

TraceAnalyser.prototype.buildDepth = function (index, step, callStack) {
  if (traceHelper.isCallInstruction(step) && !traceHelper.isCallToPrecompiledContract(index, this.trace)) {
    if (traceHelper.isCreateInstruction(step)) {
      var contractToken = traceHelper.contractCreationToken(index)
      callStack.push(contractToken)
      var lastMemoryChange = this.traceCache.memoryChanges[this.traceCache.memoryChanges.length - 1]
      this.traceCache.pushContractCreationFromMemory(index, contractToken, this.trace, lastMemoryChange)
    } else {
      var newAddress = traceHelper.resolveCalledAddress(index, this.trace)
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
  } else if (traceHelper.isReturnInstruction(step)) {
    callStack.pop()
    this.traceCache.pushCallChanges(step, index + 1)
    this.traceCache.pushCallStack(index + 1, {
      callStack: callStack.slice(0)
    })
  }
}

module.exports = TraceAnalyser
