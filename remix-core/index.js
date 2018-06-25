var CodeManager = require('./src/code/codeManager')
var BreakpointManager = require('./src/code/breakpointManager')
var StorageViewer = require('./src/storage/storageViewer')
var StorageResolver = require('./src/storage/storageResolver')
var TraceManager = require('./src/trace/traceManager')

module.exports = {
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
