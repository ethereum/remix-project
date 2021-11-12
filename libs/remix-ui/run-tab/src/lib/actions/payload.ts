export const fetchAccountsListRequest = () => {
  return {
    type: 'FETCH_ACCOUNTS_LIST_REQUEST',
    payload: null
  }
}

export const fetchAccountsListSuccess = (accounts: string[]) => {
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
