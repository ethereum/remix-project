'use strict'
// TODO: this file doesn't seem to be used any more and can be removed
var VMDebugger = require('./src/ui/VmDebugger')
var Debugger = require('./src/ui/EthdebuggerUI')
var DebuggerBackend = require('remix-debug').EthDebugger

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
      VMdebugger: VMDebugger,
      DebuggerBackend
    }
  }
}
