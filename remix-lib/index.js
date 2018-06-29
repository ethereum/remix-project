'use strict'
var EventManager = require('./src/eventManager')
var traceHelper = require('./src/helpers/traceHelper')
var uiHelper = require('./src/helpers/uiHelper')
var compilerHelper = require('./src/helpers/compilerHelper')
var SourceMappingDecoder = require('./src/sourceMappingDecoder')
var SourceLocationTracker = require('./src/sourceLocationTracker')
var init = require('./src/init')
var util = require('./src/util')
var Web3Providers = require('./src/web3Provider/web3Providers')
var DummyProvider = require('./src/web3Provider/dummyProvider')
var Web3VMProvider = require('./src/web3Provider/web3VmProvider')
var AstWalker = require('./src/astWalker')
var Storage = require('./src/storage')

var EventsDecoder = require('./src/execution/eventsDecoder')
var txExecution = require('./src/execution/txExecution')
var txHelper = require('./src/execution/txHelper')
var txFormat = require('./src/execution/txFormat')
var txListener = require('./src/execution/txListener')
var txRunner = require('./src/execution/txRunner')
var executionContext = require('./src/execution/execution-context')
var typeConversion = require('./src/execution/typeConversion')

var CodeManager = require('./src/code/codeManager')
var BreakpointManager = require('./src/code/breakpointManager')
var TraceManager = require('./src/trace/traceManager')

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
  module.exports = modules()
}

if (typeof (window) !== 'undefined') {
  window.remix = modules()
}

function modules () {
  return {
    code: {
      CodeManager: CodeManager,
      BreakpointManager: BreakpointManager
    },
    trace: {
      TraceManager: TraceManager
    },
    EventManager: EventManager,
    helpers: {
      trace: traceHelper,
      ui: uiHelper,
      compiler: compilerHelper
    },
    vm: {
      Web3Providers: Web3Providers,
      DummyProvider: DummyProvider,
      Web3VMProvider: Web3VMProvider
    },
    SourceMappingDecoder: SourceMappingDecoder,
    SourceLocationTracker: SourceLocationTracker,
    Storage: Storage,
    init: init,
    util: util,
    AstWalker: AstWalker,
    execution: {
      EventsDecoder: EventsDecoder,
      txExecution: txExecution,
      txHelper: txHelper,
      executionContext: executionContext,
      txFormat: txFormat,
      txListener: txListener,
      txRunner: txRunner,
      typeConversion: typeConversion
    }
  }
}
