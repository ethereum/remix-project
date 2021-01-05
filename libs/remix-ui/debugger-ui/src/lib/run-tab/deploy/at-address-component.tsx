import React, { useState, useEffect } from 'react'
import AtAddress from './at-address'
import AtAddressButtonInput from './at-address-button-input'
import A from './abi-label'
/* eslint-disable-next-line */
import './common.css'

export const AtAddressComponent = (props: any) => {
    const {atAddressChanged, loadFromAddress, enabledAtAddress, setEnabledAtAddress} = props
    const [address, setAddress] = useState("");
    // const [enabledAtAddress, setEnabledAtAddress] = useState(false);

    const changeAddress = (e) => {
        const newAddress = e.target.value
        setAddress(newAddress)
        // atAddressChanged(newAddress)
        setEnabledAtAddress(false) // TODO: should atAddressChanged
    }

    let title = "address of contract"
    let isDisabled = false

    if (enabledAtAddress) {
        if (address !== '') {
            isDisabled = false
            title = 'Interact with the given contract.'
        }
    } else {
        isDisabled = true
        if (address === '') {
            title = '⚠ Compile *.sol file or select *.abi file & then enter the address of deployed contract.'
        } else {
            title = '⚠ Compile *.sol file or select *.abi file.'
        }
    }

    return (
        <div className="button atAddressSect">
          {/* ${this.atAddress} */}
          {/* <AtAddress loadFromAddress={loadFromAddress} /> */}
          <button className="atAddress btn btn-sm btn-info" id="runAndDeployAtAdressButton" onClick={() => loadFromAddress(address)}>At Address</button>
          {/* ${this.atAddressButtonInput} */}
          {/* <AtAddressButtonInput atAddressChanged={atAddressChanged} /> */}
          <input className="input ataddressinput form-control" placeholder="Load contract from Address" disabled={isDisabled} title={title} value={address} onInput={(e) => { changeAddress(e) }} />
        </div>
    );
}

export default AtAddressComponent
