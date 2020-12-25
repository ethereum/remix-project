import React, { useState, useEffect } from 'react'
/* eslint-disable-next-line */
import EnvironmentSelector from './environment-selector'
import AccountSelector from './account-selector'
import GasPrice from './gas-price'
import ValueSelector from './value-selector'
import './settings.css'

export const Settings = (props: any) => {
    const {updateNetwork, newAccount, signMessage, copyToClipboard, options, personalModeChecked, selectedProvider} = props
    return (
        <div className="settings">
          <EnvironmentSelector options={options} updateNetwork={updateNetwork} selectedProvider={selectedProvider} />
          {/* ${networkEl} */}
          <AccountSelector newAccount={newAccount} signMessage={signMessage} copyToClipboard={copyToClipboard} selectedProvider={selectedProvider} personalModeChecked={personalModeChecked} />
          <GasPrice />
          <ValueSelector />
        </div>
    )
}

export default Settings
