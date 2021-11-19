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
