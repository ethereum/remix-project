import React, { useState, useEffect } from 'react'
/* eslint-disable-next-line */
import './common.css'

export const ContractSelector = (props: any) => {
    const {contracts, enabledAtAddress} = props
    // const [address, setAddress] = useState("");

    let title = "Please compile *.sol file to deploy or access a contract"
    let isDisabled = false

    if (enabledAtAddress) {
        // if (this.selectContractNames.value === '') return
        isDisabled = false
        title = 'Select contract for Deploy or At Address.'
    } else {
        isDisabled = true
        // if (this.loadType === 'sol') {
            title = '⚠ Select and compile *.sol file to deploy or access a contract.'
        // } else {
            // title = '⚠ Selected *.abi file allows accessing contracts, select and compile *.sol file to deploy and access one.'
        // }
    }

    console.dir("-- contract selector --")
    console.dir(props)
    console.dir(enabledAtAddress)
    console.dir(isDisabled)

    return (
        <>
            {/* <select className="contractNames custom-select" disabled title="Please compile *.sol file to deploy or access a contract"> */}
            <select className="contractNames custom-select" disabled={isDisabled} title={title}>
                {contracts.map((contract, index) => (
                    // <option value={contract.name} compiler={compilerFullName}>{contract.name} - {contract.file}</option>
                    <option value={contract.name} key={index}>{contract.name} - {contract.file}</option>
                ))}
            </select>
        </>
    );
}

export default ContractSelector
