const EventManager = require('./src/eventManager')
const uiHelper = require('./src/helpers/uiHelper')
const compilerHelper = require('./src/helpers/compilerHelper')
const util = require('./src/util')
const Web3Providers = require('./src/web3Provider/web3Providers')
const DummyProvider = require('./src/web3Provider/dummyProvider')
const Web3VMProvider = require('./src/web3Provider/web3VmProvider')
const Storage = require('./src/storage')

const EventsDecoder = require('./src/execution/eventsDecoder')
const txExecution = require('./src/execution/txExecution')
const txHelper = require('./src/execution/txHelper')
const txFormat = require('./src/execution/txFormat')
const txListener = require('./src/execution/txListener')
const txRunner = require('./src/execution/txRunner')
const ExecutionContext = require('./src/execution/execution-context')
const typeConversion = require('./src/execution/typeConversion')

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
  module.exports = modules()
}

function modules () {
  return {
    EventManager: EventManager,
    helpers: {
      ui: uiHelper,
      compiler: compilerHelper
    },
    vm: {
      Web3Providers: Web3Providers,
      DummyProvider: DummyProvider,
      Web3VMProvider: Web3VMProvider
    },
    Storage: Storage,
    util: util,
    execution: {
      EventsDecoder: EventsDecoder,
      txExecution: txExecution,
      txHelper: txHelper,
      executionContext: new ExecutionContext(),
      txFormat: txFormat,
      txListener: txListener,
      txRunner: txRunner,
      typeConversion: typeConversion
    }
  }
}
