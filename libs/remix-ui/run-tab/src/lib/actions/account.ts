import { shortenAddress } from "@remix-ui/helper"
import { RunTab } from "../types/run-tab"
import { clearInstances, setAccount, setExecEnv } from "./actions"
import { displayNotification, fetchAccountsListFailed, fetchAccountsListRequest, fetchAccountsListSuccess, setMatchPassphrase, setPassphrase } from "./payload"
import { toChecksumAddress } from '@ethereumjs/util'
import { PersistedAccount } from "../types"
import { parse } from "path"

export const updateAccountBalances = async (plugin: RunTab, dispatch: React.Dispatch<any>) => {
  const accounts = plugin.REACT_API.accounts.loadedAccounts

  for (const account of Object.keys(accounts)) {
    const balance = await plugin.blockchain.getBalanceInEther(account)
    const updated = shortenAddress(account, balance)
    accounts[account] = updated
  }
  dispatch(fetchAccountsListSuccess(accounts))
}

export const fillAccountsList = async (plugin: RunTab, dispatch: React.Dispatch<any>) => {
  try {
    dispatch(fetchAccountsListRequest())
    try {
      let accounts = await plugin.blockchain.getAccounts()
      if (!accounts) accounts = []

      const loadedAccounts = {}

      for (const account of accounts) {
        const balance = await plugin.blockchain.getBalanceInEther(account)
        loadedAccounts[account] = shortenAddress(account, balance)
      }
      const provider = plugin.blockchain.getProvider()

      if (provider && provider.startsWith('injected')) {
        const selectedAddress = plugin.blockchain.getInjectedWeb3Address()
        if (!(Object.keys(loadedAccounts).includes(toChecksumAddress(selectedAddress)))) setAccount(dispatch, null)
      }
      dispatch(fetchAccountsListSuccess(loadedAccounts))
    } catch (e) {
      dispatch(fetchAccountsListFailed(e.message))
    }
  } catch (e) {
    plugin.call('notification', 'toast', `Cannot get account list: ${e}`)
  }
}

export const setFinalContext = (plugin: RunTab, dispatch: React.Dispatch<any>) => {
  dispatch(fetchAccountsListRequest())
  // set the final context. Cause it is possible that this is not the one we've originally selected
  const value = _getProviderDropdownValue(plugin)

  setExecEnv(dispatch, value)
  clearInstances(dispatch)
}

const _getProviderDropdownValue = (plugin: RunTab): string => {
  return plugin.blockchain.getProvider()
}

export const setExecutionContext = (plugin: RunTab, dispatch: React.Dispatch<any>, executionContext: { context: string, fork: string }) => {
  plugin.blockchain.changeExecutionContext(executionContext, null, (alertMsg) => {
    plugin.call('notification', 'toast', alertMsg)
  }, () => { setFinalContext(plugin, dispatch) })
}

export const createNewBlockchainAccount = async (plugin: RunTab, dispatch: React.Dispatch<any>, cbMessage: JSX.Element) => {
  plugin.blockchain.newAccount(
    '',
    (cb) => {
      dispatch(displayNotification('Enter Passphrase', cbMessage, 'OK', 'Cancel', async () => {
        if (plugin.REACT_API.passphrase === plugin.REACT_API.matchPassphrase) {
          cb(plugin.REACT_API.passphrase)
        } else {
          dispatch(displayNotification('Error', 'Passphrase does not match', 'OK', null))
        }
        setPassphrase('')
        setMatchPassphrase('')
      }, () => {}))
    },
    async (error, address) => {
      if (error) {
        return plugin.call('notification', 'toast', 'Cannot create an account: ' + error)
      }
      plugin.call('notification', 'toast', `account ${address} created`)
      await fillAccountsList(plugin, dispatch)
    }
  )
}

export const signMessageWithAddress = (plugin: RunTab, dispatch: React.Dispatch<any>, account: string, message: string, modalContent: (hash: string, data: string) => JSX.Element, passphrase?: string) => {
  plugin.blockchain.signMessage(message, account, passphrase, (err, msgHash, signedData) => {
    if (err) {
      console.error(err)
      return plugin.call('notification', 'toast', typeof err === 'string' ? err : err.message)
    }
    dispatch(displayNotification('Signed Message', modalContent(msgHash, signedData), 'OK', null, () => {}, null))
  })
}

export const addFileInternal = async (plugin: RunTab, path: string, content: string) => {
  const file = await plugin.call('fileManager', 'writeFileNoRewrite', path, content)
  await plugin.call('fileManager', 'open', file.newPath)
}

function readFromLocalStorage(key: string) {
  if (key.length === 0) return null
  const item = localStorage.getItem(key)
  if (item === null) {
    // Only initialize if we're specifically looking for selectedAccount
    if (key === 'selectedAccount') {
      const initialValue = { persistId: '', account: '', network: '', timestamp: 0 }
      localStorage.setItem('selectedAccount', JSON.stringify(initialValue))
      return initialValue
    }
    return null
  }
  try {
    return JSON.parse(item)
  } catch (e) {
    return null
  }
}

function writeToLocalStorage(readFromLocalStorage: (key: string) => any, key: string, value: any) {
  if (key.length === 0) return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('Failed to write to localStorage:', e)
  }
}

/**
 * @description Persist account selected to localStorage. Other bits of data
 * should be persisted with the account data.
 * @param {PersistedAccount} currentAccount
 * @returns {[boolean, PersistedAccount]} Returns a tuple with the first element
 * being a boolean indicating if the account was persisted successfully and the
 * second element being the persisted account data.
 */
export function tryPersistAccountSelection(currentAccount: PersistedAccount): [boolean, PersistedAccount] {
  const timestamp = Date.now()
  if (!currentAccount.account || !currentAccount.network) return [false, null]
  // get selected account from localStorage and compare current object passed in to see if it is the same
  const parsedAccount = readFromLocalStorage('selectedAccount')

  if (parsedAccount === null) {
    writeToLocalStorage(readFromLocalStorage, 'selectedAccount', currentAccount)
    return [true, currentAccount]
  }
  if (parsedAccount?.account === currentAccount?.account && parsedAccount?.network === currentAccount?.network) return [true, currentAccount]
  const selectedAccount: PersistedAccount = { account: currentAccount.account, network: currentAccount.network, timestamp }
  writeToLocalStorage(readFromLocalStorage, 'selectedAccount', selectedAccount)
  return [true, selectedAccount]
}

/**
 * @description Check if the persisted account selection matches the environment and account passed in.
 * @param {string} exEnv - The environment to check against.
 * @param {string} account - The account to check against.
 * @returns {object} An object with the account and network if the persisted account selection matches the environment and account passed in.
 */
export function checkPersistedAccountSelectionEnvironmentMatch(exEnv: string, account: string): { account: string, network: string } {
  const parsedAccount = readFromLocalStorage('selectedAccount')
  if (!parsedAccount) return { account: '', network: '' }

  const emptyResult = { account: '', network: '' }
  const matchedResult = { account: parsedAccount.account, network: parsedAccount.network }

  // Return empty result if no account is selected in VM environment
  if (exEnv === 'vm-cancun' && !account) return emptyResult

  // Return match if environment and account match exactly
  if (exEnv === parsedAccount.network) return matchedResult

  // Return match if not in VM and accounts match
  if (exEnv !== 'vm-cancun' && account && account === parsedAccount.account) return matchedResult

  return emptyResult
}
