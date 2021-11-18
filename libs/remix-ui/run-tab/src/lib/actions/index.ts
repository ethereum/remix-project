// eslint-disable-next-line no-unused-vars
import React from 'react'
import * as ethJSUtil from 'ethereumjs-util'
import Web3 from 'web3'
import { shortenAddress } from '@remix-ui/helper'
import { addProvider, fetchAccountsListFailed, fetchAccountsListRequest, fetchAccountsListSuccess, removeProvider, setExecutionEnvironment, setExternalEndpoint, setGasLimit, setNetworkName, setSelectedAccount, setSendUnit, setSendValue } from './payload'
import { Udapp } from '../types'

let plugin: Udapp, dispatch: React.Dispatch<any>

export const initRunTab = (udapp: Udapp) => async (reducerDispatch: React.Dispatch<any>) => {
  plugin = udapp
  dispatch = reducerDispatch
  setupEvents()
}

const setupEvents = () => {
  plugin.blockchain.resetAndInit(plugin.config, {
    getAddress: (cb) => {
      cb(null, plugin.REACT_API.accounts.selectedAccount)
    },
    getValue: (cb) => {
      try {
        const number = plugin.REACT_API.sendValue
        const unit = plugin.REACT_API.sendUnit

        cb(null, Web3.utils.toWei(number, unit))
      } catch (e) {
        cb(e)
      }
    },
    getGasLimit: (cb) => {
      try {
        cb(null, '0x' + new ethJSUtil.BN(plugin.REACT_API.gasLimit, 10).toString(16))
      } catch (e) {
        cb(e.message)
      }
    }
  })

  plugin.blockchain.events.on('newTransaction', (tx, receipt) => {
    plugin.emit('newTransaction', tx, receipt)
  })

  plugin.blockchain.event.register('transactionExecuted', (error, from, to, data, lookupOnly, txResult) => {
    if (!lookupOnly) dispatch(setSendValue(0))
    if (error) return
    updateAccountBalances()
  })

  plugin.blockchain.event.register('contextChanged', (context, silent) => {
    setFinalContext()
  })

  plugin.blockchain.event.register('networkStatus', ({ error, network }) => {
    if (error) {
      const netUI = 'can\'t detect network '
      setNetworkNameFromProvider(netUI)

      return
    }
    const networkProvider = plugin.networkModule.getNetworkProvider.bind(plugin.networkModule)
    const netUI = (networkProvider() !== 'vm') ? `${network.name} (${network.id || '-'}) network` : ''

    setNetworkNameFromProvider(netUI)
  })

  plugin.blockchain.event.register('addProvider', provider => addExternalProvider(provider))
  plugin.blockchain.event.register('removeProvider', name => removeExternalProvider(name))
  plugin.on('manager', 'pluginActivated', addPluginProvider.bind(plugin))
  plugin.on('manager', 'pluginDeactivated', removePluginProvider.bind(plugin))

  // setInterval(() => {
  //   fillAccountsList()
  // }, 1000)
  // fillAccountsList()
  setTimeout(() => {
    fillAccountsList()
  }, 0)
}

const updateAccountBalances = () => {
  const accounts = runTab.accounts.loadedAccounts

  Object.keys(accounts).map((value) => {
    plugin.blockchain.getBalanceInEther(value, (err, balance) => {
      if (err) return
      const updated = shortenAddress(value, balance)

      accounts[value] = updated
    })
  })
  dispatch(fetchAccountsListSuccess(accounts))
}

const fillAccountsList = async () => {
  try {
    dispatch(fetchAccountsListRequest())
    const promise = plugin.blockchain.getAccounts()

    promise.then((accounts: string[]) => {
      const loadedAccounts = {}

      if (!accounts) accounts = []
      accounts.forEach((account) => {
        plugin.blockchain.getBalanceInEther(account, (err, balance) => {
          if (err) return
          const updated = shortenAddress(account, balance)

          loadedAccounts[account] = updated
        })
      })
      dispatch(fetchAccountsListSuccess(loadedAccounts))
    }).catch((e) => {
      dispatch(fetchAccountsListFailed(e.message))
    })
  } catch (e) {
    // addTooltip(`Cannot get account list: ${e}`)
  }
}

const setAccount = (account: string) => {
  dispatch(setSelectedAccount(account))
}

const setUnit = (unit: 'ether' | 'finney' | 'gwei' | 'wei') => {
  dispatch(setSendUnit(unit))
}

const setGasFee = (value: number) => {
  dispatch(setGasLimit(value))
}

const addPluginProvider = (profile) => {
  if (profile.kind === 'provider') {
    ((profile, app) => {
      const web3Provider = {
        async sendAsync (payload, callback) {
          try {
            const result = await app.call(profile.name, 'sendAsync', payload)
            callback(null, result)
          } catch (e) {
            callback(e)
          }
        }
      }
      app.blockchain.addProvider({ name: profile.displayName, provider: web3Provider })
    })(profile, plugin)
  }
}

const removePluginProvider = (profile) => {
  if (profile.kind === 'provider') plugin.blockchain.removeProvider(profile.displayName)
}

const setFinalContext = () => {
  // set the final context. Cause it is possible that this is not the one we've originaly selected
  const value = _getProviderDropdownValue()

  setExecEnv(value)
  // this.event.trigger('clearInstance', [])
}

const _getProviderDropdownValue = (): string => {
  const provider = plugin.blockchain.getProvider()
  const fork = plugin.blockchain.getCurrentFork()

  return provider === 'vm' ? provider + '-' + fork : provider
}

const setExecEnv = (env: string) => {
  dispatch(setExecutionEnvironment(env))
}

const setNetworkNameFromProvider = (networkName: string) => {
  dispatch(setNetworkName(networkName))
}

const addExternalProvider = (network) => {
  dispatch(addProvider(network))
  // addTooltip(yo`<span><b>${network.name}</b> provider added</span>`)
}

const removeExternalProvider = (name) => {
  dispatch(removeProvider(name))
}

const setProviderFromEndpoint = (executionContext: { context: string, fork: string }) => {
  plugin.blockchain.setProviderFromEndpoint(runTab.externalEndpoint, executionContext, (alertMsg) => {
    // if (alertMsg) addTooltip(alertMsg)
    setFinalContext()
  })
}

const setExecutionContext = (executionContext: { context: string, fork: string }) => {
  plugin.blockchain.changeExecutionContext(executionContext, () => {
    executionContextModal(executionContext)
  }, (alertMsg) => {
    // addTooltip(alertMsg)
  }, setFinalContext())
}

const setWeb3Endpoint = (endpoint: string) => {
  dispatch(setExternalEndpoint(endpoint))
}
