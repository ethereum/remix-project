'use strict'

async function solidityLocals (vmtraceIndex, internalTreeCall, stack, memory, storageResolver, currentSourceLocation) {
  const scope = internalTreeCall.findScope(vmtraceIndex)
  if (!scope) {
    const error = { 'message': 'Can\'t display locals. reason: compilation result might not have been provided' }
    throw error
  }
  const locals = {}
  memory = formatMemory(memory)
  let anonymousIncr = 1
  for (let local in scope.locals) {
    const variable = scope.locals[local]
    if (variable.stackDepth < stack.length && variable.sourceLocation.start <= currentSourceLocation.start) {
      let name = variable.name
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
