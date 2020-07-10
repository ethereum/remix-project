'use strict'
const EthDebugger = require('./src/Ethdebugger')
const TransactionDebugger = require('./src/debugger/debugger')
const CmdLine = require('./src/cmdline')

const StorageViewer = require('./src/storage/storageViewer')
const StorageResolver = require('./src/storage/storageResolver')

const SolidityDecoder = require('./src/solidity-decoder')

const remixLib = require('remix-lib')
const BreakpointManager = remixLib.code.BreakpointManager

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

