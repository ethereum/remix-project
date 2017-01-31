'use strict'

function solidityLocals (vmtraceIndex, internalTreeCall, stack, memory, storage) {
  var scope = internalTreeCall.findScope(vmtraceIndex)
  if (!scope) {
    var error = { 'message': 'Can\'t display locals. reason: compilation result might not have been provided' }
    throw error
  }
  var locals = {}
  memory = formatMemory(memory)
  for (var local in scope.locals) {
    let variable = scope.locals[local]
    if (variable.stackDepth < stack.length) {
      locals[variable.name] = variable.type.decodeFromStack(variable.stackDepth, stack, memory, storage)
    }
  }
  return locals
}

function formatMemory (memory) {
  if (memory instanceof Array) {
    memory = memory.join('').replace(/0x/g, '')
  }
  return memory
}

module.exports = {
  solidityLocals: solidityLocals
}
