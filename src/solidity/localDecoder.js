'use strict'

class LocalDecoder {
  solidityLocals (vmtraceIndex, internalTreeCall, stack, memory) {
    var scope = this.internalTreeCall.findScope(vmtraceIndex)
    var locals = {}
    for (var local of scope.locals) {
      if (local.type.decodeLocals) {
        locals[local.name] = local.type.decodeLocals(local.stackHeight, stack, memory)
      }
    }
    return locals
  }
}

module.exports = LocalDecoder
