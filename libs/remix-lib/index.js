const EventManager = require('./src/eventManager')
const init = require('./src/init')
const Web3Providers = require('./src/web3Provider/web3Providers')
const Web3VmProvider = require('./src/web3Provider/Web3VmProvider')
const DummyProvider = require('./src/web3Provider/dummyProvider')
const Storage = require('./src/storage')

const EventsDecoder = require('./src/execution/eventsDecoder')
const txExecution = require('./src/execution/txExecution')
const txHelper = require('./src/execution/txHelper')
const txFormat = require('./src/execution/txFormat')
const txListener = require('./src/execution/txListener')
const txRunner = require('./src/execution/txRunner')
const executionContext = require('./src/execution/execution-context')
const typeConversion = require('./src/execution/typeConversion')
const util = require('./src/util')
const UniversalDApp = require('./src/universalDapp')

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
  module.exports = modules()
}

function modules () {
  return {
    EventManager: EventManager,
    vm: {
      Web3Providers: Web3Providers,
      DummyProvider: DummyProvider,
      Web3VmProvider: Web3VmProvider
    },
    Storage: Storage,
    init: init,
    util: util,
    execution: {
      EventsDecoder: EventsDecoder,
      txExecution: txExecution,
      txHelper: txHelper,
      executionContext: new executionContext(),
      txFormat: txFormat,
      txListener: txListener,
      txRunner: txRunner,
      typeConversion: typeConversion
    },
    UniversalDApp: UniversalDApp
  }
}
