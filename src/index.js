'use strict'
var Debugger = require('./Ethdebugger')
if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
  module.exports = {
    Debugger: Debugger
  }
}
if (window) {
  window.remix = {
    Debugger: Debugger
  }
}

