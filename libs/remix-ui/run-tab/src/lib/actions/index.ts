import { shortenAddress } from '@remix-ui/helper'
import React from 'react'
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

    fillAccountsList()
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
