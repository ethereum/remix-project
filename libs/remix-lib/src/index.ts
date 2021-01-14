import { EventManager } from './eventManager'
import * as uiHelper from './helpers/uiHelper'
import * as compilerHelper from './helpers/compilerHelper'
import * as util from './util'
import { Web3Providers } from './web3Provider/web3Providers'
import { DummyProvider } from './web3Provider/dummyProvider'
import { Web3VmProvider } from './web3Provider/web3VmProvider'
import { Storage } from './storage'
import { EventsDecoder } from './execution/eventsDecoder'
import * as txExecution from './execution/txExecution'
import * as txHelper from './execution/txHelper'
import * as txFormat from './execution/txFormat'
import { TxListener } from './execution/txListener'
import { TxRunner } from './execution/txRunner'
import { LogsManager } from './execution/logsManager'
import { ExecutionContext } from './execution/execution-context'
import * as typeConversion from './execution/typeConversion'
import { TxRunnerVM } from './execution/txRunnerVM'
import { TxRunnerWeb3 } from './execution/txRunnerWeb3'
import * as txResultHelper from './helpers/txResultHelper'

export = modules()

function modules () {
  return {
    EventManager: EventManager,
    helpers: {
      ui: uiHelper,
      compiler: compilerHelper,
      txResultHelper
    },
    vm: {
      Web3Providers: Web3Providers,
      DummyProvider: DummyProvider,
      Web3VMProvider: Web3VmProvider
    },
    Storage: Storage,
    util: util,
    execution: {
      EventsDecoder: EventsDecoder,
      txExecution: txExecution,
      txHelper: txHelper,
      executionContext: new ExecutionContext(),
      txFormat: txFormat,
      txListener: TxListener,
      TxRunner: TxRunner,
      TxRunnerWeb3: TxRunnerWeb3,
      TxRunnerVM: TxRunnerVM,
      typeConversion: typeConversion,
      LogsManager
    }
  }
}
