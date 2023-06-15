import { ContractData } from '@remix-project/core-plugin'
import { ContractList, DeployOptions, RunTabState } from '../types'
import { ADD_INSTANCE, UPDATE_INSTANCES_BALANCE, ADD_PROVIDER, CLEAR_INSTANCES, CLEAR_RECORDER_COUNT, DISPLAY_NOTIFICATION, DISPLAY_POPUP_MESSAGE, FETCH_ACCOUNTS_LIST_FAILED, FETCH_ACCOUNTS_LIST_REQUEST, FETCH_ACCOUNTS_LIST_SUCCESS, FETCH_CONTRACT_LIST_FAILED, FETCH_CONTRACT_LIST_REQUEST, FETCH_CONTRACT_LIST_SUCCESS, FETCH_PROVIDER_LIST_FAILED, FETCH_PROVIDER_LIST_REQUEST, FETCH_PROVIDER_LIST_SUCCESS, HIDE_NOTIFICATION, HIDE_POPUP_MESSAGE, REMOVE_INSTANCE, REMOVE_PROVIDER, RESET_STATE, SET_BASE_FEE_PER_GAS, SET_CONFIRM_SETTINGS, SET_CURRENT_CONTRACT, SET_CURRENT_FILE, SET_DECODED_RESPONSE, SET_DEPLOY_OPTIONS, SET_EXECUTION_ENVIRONMENT, SET_EXTERNAL_WEB3_ENDPOINT, SET_GAS_LIMIT, SET_GAS_PRICE, SET_GAS_PRICE_STATUS, SET_IPFS_CHECKED_STATE, SET_LOAD_TYPE, SET_MATCH_PASSPHRASE, SET_MAX_FEE, SET_MAX_PRIORITY_FEE, SET_NETWORK_NAME, SET_PASSPHRASE, SET_PATH_TO_SCENARIO, SET_PERSONAL_MODE, SET_RECORDER_COUNT, SET_SELECTED_ACCOUNT, SET_SEND_UNIT, SET_SEND_VALUE, ADD_DEPLOY_OPTION, REMOVE_DEPLOY_OPTION, SET_REMIXD_ACTIVATED, FETCH_PROXY_DEPLOYMENTS, NEW_PROXY_DEPLOYMENT, RESET_PROXY_DEPLOYMENTS } from '../constants'

declare const window: any
interface Action {
  type: string
  payload: any
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
  selectExEnv: 'vm-merge',
  personalMode: false,
  networkName: 'VM',
  providers: {
    providerList: [],
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
    compilationSource: '',
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
  gasPrice: '',
  instances: {
    instanceList: [],
    error: null
  },
  recorder: {
    pathToScenario: 'scenario.json',
    transactionCount: 0
  },
  remixdActivated: false,
  proxy: {
    deployments: []
  }
}

type AddProvider = {
  name: string,
  displayName: string,
  provider: any,
  title?: string,
  dataId?: string
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
        networkName: state.selectExEnv === 'vm-merge' ? 'VM' : state.networkName,
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
        content: payload.displayName,
        dataId: payload.dataId,
        id,
        title: payload.title,
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

    case UPDATE_INSTANCES_BALANCE: {
      const payload: Array<{ contractData: ContractData, address: string, balance: number, name: string, abi?: any, decodedResponse?: Record<number, any> }> = action.payload

      return {
        ...state,
        instances: {
          ...state.instances,
          instanceList: payload
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
      const payload: { [file: string]: { [name: string]: DeployOptions } } = action.payload

      return {
        ...state,
        contracts: {
          ...state.contracts,
          deployOptions: {...state.contracts.deployOptions, ...payload }
        }
      }
    }

    case REMOVE_DEPLOY_OPTION: {
      const payload: string = action.payload
      const options = state.contracts.deployOptions

      delete options[payload]
      return {
        ...state,
        contracts: {
          ...state.contracts,
          deployOptions: options
        }
      }
    }

    case SET_DEPLOY_OPTIONS: {
      const payload: { [file: string]: { [name: string]: DeployOptions } } = action.payload

      return {
        ...state,
        contracts: {
          ...state.contracts,
          deployOptions: payload
        }
      }
    }

    case SET_REMIXD_ACTIVATED: {
      const payload: boolean = action.payload
      return {
        ...state,
        remixdActivated: payload
      }
    }

    case FETCH_PROXY_DEPLOYMENTS: {
      const payload: { address: string, date: string, contractName: string }[] = action.payload

      return {
        ...state,
        proxy: {
          ...state.proxy,
          deployments: payload
        }
      }
    }

    case NEW_PROXY_DEPLOYMENT: {
      const payload: { address: string, date: string, contractName: string } = action.payload

      return {
        ...state,
        proxy: {
          ...state.proxy,
          deployments: [...state.proxy.deployments, payload]
        }
      }
    }

    case RESET_PROXY_DEPLOYMENTS: {
      return {
        ...state,
        proxy: {
          ...state.proxy,
          deployments: []
        }
      }
    }

    default:
      return state
  }
}
