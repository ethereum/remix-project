'use strict'
const init = require('./src/init')
const EthDebugger = require('./src/Ethdebugger')
const TransactionDebugger = require('./src/debugger/debugger')
const CmdLine = require('./src/cmdline')

const StorageViewer = require('./src/storage/storageViewer')
const StorageResolver = require('./src/storage/storageResolver')

const SolidityDecoder = require('./src/solidity-decoder')

const BreakpointManager = require('./src/code/breakpointManager')

const SourceMappingDecoder = require('./src/source/sourceMappingDecoder')

const traceHelper = require('./src/trace/traceHelper')

/*
  Use of breakPointManager :

  var breakPointManager = new BreakpointManager(this.debugger, (sourceLocation) => {
    return line/column from offset (sourceLocation)
  })
  this.debugger.setBreakpointManager(breakPointManager)
*/
export = {
  init,
  traceHelper,
  SourceMappingDecoder,
  EthDebugger,
  TransactionDebugger,
  /**
   * constructor
   *
   * @param {Object} _debugger - type of EthDebugger
   * @return {Function} _locationToRowConverter - function implemented by editor which return a column/line position for a char source location
   */
  BreakpointManager,
  SolidityDecoder,
  storage: {
    StorageViewer: StorageViewer,
    StorageResolver: StorageResolver
  },
  CmdLine
}
