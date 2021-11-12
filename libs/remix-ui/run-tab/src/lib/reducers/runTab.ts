interface Action {
  type: string
  payload: any
}

export interface RunTabState {
  accounts: {
    loadedAccounts: Record<string, any>,
    isRequesting: boolean,
    isSuccessful: boolean,
    error: string,
    selectedAccount: string
  },
  sendValue: string,
  sendUnit: 'ether' | 'finney' | 'gwei' | 'wei',
  gasLimit: number
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
  sendUnit: 'ether',
  gasLimit: 3000000
}

export const runTabReducer = (state: RunTabState = runTabInitialState, action: Action) => {
  switch (action.type) {
    case 'FETCH_ACCOUNTS_LIST_REQUEST': {
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
    case 'FETCH_ACCOUNTS_LIST_SUCCESS': {
      const payload: string[] = action.payload as string[]

      return {
        ...state,
        accounts: {
          ...state.accounts,
          loadedAccounts: resolveAccountsList(state, payload),
          isSuccessful: true,
          isRequesting: false,
          error: null
        }
      }
    }
    case 'FETCH_ACCOUNTS_LIST_FAILED': {
      const payload = action.payload as string

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
    case 'SET_SEND_VALUE': {
      const payload = action.payload as string

      return {
        ...state,
        sendValue: payload
      }
    }
    case 'SET_SELECTED_ACCOUNT': {
      const payload = action.payload as string

      return {
        ...state,
        accounts: {
          ...state.accounts,
          selectedAccount: payload
        }
      }
    }
    case 'SET_SEND_UNIT': {
      const payload = action.payload as 'ether' | 'finney' | 'gwei' | 'wei'

      return {
        ...state,
        sendUnit: payload
      }
    }

    case 'SET_GAS_LIMIT': {
      const payload = action.payload as number

      return {
        ...state,
        gasLimit: payload
      }
    }
    default:
      return state
  }
}

// TODO: unclear what's the goal of accountListCallId, feels like it can be simplified
const resolveAccountsList = async (state: RunTabState, accounts: string[]) => {
  const loadedAccounts = state.accounts.loadedAccounts

  if (!accounts) accounts = []
  for (const loadedaddress in loadedAccounts) {
    if (accounts.indexOf(loadedaddress) === -1) {
      delete loadedAccounts[loadedaddress]
    }
  }
  for (const i in accounts) {
    const address = accounts[i]
    if (!loadedAccounts[address]) {
      loadedAccounts[address] = 1
    }
  }
  return loadedAccounts
}
