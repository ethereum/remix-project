'use strict'
var VMDebugger = require('./ui/VmDebugger')
var Debugger = require('./ui/Ethdebugger')
var BasicPanel = require('./ui/BasicPanel')
var TreeView = require('./ui/TreeView')
var TraceManager = require('./trace/traceManager')
var CodeManager = require('./code/codeManager')
var disassembler = require('./code/disassembler')
var BreakpointManager = require('./code/breakpointManager')
var SourceMappingDecoder = require('./util/sourceMappingDecoder')
var AstWalker = require('./util/astWalker')
var decodeInfo = require('./solidity/decodeInfo')
var stateDecoder = require('./solidity/stateDecoder')
var astHelper = require('./solidity/astHelper')
var EventManager = require('./lib/eventManager')

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
  module.exports = modules()
}

if (typeof (window) !== 'undefined') {
  window.remix = modules()
}

function modules () {
  return {
    code: {
      codeManager: CodeManager,
      disassembler: disassembler,
      BreakpointManager: BreakpointManager
    },
    trace: {
      traceManager: TraceManager
    },
    ui: {
      Debugger: Debugger,
      VMdebugger: VMDebugger,
      BasicPanel: BasicPanel,
      TreeView: TreeView
    },
    util: {
      SourceMappingDecoder: SourceMappingDecoder,
      AstWalker: AstWalker
    },
    solidity: {
      decodeInfo: decodeInfo,
      astHelper: astHelper,
      stateDecoder: stateDecoder
    },
    lib: {
      EventManager: EventManager
    }
  }
}

