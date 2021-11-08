export const fetchAccountsListRequest = () => {
  return {
    type: 'FETCH_ACCOUNTS_LIST_REQUEST'
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
