import React, { useState, useEffect } from 'react'
/* eslint-disable-next-line */
import EnvironmentSelector from './environment-selector'
import AccountSelector from './account-selector'
import GasPrice from './gas-price'
import ValueSelector from './value-selector'
import './settings.css'

export const Settings = (props: any) => {
    const {updateNetwork, updatePlusButton, newAccount, signMessage, copyToClipboard, options} = props
    return (
        <div className="settings">
          <EnvironmentSelector options={options} updateNetwork={updateNetwork} />
          {/* ${networkEl} */}
          <AccountSelector updatePlusButton={updatePlusButton} newAccount={newAccount} signMessage={signMessage} copyToClipboard={copyToClipboard} />
          <GasPrice />
          <ValueSelector />
        </div>
    )
}

export default Settings
