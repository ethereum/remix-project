import React, { useState, useEffect } from 'react'
/* eslint-disable-next-line */
import './common.css'

export const AtAddressComponent = (props: any) => {
    const {loadFromAddress} = props
    const [address, setAddress] = useState("");
    const [enabledAtAddress, setEnabledAtAddress] = useState(props.enabledAtAddress);

    useEffect(() => {
        setEnabledAtAddress(props.enabledAtAddress)
    }, [props.enabledAtAddress])

    const changeAddress = (e) => {
        const newAddress = e.target.value
        setAddress(newAddress)
        setEnabledAtAddress(false)
    }

    let title = "Address of contract"
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
          <button className="atAddress btn btn-sm btn-info" id="runAndDeployAtAdressButton" onClick={() => loadFromAddress(address)}>At Address</button>
          <input className="input ataddressinput form-control" placeholder="Load contract from Address" disabled={isDisabled} title={title} value={address} onInput={(e) => { changeAddress(e) }} />
        </div>
    );
}

export default AtAddressComponent
