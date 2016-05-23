'use strict'
function TraceAnalyser (_cache) {
  this.traceCache = _cache
  this.trace = null
}

TraceAnalyser.prototype.analyse = function (trace, callback) {
  this.trace = trace
  var currentDepth = 0
  var context = {
    currentStorageAddress: trace[0].address,
    previousStorageAddress: trace[0].address
  }
  var callStack = []
  for (var k in this.trace) {
    var step = this.trace[k]
    this.buildCalldata(k, step)
    this.buildMemory(k, step)
    var depth = this.buildDepth(k, step, currentDepth, callStack)
    if (depth) {
      currentDepth = depth
    }
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
  if (step.address) {
    // new context
    context.currentStorageAddress = step.address
    this.traceCache.pushStoreChanges(index, context.currentStorageAddress)
  } else if (step.inst === 'SSTORE') {
    this.traceCache.pushStoreChanges(index, context.currentStorageAddress, step.stack[step.stack.length - 1], step.stack[step.stack.length - 2])
  } else if (!step.address && step.depth) {
    // returned from context
    context.currentStorageAddress = context.previousStorageAddress
    this.traceCache.pushStoreChanges(index, context.currentStorageAddress)
  }
  return context
}

TraceAnalyser.prototype.buildDepth = function (index, step, currentDepth, callStack) {
  if (step.depth === undefined) return
  if (step.depth > currentDepth) {
    if (index === 0) {
      callStack.push('0x' + step.address) // new context
    } else {
      // getting the address from the stack
      var callTrace = this.trace[index - 1]
      var address = callTrace.stack[callTrace.stack.length - 2]
      callStack.push(address) // new context
    }
  } else if (step.depth < currentDepth) {
    callStack.pop() // returning from context
  }
  this.traceCache.pushCallStack(index, {
    stack: callStack.slice(0),
    depth: step.depth
  })
  this.traceCache.pushDepthChanges(index)
  return step.depth
}

module.exports = TraceAnalyser
