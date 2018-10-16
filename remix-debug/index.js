'use strict'
var EthDebugger = require('./src/Ethdebugger')
var TransactionDebugger = require('./src/debugger/debugger')
var CmdLine = require('./src/cmdline')

var StorageViewer = require('./src/storage/storageViewer')
var StorageResolver = require('./src/storage/storageResolver')

var SolidityDecoder = require('./src/solidity-decoder')

var remixLib = require('remix-lib')
var BreakpointManager = remixLib.code.BreakpointManager

/*
  Use of breakPointManager :

  var breakPointManager = new BreakpointManager(this.debugger, (sourceLocation) => {
    return line/column from offset (sourceLocation)
  })
  this.debugger.setBreakpointManager(breakPointManager)
*/
module.exports = {
  EthDebugger: EthDebugger,
  TransactionDebugger: TransactionDebugger,
  /**
   * constructor
   *
   * @param {Object} _debugger - type of EthDebugger
   * @return {Function} _locationToRowConverter - function implemented by editor which return a column/line position for a char source location
   */
  BreakpointManager: BreakpointManager,
  SolidityDecoder: SolidityDecoder,
  storage: {
    StorageViewer: StorageViewer,
    StorageResolver: StorageResolver
  },
  CmdLine: CmdLine
}

