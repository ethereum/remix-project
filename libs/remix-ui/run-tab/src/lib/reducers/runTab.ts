import { CompilerAbstract } from '@remix-project/remix-solidity-ts'
import { ContractData } from '@remix-project/core-plugin'
import { DeployMode, DeployOption, DeployOptions } from '../types'
import { ADD_DEPLOY_OPTION, ADD_INSTANCE, ADD_PROVIDER, CLEAR_INSTANCES, CLEAR_RECORDER_COUNT, DISPLAY_NOTIFICATION, DISPLAY_POPUP_MESSAGE, FETCH_ACCOUNTS_LIST_FAILED, FETCH_ACCOUNTS_LIST_REQUEST, FETCH_ACCOUNTS_LIST_SUCCESS, FETCH_CONTRACT_LIST_FAILED, FETCH_CONTRACT_LIST_REQUEST, FETCH_CONTRACT_LIST_SUCCESS, FETCH_PROVIDER_LIST_FAILED, FETCH_PROVIDER_LIST_REQUEST, FETCH_PROVIDER_LIST_SUCCESS, HIDE_NOTIFICATION, HIDE_POPUP_MESSAGE, REMOVE_DEPLOY_OPTION, REMOVE_INSTANCE, REMOVE_PROVIDER, RESET_STATE, SET_BASE_FEE_PER_GAS, SET_CONFIRM_SETTINGS, SET_CURRENT_CONTRACT, SET_CURRENT_FILE, SET_DECODED_RESPONSE, SET_DEPLOY_OPTIONS, SET_EXECUTION_ENVIRONMENT, SET_EXTERNAL_WEB3_ENDPOINT, SET_GAS_LIMIT, SET_GAS_PRICE, SET_GAS_PRICE_STATUS, SET_IPFS_CHECKED_STATE, SET_LOAD_TYPE, SET_MATCH_PASSPHRASE, SET_MAX_FEE, SET_MAX_PRIORITY_FEE, SET_NETWORK_NAME, SET_PASSPHRASE, SET_PATH_TO_SCENARIO, SET_PERSONAL_MODE, SET_RECORDER_COUNT, SET_SELECTED_ACCOUNT, SET_SEND_UNIT, SET_SEND_VALUE, SET_TX_FEE_CONTENT } from '../constants'
interface Action {
  type: string
  payload: any
}
export interface Contract {
  name: string,
  alias: string,
  file: string,
  compiler: CompilerAbstract
}

export interface ContractList {
  [file: string]: Contract[]
}
export interface RunTabState {
  accounts: {
    loadedAccounts: Record<string, string>,
    isRequesting: boolean,
    isSuccessful: boolean,
    error: string,
    selectedAccount: string
  },
  sendValue: string,
  sendUnit: 'ether' | 'finney' | 'gwei' | 'wei',
  gasLimit: number,
  selectExEnv: string,
  personalMode: boolean,
  networkName: string,
  providers: {
    providerList: {
      id?: string,
      dataId?: string,
      title?: string,
      value: string,
      fork?: string
      content: string
    }[],
    isRequesting: boolean,
    isSuccessful: boolean,
    error: string
  },
  notification: {
    title: string,
    message: string,
    actionOk: () => void,
    actionCancel: (() => void) | null,
    labelOk: string,
    labelCancel: string
  },
  externalEndpoint: string,
  popup: string,
  passphrase: string,
  matchPassphrase: string,
  contracts: {
    contractList: {
      [file: string]: {
        name: string,
        alias: string,
        file: string,
        compiler: CompilerAbstract
      }[]
    },
    deployOptions: DeployOptions
    loadType: 'abi' | 'sol' | 'other'
    currentFile: string,
    currentContract: string,
    compilationCount: number,
    isRequesting: boolean,
    isSuccessful: boolean,
    error: string
  },
  ipfsChecked: boolean,
  gasPriceStatus: boolean,
  confirmSettings: boolean,
  maxFee: string,
  maxPriorityFee: string,
  baseFeePerGas: string,
  txFeeContent: string,
  gasPrice: string,
  instances: {
    instanceList: {
      contractData?: ContractData,
      address: string,
      name: string,
      decodedResponse?: Record<number, any>,
      abi?: any
    }[],
    error: string
  },
  recorder: {
    pathToScenario: string,
    transactionCount: number
  }
}

export const runTabInitialState: RunTabState = {
  accounts: {
    loadedAccounts: {},
    isRequesting: false,
    isSuccessful: false,
    error: null,
    selectedAccount: ''
  },
  sendValue: '0',
  sendUnit: 'wei',
  gasLimit: 3000000,
  selectExEnv: 'vm-london',
  personalMode: false,
  networkName: 'VM',
  providers: {
    providerList: [{
      id: 'vm-mode-london',
      dataId: 'settingsVMLondonMode',
      title: 'Execution environment is local to Remix.  Data is only saved to browser memory and will vanish upon reload.',
      value: 'vm-london',
      fork: 'london',
      content: 'JavaScript VM (London)'
    }, {
      id: 'vm-mode-berlin',
      dataId: 'settingsVMBerlinMode',
      title: 'Execution environment is local to Remix.  Data is only saved to browser memory and will vanish upon reload.',
      value: 'vm-berlin',
      fork: 'berlin',
      content: 'JavaScript VM (Berlin)'
    }, {
      id: 'injected-mode',
      dataId: 'settingsInjectedMode',
      title: 'Execution environment has been provided by Metamask or similar provider.',
      value: 'injected',
      content: 'Injected Web3'
    }, {
      id: 'web3-mode',
      dataId: 'settingsWeb3Mode',
      title: `Execution environment connects to an external node. For security, only connect to trusted networks. If Remix is served via https and your node is accessed via http, it might not work. In this case, try cloning the repository and serving it via http.`,
      value: 'web3',
      content: 'Web3 Provider'
    }],
    isRequesting: false,
    isSuccessful: false,
    error: null
  },
  notification: {
    title: '',
    message: '',
    actionOk: () => {},
    actionCancel: () => {},
    labelOk: '',
    labelCancel: ''
  },
  externalEndpoint: 'http://127.0.0.1:8545',
  popup: '',
  passphrase: '',
  matchPassphrase: '',
  contracts: {
    contractList: {},
    deployOptions: {} as any,
    loadType: 'other',
    currentFile: '',
    currentContract: '',
    compilationCount: 0,
    isRequesting: false,
    isSuccessful: false,
    error: null
  },
  ipfsChecked: false,
  gasPriceStatus: false,
  confirmSettings: false,
  maxFee: '',
  maxPriorityFee: '1',
  baseFeePerGas: '',
  txFeeContent: '',
  gasPrice: '',
  instances: {
    instanceList: [],
    error: null
  },
  recorder: {
    pathToScenario: 'scenario.json',
    transactionCount: 0
  }
}

type AddProvider = {
  name: string,
  provider: any
}

export const runTabReducer = (state: RunTabState = runTabInitialState, action: Action) => {
  switch (action.type) {
    case FETCH_ACCOUNTS_LIST_REQUEST: {
      return {
        ...state,
        accounts: {
          ...state.accounts,
          isRequesting: true,
          isSuccessful: false,
          error: null
        }
      }
    }

    case FETCH_ACCOUNTS_LIST_SUCCESS: {
      const payload: Record<string, string> = action.payload

      return {
        ...state,
        accounts: {
          ...state.accounts,
          loadedAccounts: payload,
          isSuccessful: true,
          isRequesting: false,
          error: null
        }
      }
    }

    case FETCH_ACCOUNTS_LIST_FAILED: {
      const payload: string = action.payload

      return {
        ...state,
        accounts: {
          ...state.accounts,
          isRequesting: false,
          isSuccessful: false,
          error: payload
        }
      }
    }

    case SET_SEND_VALUE: {
      const payload: string = action.payload

      return {
        ...state,
        sendValue: payload
      }
    }

    case SET_SELECTED_ACCOUNT: {
      const payload: string = action.payload

      return {
        ...state,
        accounts: {
          ...state.accounts,
          selectedAccount: payload
        }
      }
    }

    case SET_SEND_UNIT: {
      const payload: 'ether' | 'finney' | 'gwei' | 'wei' = action.payload

      return {
        ...state,
        sendUnit: payload
      }
    }

    case SET_GAS_LIMIT: {
      const payload: number = action.payload

      return {
        ...state,
        gasLimit: payload
      }
    }

    case SET_EXECUTION_ENVIRONMENT: {
      const payload: string = action.payload

      return {
        ...state,
        selectExEnv: payload,
        networkName: state.selectExEnv === 'vm-london' || state.selectExEnv === 'vm-berlin' ? 'VM' : state.networkName,
        accounts: {
          ...state.accounts,
          selectedAccount: '',
          loadedAccounts: {}
        }
      }
    }

    case SET_PERSONAL_MODE: {
      const payload: boolean = action.payload

      return {
        ...state,
        personalMode: payload
      }
    }

    case SET_NETWORK_NAME: {
      const payload: string = action.payload

      return {
        ...state,
        networkName: payload
      }
    }

    case FETCH_PROVIDER_LIST_REQUEST: {
      return {
        ...state,
        providers: {
          ...state.providers,
          isRequesting: true,
          isSuccessful: false,
          error: null
        }
      }
    }

    case FETCH_PROVIDER_LIST_SUCCESS: {
      const payload: { id?: string, dataId?: string, title?: string, value: string, fork?: string, content: string }[] = action.payload

      return {
        ...state,
        providers: {
          ...state.providers,
          providerList: payload,
          isSuccessful: true,
          isRequesting: false,
          error: null
        }
      }
    }

    case FETCH_PROVIDER_LIST_FAILED: {
      const payload: string = action.payload

      return {
        ...state,
        providers: {
          ...state.providers,
          isRequesting: false,
          isSuccessful: false,
          error: payload
        }
      }
    }

    case ADD_PROVIDER: {
      const payload: AddProvider = action.payload
      const id = action.payload.name
      state.providers.providerList.push({
        content: payload.name,
        dataId: id,
        id,
        title: payload.name,
        value: id
      })
      return {
        ...state,
        providers: {
          ...state.providers,
          providerList: state.providers.providerList
        }
      }
    }

    case REMOVE_PROVIDER: {
      const id: string = action.payload
      const providers = state.providers.providerList.filter((el) => el.id !== id)
      return {
        ...state,
        providers: {
          ...state.providers,
          providerList: providers
        }
      }
    }

    case DISPLAY_NOTIFICATION: {
      const payload = action.payload as { title: string, message: string, actionOk: () => void, actionCancel: () => void, labelOk: string, labelCancel: string }

      return {
        ...state,
        notification: {
          title: payload.title,
          message: payload.message,
          actionOk: payload.actionOk || runTabInitialState.notification.actionOk,
          actionCancel: payload.actionCancel || runTabInitialState.notification.actionCancel,
          labelOk: payload.labelOk,
          labelCancel: payload.labelCancel
        }
      }
    }

    case HIDE_NOTIFICATION: {
      return {
        ...state,
        notification: runTabInitialState.notification
      }
    }

    case SET_EXTERNAL_WEB3_ENDPOINT: {
      const payload: string = action.payload

      return {
        ...state,
        externalEndpoint: payload
      }
    }

    case DISPLAY_POPUP_MESSAGE: {
      const payload = action.payload as string

      return {
        ...state,
        popup: payload
      }
    }

    case HIDE_POPUP_MESSAGE: {
      return {
        ...state,
        popup: ''
      }
    }

    case SET_PASSPHRASE: {
      const passphrase: string = action.payload

      return {
        ...state,
        passphrase
      }
    }

    case SET_MATCH_PASSPHRASE: {
      const passphrase: string = action.payload

      return {
        ...state,
        matchPassphrase: passphrase
      }
    }

    case FETCH_CONTRACT_LIST_REQUEST: {
      return {
        ...state,
        contracts: {
          ...state.contracts,
          isRequesting: true,
          isSuccessful: false,
          error: null
        }
      }
    }

    case FETCH_CONTRACT_LIST_SUCCESS: {
      const payload: ContractList = action.payload

      return {
        ...state,
        contracts: {
          ...state.contracts,
          contractList: { ...state.contracts.contractList, ...payload },
          isSuccessful: true,
          isRequesting: false,
          error: null
        }
      }
    }

    case FETCH_CONTRACT_LIST_FAILED: {
      const payload: string = action.payload

      return {
        ...state,
        contracts: {
          ...state.contracts,
          isRequesting: false,
          isSuccessful: false,
          error: payload
        }
      }
    }

    case SET_CURRENT_CONTRACT: {
      const payload: string = action.payload

      return {
        ...state,
        contracts: {
          ...state.contracts,
          currentContract: payload
        }
      }
    }

    case SET_LOAD_TYPE: {
      const payload: 'abi' | 'sol' | 'other' = action.payload

      return {
        ...state,
        contracts: {
          ...state.contracts,
          loadType: payload
        }
      }
    }

    case SET_CURRENT_FILE: {
      const payload: string = action.payload

      return {
        ...state,
        contracts: {
          ...state.contracts,
          currentFile: payload,
          compilationCount: state.contracts.compilationCount + 1
        }
      }
    }

    case SET_IPFS_CHECKED_STATE: {
      const payload: boolean = action.payload

      return {
        ...state,
        ipfsChecked: payload
      }
    }

    case SET_GAS_PRICE_STATUS: {
      const payload: boolean = action.payload

      return {
        ...state,
        gasPriceStatus: payload
      }
    }

    case SET_CONFIRM_SETTINGS: {
      const payload: boolean = action.payload

      return {
        ...state,
        confirmSettings: payload
      }
    }

    case SET_MAX_FEE: {
      const payload: string = action.payload

      return {
        ...state,
        maxFee: payload
      }
    }

    case SET_MAX_PRIORITY_FEE: {
      const payload: string = action.payload

      return {
        ...state,
        maxPriorityFee: payload
      }
    }

    case SET_BASE_FEE_PER_GAS: {
      const payload: string = action.payload

      return {
        ...state,
        baseFeePerGas: payload
      }
    }

    case SET_GAS_PRICE: {
      const payload: string = action.payload

      return {
        ...state,
        gasPrice: payload
      }
    }

    case SET_TX_FEE_CONTENT: {
      const payload: string = action.payload

      return {
        ...state,
        txFeeContent: payload
      }
    }

    case ADD_INSTANCE: {
      const payload: { contractData: ContractData, address: string, name: string, abi?: any, decodedResponse?: Record<number, any> } = action.payload

      return {
        ...state,
        instances: {
          ...state.instances,
          instanceList: [...state.instances.instanceList, payload]
        }
      }
    }

    case REMOVE_INSTANCE: {
      const payload: number = action.payload

      return {
        ...state,
        instances: {
          ...state.instances,
          instanceList: state.instances.instanceList.filter((_, index) => index !== payload)
        }
      }
    }

    case CLEAR_INSTANCES: {
      return {
        ...state,
        instances: {
          instanceList: [],
          error: null
        }
      }
    }

    case SET_DECODED_RESPONSE: {
      const payload: { instanceIndex: number, funcIndex: number, response: any } = action.payload

      return {
        ...state,
        instances: {
          ...state.instances,
          instanceList: state.instances.instanceList.map((instance, index) => {
            if (payload.instanceIndex === index) instance.decodedResponse[payload.funcIndex] = payload.response
            return instance
          })
        }
      }
    }

    case SET_PATH_TO_SCENARIO: {
      const payload: string = action.payload

      return {
        ...state,
        recorder: {
          ...state.recorder,
          pathToScenario: payload
        }
      }
    }

    case SET_RECORDER_COUNT: {
      const payload: number = action.payload

      return {
        ...state,
        recorder: {
          ...state.recorder,
          transactionCount: payload
        }
      }
    }

    case CLEAR_RECORDER_COUNT: {
      return {
        ...state,
        recorder: {
          ...state.recorder,
          transactionCount: 0
        }
      }
    }

    case RESET_STATE: {
      return {
        ...runTabInitialState,
        ipfsChecked: state.ipfsChecked
      }
    }

    case ADD_DEPLOY_OPTION: {
      const payload: { title: DeployMode, active: boolean } = action.payload

      return {
        ...state,
        contracts: {
          ...state.contracts,
          deployOptions: { 
            ...state.contracts.deployOptions,
            options: [...state.contracts.deployOptions.options, payload]
          }
        }
      }
    }

    case REMOVE_DEPLOY_OPTION: {
      const payload: string = action.payload
      const options = state.contracts.deployOptions.options.filter(val => val.title !== payload)

      
      return {
        ...state,
        contracts: {
          ...state.contracts,
          deployOptions: {
            ...state.contracts.deployOptions,
            options
          }
        }
      }
    }

    case SET_DEPLOY_OPTIONS: {
      const payload: DeployOptions = action.payload

      return {
        ...state,
        contracts: {
          ...state.contracts,
          deployOptions: payload
        }
      }
    }

    default:
      return state
  }
}
