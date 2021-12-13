/* eslint-disable no-undef */
export const fetchAccountsListRequest = () => {
  return {
    type: 'FETCH_ACCOUNTS_LIST_REQUEST',
    payload: null
  }
}

export const fetchAccountsListSuccess = (accounts: Record<string, string>) => {
  return {
    type: 'FETCH_ACCOUNTS_LIST_SUCCESS',
    payload: accounts
  }
}

export const fetchAccountsListFailed = (error: string) => {
  return {
    type: 'FETCH_ACCOUNTS_LIST_FAILED',
    payload: error
  }
}

export const setSendValue = (value: number) => {
  return {
    type: 'SET_SEND_VALUE',
    payload: value
  }
}

export const setSelectedAccount = (account: string) => {
  return {
    type: 'SET_SELECTED_ACCOUNT',
    payload: account
  }
}

export const setSendUnit = (unit: 'ether' | 'finney' | 'gwei' | 'wei') => {
  return {
    type: 'SET_SEND_UNIT',
    payload: unit
  }
}

export const setGasLimit = (gasLimit: number) => {
  return {
    type: 'SET_GAS_LIMIT',
    payload: gasLimit
  }
}

export const setExecutionEnvironment = (executionEnvironment: string) => {
  return {
    type: 'SET_EXECUTION_ENVIRONMENT',
    payload: executionEnvironment
  }
}

export const setPersonalMode = (mode: boolean) => {
  return {
    type: 'SET_PERSONAL_MODE',
    payload: mode
  }
}

export const setNetworkName = (networkName: string) => {
  return {
    type: 'SET_NETWORK_NAME',
    payload: networkName
  }
}

export const addProvider = (provider: string) => {
  return {
    type: 'ADD_PROVIDER',
    payload: provider
  }
}

export const removeProvider = (provider: string) => {
  return {
    type: 'REMOVE_PROVIDER',
    payload: provider
  }
}

export const displayNotification = (title: string, message: string | JSX.Element, labelOk: string, labelCancel: string, actionOk?: (...args) => void, actionCancel?: (...args) => void) => {
  return {
    type: 'DISPLAY_NOTIFICATION',
    payload: { title, message, labelOk, labelCancel, actionOk, actionCancel }
  }
}

export const hideNotification = () => {
  return {
    type: 'HIDE_NOTIFICATION'
  }
}

export const setExternalEndpoint = (endpoint: string) => {
  return {
    type: 'SET_EXTERNAL_WEB3_ENDPOINT',
    payload: endpoint
  }
}

export const displayPopUp = (message: string) => {
  return {
    type: 'DISPLAY_POPUP_MESSAGE',
    payload: message
  }
}

export const hidePopUp = () => {
  return {
    type: 'HIDE_POPUP_MESSAGE'
  }
}

export const setPassphrase = (passphrase: string) => {
  return {
    type: 'SET_PASSPHRASE',
    payload: passphrase
  }
}

export const setMatchPassphrase = (passphrase: string) => {
  return {
    type: 'SET_MATCH_PASSPHRASE',
    payload: passphrase
  }
}

export const fetchContractListRequest = () => {
  return {
    type: 'FETCH_CONTRACT_LIST_REQUEST'
  }
}

export const fetchContractListSuccess = (contracts: { name: string, alias: string, file: string }[]) => {
  return {
    type: 'FETCH_CONTRACT_LIST_SUCCESS',
    payload: contracts
  }
}

export const fetchContractListFailed = (error: string) => {
  return {
    type: 'FETCH_CONTRACT_LIST_FAILED',
    payload: error
  }
}

export const setLoadType = (type: 'abi' | 'sol' | 'other') => {
  return {
    type: 'SET_LOAD_TYPE',
    payload: type
  }
}

export const setCurrentFile = (file: string) => {
  return {
    type: 'SET_CURRENT_FILE',
    payload: file
  }
}
