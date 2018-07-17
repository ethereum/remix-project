'use strict'

async function solidityLocals (vmtraceIndex, internalTreeCall, stack, memory, storageResolver, currentSourceLocation) {
  var scope = internalTreeCall.findScope(vmtraceIndex)
  if (!scope) {
    var error = { 'message': 'Can\'t display locals. reason: compilation result might not have been provided' }
    throw error
  }
  var locals = {}
  memory = formatMemory(memory)
  var anonymousIncr = 1
  for (var local in scope.locals) {
    var variable = scope.locals[local]
    if (variable.stackDepth < stack.length && variable.sourceLocation.start <= currentSourceLocation.start) {
      var name = variable.name
      if (name === '') {
        name = '<' + anonymousIncr + '>'
        anonymousIncr++
      }
      try {
        locals[name] = await variable.type.decodeFromStack(variable.stackDepth, stack, memory, storageResolver)
      } catch (e) {
        console.log(e)
        locals[name] = '<decoding failed - ' + e.message + '>'
      }
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
