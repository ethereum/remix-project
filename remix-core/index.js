var CodeManager = require('./src/code/codeManager')
var StorageViewer = require('./src/storage/storageViewer')
var StorageResolver = require('./src/storage/storageResolver')
var TraceManager = require('./src/trace/traceManager')

module.exports = {
  global: {
    web3: null
  },
  code: {
    CodeManager: CodeManager
  },
  storage: {
    StorageViewer: StorageViewer,
    StorageResolver: StorageResolver
  },
  trace: {
    TraceManager: TraceManager
  }
}
