'use strict'
var VMDebugger = require('./ui/VmDebugger')
var Debugger = require('./ui/Ethdebugger')
var BasicPanel = require('./ui/BasicPanel')
var TraceManager = require('./trace/traceManager')
var CodeManager = require('./code/codeManager')

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
  module.exports = modules()
}
if (window) {
  window.remix = modules()
}

function modules () {
  return {
    code: {
      codeManager: CodeManager
    },
    trace: {
      traceManager: TraceManager
    },
    ui: {
      Debugger: Debugger,
      VMdebugger: VMDebugger,
      BasicPanel: BasicPanel
    }
  }
}

