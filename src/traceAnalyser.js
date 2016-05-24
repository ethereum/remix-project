'use strict'
var traceManagerUtil = require('./traceManagerUtil')

function TraceAnalyser (_cache) {
  this.traceCache = _cache
  this.trace = null
}

TraceAnalyser.prototype.analyse = function (trace, root, callback) {
  this.trace = trace

  this.traceCache.pushStoreChanges(0, root)
  var context = {
    currentStorageAddress: root,
    previousStorageAddress: root
  }
  var callStack = [root]
  this.traceCache.pushCallStack(0, {
    callStack: callStack.slice(0)
  })

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
  } else if (!step.op === 'RETURN') {
    context.currentStorageAddress = context.previousStorageAddress
    this.traceCache.pushStoreChanges(index + 1, context.currentStorageAddress)
  }
  return context
}

TraceAnalyser.prototype.buildDepth = function (index, step, callStack) {
  if (traceManagerUtil.isCallInstruction(step) && !traceManagerUtil.isCallToPrecompiledContract(index, this.trace)) {
    var newAddress = traceManagerUtil.resolveCalledAddress(index, this.trace)
    if (newAddress) {
      callStack.push(newAddress)
    } else {
      console.log('unable to build depth changes. ' + index + ' does not match with a CALL. depth changes will be corrupted')
    }
    this.traceCache.pushCallChanges(step, index + 1)
    this.traceCache.pushCallStack(index + 1, {
      callStack: callStack.slice(0)
    })
  } else if (traceManagerUtil.isReturnInstruction(step)) {
    this.traceCache.pushCallChanges(step, index)
    this.traceCache.pushCallStack(index, {
      callStack: callStack.slice(0)
    })
    callStack.pop()
  }
}

// 0x90a99e9dbfc38ce0fd6330f97a192a9ef27b8329b57309e8b2abe47a6fe74574
// 0xc0e95f27e1482ba09dea8162c4b4090e3d89e214416df2ce9d5517ff2107de19

module.exports = TraceAnalyser
