'use strict'
var VMDebugger = require('./src/ui/VmDebugger')
var Debugger = require('./src/ui/EthdebuggerUI')

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
  module.exports = modules()
}

if (typeof (window) !== 'undefined') {
  window.remix = modules()
}

function modules () {
  return {
    ui: {
      Debugger: Debugger,
      VMdebugger: VMDebugger
    }
  }
}
