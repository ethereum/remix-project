'use strict'
const EventManager = require('./src/eventManager')
const traceHelper = require('./src/helpers/traceHelper')
const uiHelper = require('./src/helpers/uiHelper')
const compilerHelper = require('./src/helpers/compilerHelper')
const SourceMappingDecoder = require('./src/sourceMappingDecoder')
const SourceLocationTracker = require('./src/sourceLocationTracker')
const OffsetToColumnConverter = require('./src/offsetToLineColumnConverter')
const init = require('./src/init')
const util = require('./src/util')
const Web3Providers = require('./src/web3Provider/web3Providers')
const DummyProvider = require('./src/web3Provider/dummyProvider')
const Web3VMProvider = require('./src/web3Provider/web3VmProvider')
const AstWalker = require('./src/astWalker')
const Storage = require('./src/storage')

const EventsDecoder = require('./src/execution/eventsDecoder')
const txExecution = require('./src/execution/txExecution')
const txHelper = require('./src/execution/txHelper')
const txFormat = require('./src/execution/txFormat')
const txListener = require('./src/execution/txListener')
const txRunner = require('./src/execution/txRunner')
const executionContext = require('./src/execution/execution-context')
const typeConversion = require('./src/execution/typeConversion')

const CodeManager = require('./src/code/codeManager')
const BreakpointManager = require('./src/code/breakpointManager')
const TraceManager = require('./src/trace/traceManager')

const UniversalDApp = require('./src/universalDapp')

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
    OffsetToColumnConverter: OffsetToColumnConverter,
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
    },
    UniversalDApp: UniversalDApp
  }
}
