import React, { useState, useEffect } from 'react'
/* eslint-disable-next-line */
import EnvironmentSelector from './settings/environment-selector'
import AccountSelector from './settings/account-selector'
import GasPrice from './settings/gas-price'
import ValueSelector from './settings/value-selector'
import './settings.css'

export const Settings = (props: any) => {
    const {updateNetwork, newAccount, signMessage, copyToClipboard, options, personalModeChecked, selectedProvider, accounts} = props
    return (
        <div className="settings">
          <EnvironmentSelector options={options} updateNetwork={updateNetwork} selectedProvider={selectedProvider} />
          {/* ${networkEl} */}
          <AccountSelector accounts={accounts} newAccount={newAccount} signMessage={signMessage} copyToClipboard={copyToClipboard} selectedProvider={selectedProvider} personalModeChecked={personalModeChecked} />
          <GasPrice />
          <ValueSelector />
        </div>
    )
}

export default Settings
