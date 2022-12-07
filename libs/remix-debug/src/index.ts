'use strict'
export * as init from './init'
export { Ethdebugger as EthDebugger } from './Ethdebugger'
export { Debugger as TransactionDebugger } from './debugger/debugger'
export { CmdLine } from './cmdline'
export { StorageViewer } from './storage/storageViewer'
export { StorageResolver } from './storage/storageResolver'
export * as SolidityDecoder from './solidity-decoder'
export { BreakpointManager } from './code/breakpointManager'
export * as sourceMappingDecoder from './source/sourceMappingDecoder'
export * as traceHelper from './trace/traceHelper'
export { DebuggerUIProps } from './idebugger-api'

/*
  Use of breakPointManager :

  var breakPointManager = new BreakpointManager(this.debugger, (sourceLocation) => {
    return line/column from offset (sourceLocation)
  })
  this.debugger.setBreakpointManager(breakPointManager)
*/
