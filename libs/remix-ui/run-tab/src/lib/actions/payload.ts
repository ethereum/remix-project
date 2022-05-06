import { ContractList } from '../reducers/runTab'
import { ContractData } from '@remix-project/core-plugin'
import { ADD_DEPLOY_OPTION, ADD_INSTANCE, ADD_PROVIDER, CLEAR_INSTANCES, CLEAR_RECORDER_COUNT, DISPLAY_NOTIFICATION, DISPLAY_POPUP_MESSAGE, FETCH_ACCOUNTS_LIST_FAILED, FETCH_ACCOUNTS_LIST_REQUEST, FETCH_ACCOUNTS_LIST_SUCCESS, FETCH_CONTRACT_LIST_FAILED, FETCH_CONTRACT_LIST_REQUEST, FETCH_CONTRACT_LIST_SUCCESS, HIDE_NOTIFICATION, HIDE_POPUP_MESSAGE, REMOVE_DEPLOY_OPTION, REMOVE_INSTANCE, REMOVE_PROVIDER, RESET_STATE, SET_BASE_FEE_PER_GAS, SET_CONFIRM_SETTINGS, SET_CURRENT_CONTRACT, SET_CURRENT_FILE, SET_DECODED_RESPONSE, SET_DEPLOY_OPTIONS, SET_EXECUTION_ENVIRONMENT, SET_EXTERNAL_WEB3_ENDPOINT, SET_GAS_LIMIT, SET_GAS_PRICE, SET_GAS_PRICE_STATUS, SET_IPFS_CHECKED_STATE, SET_LOAD_TYPE, SET_MATCH_PASSPHRASE, SET_MAX_FEE, SET_MAX_PRIORITY_FEE, SET_NETWORK_NAME, SET_PASSPHRASE, SET_PATH_TO_SCENARIO, SET_PERSONAL_MODE, SET_RECORDER_COUNT, SET_SELECTED_ACCOUNT, SET_SEND_UNIT, SET_SEND_VALUE, SET_TX_FEE_CONTENT } from '../constants'
import { DeployMode, DeployOptions } from '../types'

export const fetchAccountsListRequest = () => {
  return {
    type: FETCH_ACCOUNTS_LIST_REQUEST,
    payload: null
  }
}

export const fetchAccountsListSuccess = (accounts: Record<string, string>) => {
  return {
    type: FETCH_ACCOUNTS_LIST_SUCCESS,
    payload: accounts
  }
}

export const fetchAccountsListFailed = (error: string) => {
  return {
    type: FETCH_ACCOUNTS_LIST_FAILED,
    payload: error
  }
}

export const setSendValue = (value: string) => {
  return {
    type: SET_SEND_VALUE,
    payload: value
  }
}

export const setSelectedAccount = (account: string) => {
  return {
    type: SET_SELECTED_ACCOUNT,
    payload: account
  }
}

export const setSendUnit = (unit: 'ether' | 'finney' | 'gwei' | 'wei') => {
  return {
    type: SET_SEND_UNIT,
    payload: unit
  }
}

export const setGasLimit = (gasLimit: number) => {
  return {
    type: SET_GAS_LIMIT,
    payload: gasLimit
  }
}

export const setExecutionEnvironment = (executionEnvironment: string) => {
  return {
    type: SET_EXECUTION_ENVIRONMENT,
    payload: executionEnvironment
  }
}

export const setPersonalMode = (mode: boolean) => {
  return {
    type: SET_PERSONAL_MODE,
    payload: mode
  }
}

export const setNetworkName = (networkName: string) => {
  return {
    type: SET_NETWORK_NAME,
    payload: networkName
  }
}

export const addProvider = (provider: string) => {
  return {
    type: ADD_PROVIDER,
    payload: provider
  }
}

export const removeProvider = (provider: string) => {
  return {
    type: REMOVE_PROVIDER,
    payload: provider
  }
}

export const displayNotification = (title: string, message: string | JSX.Element, labelOk: string, labelCancel: string, actionOk?: (...args) => void, actionCancel?: (...args) => void) => {
  return {
    type: DISPLAY_NOTIFICATION,
    payload: { title, message, labelOk, labelCancel, actionOk, actionCancel }
  }
}

export const hideNotification = () => {
  return {
    type: HIDE_NOTIFICATION
  }
}

export const setExternalEndpoint = (endpoint: string) => {
  return {
    type: SET_EXTERNAL_WEB3_ENDPOINT,
    payload: endpoint
  }
}

export const displayPopUp = (message: string | JSX.Element) => {
  return {
    type: DISPLAY_POPUP_MESSAGE,
    payload: message
  }
}

export const hidePopUp = () => {
  return {
    type: HIDE_POPUP_MESSAGE
  }
}

export const setPassphrase = (passphrase: string) => {
  return {
    type: SET_PASSPHRASE,
    payload: passphrase
  }
}

export const setMatchPassphrase = (passphrase: string) => {
  return {
    type: SET_MATCH_PASSPHRASE,
    payload: passphrase
  }
}

export const fetchContractListRequest = () => {
  return {
    type: FETCH_CONTRACT_LIST_REQUEST
  }
}

export const fetchContractListSuccess = (contracts: ContractList) => {
  return {
    type: FETCH_CONTRACT_LIST_SUCCESS,
    payload: contracts
  }
}

export const fetchContractListFailed = (error: string) => {
  return {
    type: FETCH_CONTRACT_LIST_FAILED,
    payload: error
  }
}

export const setLoadType = (type: 'abi' | 'sol' | 'other') => {
  return {
    type: SET_LOAD_TYPE,
    payload: type
  }
}

export const setCurrentFile = (file: string) => {
  return {
    type: SET_CURRENT_FILE,
    payload: file
  }
}
export const setIpfsCheckedState = (state: boolean) => {
  return {
    type: SET_IPFS_CHECKED_STATE,
    payload: state
  }
}

export const setGasPriceStatus = (status: boolean) => {
  return {
    type: SET_GAS_PRICE_STATUS,
    payload: status
  }
}

export const setConfirmSettings = (confirmation: boolean) => {
  return {
    type: SET_CONFIRM_SETTINGS,
    payload: confirmation
  }
}

export const setMaxFee = (fee: string) => {
  return {
    type: SET_MAX_FEE,
    payload: fee
  }
}

export const setMaxPriorityFee = (fee: string) => {
  return {
    type: SET_MAX_PRIORITY_FEE,
    payload: fee
  }
}

export const setBaseFeePerGas = (baseFee: string) => {
  return {
    type: SET_BASE_FEE_PER_GAS,
    payload: baseFee
  }
}

export const setGasPrice = (price: string) => {
  return {
    type: SET_GAS_PRICE,
    payload: price
  }
}

export const setTxFeeContent = (content: string) => {
  return {
    type: SET_TX_FEE_CONTENT,
    payload: content
  }
}

export const addNewInstance = (instance: { contractData?: ContractData, address: string, name: string, abi?: any }) => {
  return {
    type: ADD_INSTANCE,
    payload: instance
  }
}

export const removeExistingInstance = (index: number) => {
  return {
    type: REMOVE_INSTANCE,
    payload: index
  }
}

export const clearAllInstances = () => {
  return {
    type: CLEAR_INSTANCES
  }
}

export const setDecodedResponse = (instanceIndex: number, response, funcIndex?: number) => {
  return {
    type: SET_DECODED_RESPONSE,
    payload: {
      instanceIndex,
      funcIndex,
      response
    }
  }
}

export const setPathToScenario = (path: string) => {
  return {
    type: SET_PATH_TO_SCENARIO,
    payload: path
  }
}

export const setRecorderCount = (count: number) => {
  return {
    type: SET_RECORDER_COUNT,
    payload: count
  }
}

export const clearRecorderCount = () => {
  return {
    type: CLEAR_RECORDER_COUNT
  }
}

export const resetUdapp = () => {
  return {
    type: RESET_STATE
  }
}

export const addDeployOption = (deployOption: DeployOptions) => {
  return {
    payload: deployOption,
    type: ADD_DEPLOY_OPTION
  }
}

export const removeDeployOption = (title: DeployMode) => {
  return {
    payload: title,
    type: REMOVE_DEPLOY_OPTION
  }
}

export const setDeployOptions = (deployOptions: DeployOptions) => {
  return {
    payload: deployOptions,
    type: SET_DEPLOY_OPTIONS
  }
}

export const setCurrentContract = (contractName: string) => {
  return {
    payload: contractName,
    type: SET_CURRENT_CONTRACT
  }
}
