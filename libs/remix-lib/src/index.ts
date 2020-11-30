const EventManager = require('./eventManager')
const uiHelper = require('./helpers/uiHelper')
const compilerHelper = require('./helpers/compilerHelper')
const util = require('./util')
const Web3Providers = require('./web3Provider/web3Providers')
const DummyProvider = require('./web3Provider/dummyProvider')
const Web3VMProvider = require('./web3Provider/web3VmProvider')
const Storage = require('./storage')

const EventsDecoder = require('./execution/eventsDecoder')
const txExecution = require('./execution/txExecution')
const txHelper = require('./execution/txHelper')
const txFormat = require('./execution/txFormat')
const txListener = require('./execution/txListener')
const txRunner = require('./execution/txRunner')
const ExecutionContext = require('./execution/execution-context')
const typeConversion = require('./execution/typeConversion')

const UniversalDApp = require('./universalDapp')

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
    },
    UniversalDApp: UniversalDApp
  }
}
