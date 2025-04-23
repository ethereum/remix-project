import { shortenAddress } from "@remix-ui/helper"
import { RunTab } from "../types/run-tab"
import { clearInstances, setAccount, setExecEnv } from "./actions"
import { displayNotification, fetchAccountsListFailed, fetchAccountsListRequest, fetchAccountsListSuccess, setMatchPassphrase, setPassphrase } from "./payload"
import { toChecksumAddress } from '@ethereumjs/util'
import { SmartAccount } from "../types"
import "viem/window"
import { custom, createWalletClient, createPublicClient, http } from "viem"
import * as chains from "viem/chains"
import { entryPoint07Address } from "viem/account-abstraction"
const { createSmartAccountClient } = require("permissionless") /* eslint-disable-line  @typescript-eslint/no-var-requires */
const { toSafeSmartAccount } = require("permissionless/accounts") /* eslint-disable-line  @typescript-eslint/no-var-requires */
const { createPimlicoClient } = require("permissionless/clients/pimlico") /* eslint-disable-line  @typescript-eslint/no-var-requires */

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
      const provider = plugin.blockchain.getProvider()
      let safeAddresses = []
      if (provider && provider.startsWith('injected') && accounts?.length) {
        await loadSmartAccounts(plugin)
        if (plugin.REACT_API.smartAccounts) {
          safeAddresses = Object.keys(plugin.REACT_API.smartAccounts)
          accounts.push(...safeAddresses)
        }
      }
      if (!accounts) accounts = []

      const loadedAccounts = {}

      for (const account of accounts) {
        const balance = await plugin.blockchain.getBalanceInEther(account)
        loadedAccounts[account] = shortenAddress(account, balance)
        if (safeAddresses.length && safeAddresses.includes(account)) loadedAccounts[account] = `[SMART] ${loadedAccounts[account]}`
      }
      if (provider && provider.startsWith('injected')) {
        const selectedAddress = plugin.blockchain.getInjectedWeb3Address()
        if (selectedAddress && !(Object.keys(loadedAccounts).includes(toChecksumAddress(selectedAddress)))) setAccount(dispatch, null)
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
  if (executionContext.context === 'walletconnect') {
    setWalletConnectExecutionContext(plugin, dispatch, executionContext)
  } else {
    plugin.blockchain.changeExecutionContext(executionContext, null, (alertMsg) => {
      plugin.call('notification', 'toast', alertMsg)
    }, async () => {
      setFinalContext(plugin, dispatch)
    })
  }
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

export const createSmartAccount = async (plugin: RunTab, dispatch: React.Dispatch<any>) => {
  const localStorageKey = 'smartAccounts'
  const PUBLIC_NODE_URL = "https://go.getblock.io/ee42d0a88f314707be11dd799b122cb9"
  const toAddress = "0xAFdAC33F6F134D46bAbE74d9125F3bf8e8AB3a44" // A dummy zero value tx is made to this address to create existence of smart account
  const safeAddresses: string[] = Object.keys(plugin.REACT_API.smartAccounts)
  const network = 'sepolia'
  const chain = chains[network]
  const BUNDLER_URL = `https://pimlico.remixproject.org/api/proxy/${chain.id}`

  let salt

  // @ts-ignore
  const [account] = await window.ethereum!.request({ method: 'eth_requestAccounts' })

  const walletClient = createWalletClient({
    account,
    chain,
    transport: custom(window.ethereum!),
  })

  const publicClient = createPublicClient({
    chain,
    transport: http(PUBLIC_NODE_URL) // choose any provider here
  })

  if (safeAddresses.length) {
    const lastSafeAddress: string = safeAddresses[safeAddresses.length - 1]
    const lastSmartAccount: SmartAccount = plugin.REACT_API.smartAccounts[lastSafeAddress]
    salt = lastSmartAccount.salt + 1
  } else salt = 0

  try {
    const safeAccount = await toSafeSmartAccount({
      client: publicClient,
      entryPoint: {
        address: entryPoint07Address,
        version: "0.7",
      },
      owners: [walletClient],
      saltNonce: salt,
      version: "1.4.1"
    })

    const paymasterClient = createPimlicoClient({
      transport: http(BUNDLER_URL),
      entryPoint: {
        address: entryPoint07Address,
        version: "0.7",
      },
    })

    const saClient = createSmartAccountClient({
      account: safeAccount,
      chain,
      paymaster: paymasterClient,
      bundlerTransport: http(BUNDLER_URL),
      userOperation: {
        estimateFeesPerGas: async () => (await paymasterClient.getUserOperationGasPrice()).fast,
      }
    })
    // Make a dummy tx to force smart account deployment
    const useropHash = await saClient.sendUserOperation({
      calls: [{
        to: toAddress,
        value: 0
      }]
    })
    await saClient.waitForUserOperationReceipt({ hash: useropHash })

    // TO verify creation, check if there is a contract code at this address
    const safeAddress = safeAccount.address

    const sAccount: SmartAccount = {
      address : safeAccount.address,
      salt,
      ownerEOA: account,
      timestamp: Date.now()
    }
    plugin.REACT_API.smartAccounts[safeAddress] = sAccount
    // Save smart accounts in local storage
    const smartAccountsStr = localStorage.getItem(localStorageKey)
    const smartAccountsObj = JSON.parse(smartAccountsStr)
    smartAccountsObj[plugin.REACT_API.chainId] = plugin.REACT_API.smartAccounts
    localStorage.setItem(localStorageKey, JSON.stringify(smartAccountsObj))

    return plugin.call('notification', 'toast', `Safe account ${safeAccount.address} created for owner ${account}`)
  } catch (error) {
    console.error('Failed to create safe smart account: ', error)
    return plugin.call('notification', 'toast', `Failed to create safe smart account !!!`)
  }
}

export const loadSmartAccounts = async (plugin) => {
  const { chainId } = plugin.REACT_API
  const localStorageKey = 'smartAccounts'

  const smartAccountsStr = localStorage.getItem(localStorageKey)
  if (smartAccountsStr) {
    const smartAccountsObj = JSON.parse(smartAccountsStr)
    if (smartAccountsObj[chainId]) {
      plugin.REACT_API.smartAccounts = smartAccountsObj[chainId]
    } else {
      smartAccountsObj[chainId] = {}
      localStorage.setItem(localStorageKey, JSON.stringify(smartAccountsObj))
    }
  } else {
    const objToStore = {}
    objToStore[chainId] = {}
    localStorage.setItem(localStorageKey, JSON.stringify(objToStore))
  }
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

const setWalletConnectExecutionContext = (plugin: RunTab, dispatch: React.Dispatch<any>, executionContext: { context: string, fork: string }) => {
  plugin.call('walletconnect', 'isWalletConnected').then((isConnected) => {
    if (isConnected) {
      plugin.call('walletconnect', 'openModal').then(() => {
        plugin.blockchain.changeExecutionContext(executionContext, null, (alertMsg) => {
          plugin.call('notification', 'toast', alertMsg)
        }, async () => {
          setFinalContext(plugin, dispatch)
        })
      })
    } else {
      plugin.call('walletconnect', 'openModal').then(() => {
        plugin.on('walletconnect', 'connectionSuccessful', () => {
          plugin.blockchain.changeExecutionContext(executionContext, null, (alertMsg) => {
            plugin.call('notification', 'toast', alertMsg)
          }, async () => {
            setFinalContext(plugin, dispatch)
          })
        })
        plugin.on('walletconnect', 'connectionFailed', () => {
          plugin.call('notification', 'toast', 'Connection failed')
        })
      })
    }
  })
}
