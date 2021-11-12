// eslint-disable-next-line no-unused-vars
import React from 'react'
import * as ethJSUtil from 'ethereumjs-util'
import Web3 from 'web3'
import { shortenAddress } from '@remix-ui/helper'
import { fetchAccountsListFailed, fetchAccountsListRequest, fetchAccountsListSuccess, setGasLimit, setSelectedAccount, setSendUnit, setSendValue } from './payload'
import { runTabInitialState, runTabReducer } from '../reducers/runTab'

export function useRunTabPlugin (plugin) {
  const [runTab, dispatch] = React.useReducer(runTabReducer, runTabInitialState)

  const setupEvents = () => {
    plugin.blockchain.events.on('newTransaction', (tx, receipt) => {
      plugin.emit('newTransaction', tx, receipt)
    })

    plugin.blockchain.event.register('transactionExecuted', (error, from, to, data, lookupOnly, txResult) => {
      if (!lookupOnly) dispatch(setSendValue(0))
      if (error) return
      updateAccountBalances()
    })

    plugin.blockchain.resetAndInit(plugin.config, {
      getAddress: (cb) => {
        cb(null, runTab.accounts.selectedAccount)
      },
      getValue: (cb) => {
        try {
          const number = runTab.sendValue
          const unit = runTab.sendUnit

          cb(null, Web3.utils.toWei(number, unit))
        } catch (e) {
          cb(e)
        }
      },
      getGasLimit: (cb) => {
        try {
          cb(null, '0x' + new ethJSUtil.BN(runTab.gasLimit, 10).toString(16))
        } catch (e) {
          cb(e.message)
        }
      }
    })
    console.log('called: reset and init')
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
  }

  const fillAccountsList = async () => {
    try {
      dispatch(fetchAccountsListRequest())
      const promise = plugin.blockchain.getAccounts()

      promise.then((accounts: string[]) => {
        dispatch(fetchAccountsListSuccess(accounts))
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

  return { runTab, setupEvents, fillAccountsList, setAccount, setUnit, setGasFee }
}
