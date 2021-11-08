interface Action {
  type: string
  payload: any
}

export interface RunTabState {
  accounts: {
    loadedAccounts: Record<string, any>,
    isRequesting: boolean,
    isSuccessful: boolean,
    error: null
  }
}

export const runTabInitialState = {
  accounts: {
    loadedAccounts: {},
    isRequesting: false,
    isSuccessful: false,
    error: null
  }
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
    default:
      return state
  }
}

// TODO: unclear what's the goal of accountListCallId, feels like it can be simplified
const resolveAccountsList = async (state: RunTabState, accounts: string[]) => {
  // const txOrigin = this.el.querySelector('#txorigin')
  const loadedAccounts = state.accounts.loadedAccounts

  if (!accounts) accounts = []
  for (const loadedaddress in loadedAccounts) {
    if (accounts.indexOf(loadedaddress) === -1) {
      // txOrigin.removeChild(txOrigin.querySelector('option[value="' + loadedaddress + '"]'))
      delete loadedAccounts[loadedaddress]
    }
  }
  for (const i in accounts) {
    const address = accounts[i]
    if (!loadedAccounts[address]) {
      // txOrigin.appendChild(yo`<option value="${address}" >${address}</option>`)
      loadedAccounts[address] = 1
    }
  }
  return loadedAccounts
  // txOrigin.setAttribute('value', accounts[0])
}
