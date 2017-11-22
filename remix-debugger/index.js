'use strict'
var VMDebugger = require('./src/ui/VmDebugger')
var Debugger = require('./src/ui/Ethdebugger')
var BasicPanel = require('./src/ui/BasicPanel')
var TreeView = require('./src/ui/TreeView')
var styleGuide = require('./src/ui/styles/style-guide')

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
      BasicPanel: BasicPanel,
      TreeView: TreeView,
      styleGuide: styleGuide
    }
  }
}
