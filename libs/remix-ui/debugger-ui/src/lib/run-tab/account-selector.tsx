import React, { useState, useEffect } from 'react'
/* eslint-disable-next-line */
import './account-selector.css'

const clipboardstyles = {
  'margin-left': '-5px'
} as React.CSSProperties;

const plusButtonStyle = (providerName, personalModeChecked) => {
    console.dir("======== plusButtonStyle")
    console.dir(providerName)
    let css = {classList: "", title: ""}

    switch (providerName) {
        case 'injected':
            css.classList = "disableMouseEvents"
            css.title = "Unfortunately it's not possible to create an account using injected web3. Please create the account directly from your provider (i.e metamask or other of the same type)."

            break
        case 'vm':
            css.classList = ""
            css.title = 'Create a new account'

            break
        case 'web3':
            if (!personalModeChecked) {
                css.classList = "disableMouseEvents"
                css.title = "Creating an account is possible only in Personal mode. Please go to Settings to enable it."
            } else {
                css.classList = ""
                css.title = 'Create a new account'
            }

            break
        default: {
            css.classList = "disableMouseEvents"
            css.title = `Unfortunately it's not possible to create an account using an external wallet (${providerName}).`
        }
    }
    return css
}

export const AccountSelector = (props: any) => {
    const {newAccount, signMessage, copyToClipboard, selectedProvider, personalModeChecked} = props
    const plusButtonCss = plusButtonStyle(selectedProvider, personalModeChecked)

    const createAccount = () => {
        if (selectedProvider === "injected") return
        newAccount()
    }

    return (
      <div className="crow">
        <label className="settingsLabel">
          Account
          <span id="remixRunPlusWraper" title={plusButtonCss.title}>
            <i id="remixRunPlus" className={`fas fa-plus-circle icon ${plusButtonCss.classList}`} aria-hidden="true" onClick={() => { createAccount() }}></i>
          </span>
        </label>
        <div className="account">
          <select data-id="runTabSelectAccount" name="txorigin" className="form-control select custom-select pr-4" id="txorigin"></select>
          <i id="remixRunSignMsg" data-id="settingsRemixRunSignMsg" className="mx-1 fas fa-edit icon" aria-hidden="true" onClick={() => {signMessage() }} title="Sign a message using this account key"></i>
        </div>
      </div>
    )
}

{/* <div style={clipboardstyles}>{copyToClipboard(() => (document.querySelector('#runTabView #txorigin') as HTMLInputElement).value)}</div> */}

export default AccountSelector
