import React, { useState, useEffect } from 'react'
import { CopyToClipboard } from '@remix-ui/clipboard'
/* eslint-disable-next-line */
import './account-selector.css'

const clipboardstyles = {
  'margin-left': '-5px'
} as React.CSSProperties;

const plusButtonStyle = (providerName, personalModeChecked) => {
  let css = { classList: "", title: "" }

  switch (providerName) {
    case 'injected':
      css.classList = "remixui_disableMouseEvents"
      css.title = "Unfortunately it's not possible to create an account using injected web3. Please create the account directly from your provider (i.e metamask or other of the same type)."

      break
    case 'vm':
      css.classList = ""
      css.title = 'Create a new account'

      break
    case 'web3':
      if (!personalModeChecked) {
        css.classList = "remixui_disableMouseEvents"
        css.title = "Creating an account is possible only in Personal mode. Please go to Settings to enable it."
      } else {
        css.classList = ""
        css.title = 'Create a new account'
      }

      break
    default: {
      css.classList = "remixui_disableMouseEvents"
      css.title = `Unfortunately it's not possible to create an account using an external wallet (${providerName}).`
    }
  }
  return css
}

export const AccountSelector = (props: any) => {
  const { newAccount, signMessage, copyToClipboard, selectedProvider, personalModeChecked, accounts } = props
  const plusButtonCss = plusButtonStyle(selectedProvider, personalModeChecked)
  const [selectedAccount, setSelectedAccount] = useState(null)

  useEffect(() => { setSelectedAccount(selectedAccount || accounts[0].address) }, [accounts])

  const createAccount = () => {
    if (selectedProvider === "injected") return
    newAccount()
  }

  return (
    <div className="remixui_crow">
      <label className="remixui_settingsLabel">
        Account
          <span id="remixRunPlusWraper" title={plusButtonCss.title}>
          <i id="remixRunPlus" className={`fas fa-plus-circle remixui_icon {plusButtonCss.classList}`} aria-hidden="true" onClick={() => { createAccount() }}></i>
        </span>
      </label>
      <div className="remixui_account">
        <select data-id="runTabSelectAccount" name="txorigin" className="form-control remixui_select custom-select pr-4" id="txorigin" onChange={(e) => setSelectedAccount(e.target.value)}>
          {accounts.map((account, index) => (
            <option key={account.address} value={account.address}>{account.name}</option>
          ))}
        </select>
        <CopyToClipboard content={selectedAccount} data-id="dropdownPanelCopyToClipboard" />
        <i id="remixRunSignMsg" data-id="settingsRemixRunSignMsg" className="mx-1 fas fa-edit remixui_icon" aria-hidden="true" onClick={() => { signMessage() }} title="Sign a message using this account key"></i>
      </div>
    </div>
  )
}

export default AccountSelector
