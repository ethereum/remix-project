'use strict'

function solidityLocals (vmtraceIndex, internalTreeCall, stack, memory) {
  var scope = internalTreeCall.findScope(vmtraceIndex)
  var locals = {}
  for (var local in scope.locals) {
    let variable = scope.locals[local]
    if (variable.type.decodeLocals) {
      locals[variable.name] = variable.type.decodeLocals(variable.stackHeight, stack, memory)
    } else {
      locals[variable.name] = ''
    }
  }
  return locals
}

module.exports = {
  solidityLocals: solidityLocals
}
