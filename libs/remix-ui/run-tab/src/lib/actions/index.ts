import React from 'react'
import { shortenAddress } from '@remix-ui/helper'
import * as ethJSUtil from 'ethereumjs-util'
import Web3 from 'web3'
import { fetchAccountsListFailed, fetchAccountsListRequest, fetchAccountsListSuccess } from './payload'

let plugin, dispatch: React.Dispatch<any>

export const initSettingsTab = (udapp) => async (reducerDispatch: React.Dispatch<any>) => {
  if (udapp) {
    plugin = udapp
    dispatch = reducerDispatch
    setupEvents()

    setInterval(() => {
      fillAccountsList()
    }, 1000)
  }
}

const setupEvents = () => {
  plugin.blockchain.events.on('newTransaction', (tx, receipt) => {
    plugin.emit('newTransaction', tx, receipt)
  })

  plugin.blockchain.event.register('transactionExecuted', (error, from, to, data, lookupOnly, txResult) => {
    // if (!lookupOnly) this.el.querySelector('#value').value = 0
    if (error) return
    updateAccountBalances()
  })

  plugin.blockchain.resetAndInit(plugin.config, {
    getAddress: (cb) => {
      cb(null, $('#txorigin').val())
    },
    getValue: (cb) => {
      try {
        const number = document.querySelector('#value').value
        const select = document.getElementById('unit')
        const index = select.selectedIndex
        const selectedUnit = select.querySelectorAll('option')[index].dataset.unit
        let unit = 'ether' // default
        if (['ether', 'finney', 'gwei', 'wei'].indexOf(selectedUnit) >= 0) {
          unit = selectedUnit
        }
        cb(null, Web3.utils.toWei(number, unit))
      } catch (e) {
        cb(e)
      }
    },
    getGasLimit: (cb) => {
      try {
        cb(null, '0x' + new ethJSUtil.BN($('#gasLimit').val(), 10).toString(16))
      } catch (e) {
        cb(e.message)
      }
    }
  })
}

const updateAccountBalances = () => {
  // const accounts = $(this.el.querySelector('#txorigin')).children('option')

  // accounts.each((index, account) => {
  //   plugin.blockchain.getBalanceInEther(account.value, (err, balance) => {
  //     if (err) return
  //     const updated = shortenAddress(account.value, balance)

  //     if (updated !== account.innerText) { // check if the balance has been updated and update UI accordingly.
  //       account.innerText = updated
  //     }
  //   })
  // })
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
