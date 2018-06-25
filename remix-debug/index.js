'use strict'
var remixCore = require('remix-core')
var EthDebugger = require('./src/Ethdebugger')

var CodeManager = require('./src/code/codeManager')
var BreakpointManager = require('./src/code/breakpointManager')
var StorageViewer = require('./src/storage/storageViewer')
var StorageResolver = require('./src/storage/storageResolver')
var TraceManager = require('./src/trace/traceManager')

/*
  Use of breakPointManager :

  var breakPointManager = new BreakpointManager(this.debugger, (sourceLocation) => {
    return line/column from offset (sourceLocation)
  })
  this.debugger.setBreakpointManager(breakPointManager)
*/
module.exports = {
  EthDebugger: EthDebugger,
  /**
   * constructor
   *
   * @param {Object} _debugger - type of EthDebugger
   * @return {Function} _locationToRowConverter - function implemented by editor which return a column/line position for a char source location
   */
  BreakpointManager: remixCore.code.BreakpointManager,
  code: {
    CodeManager: CodeManager,
    BreakpointManager: BreakpointManager
  },
  storage: {
    StorageViewer: StorageViewer,
    StorageResolver: StorageResolver
  },
  trace: {
    TraceManager: TraceManager
  }
}

