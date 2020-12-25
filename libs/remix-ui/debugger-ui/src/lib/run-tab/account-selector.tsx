import React, { useState, useEffect } from 'react'
/* eslint-disable-next-line */
import './account-selector.css'

const clipboardstyles = {
  'margin-left': '-5px'
} as React.CSSProperties;

export const AccountSelector = (props: any) => {
    const {updatePlusButton, newAccount, signMessage, copyToClipboard, selectedProvider} = props
    return (
      <div className="crow">
        <label className="settingsLabel">
          Account
          <span id="remixRunPlusWraper" title="Create a new account" onLoad={() => { updatePlusButton() }}>
            <i id="remixRunPlus" className="fas fa-plus-circle icon" aria-hidden="true" onClick={() => { newAccount() }}></i>
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
