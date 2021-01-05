import React, { useState, useEffect } from 'react'
/* eslint-disable-next-line */
import './common.css'
import ContractSelector from './contract-selector'
import AbiLabel from './abi-label'
import AtAddressComponent from './at-address-component'
import CompilationFail from './compilation-fail'
import IPFSCheck from './ipfs-check'

const testFunction = () => {
}

export const ContractsComponent = (props: any) => {
    const {contracts, deployButton, loadFromAddress, noCompilationError} = props
    // const [address, setAddress] = useState("");
    const [enabledAtAddress, setEnabledAtAddress] = useState(props.enabledAtAddress);

    useEffect(() => {
        setEnabledAtAddress(props.enabledAtAddress)
    }, [props.enabledAtAddress])

    console.dir(deployButton)
    // let enabledAtAddress = true

    const atAddressChanged = (address) => {
        console.dir("address changed")
        console.dir(address)
    }

    // const loadFromAddress = (address) => {
    //     console.dir("load from address")
    //     console.dir(address)
    // }

    // TODO: get selected contract

    return (
        <div>
            <div className="container" data-id="contractDropdownContainer">
                <label className="settingsLabel">Contract</label>
                <div className="subcontainer">
                    <ContractSelector contracts={contracts} enabledAtAddress={enabledAtAddress} />
                    <div className="button-container" ref={ref => ref && ((ref.childNodes[0] && ref.removeChild(ref.childNodes[0]) && ref.appendChild(deployButton)) || ref.appendChild(deployButton))} />
                    {/* <IPFSCheck toggleCheckedState={this.toggleCheckedState.bind(this)} initialCheck={this.ipfsCheckedState} /> */}
                    <IPFSCheck toggleCheckedState={testFunction} initialCheck={testFunction} />
                    {/* <div dangerouslySetInnerHTML={{ __html: deployButton.innerHTML }}></div> */}
                    {/* {deployButton.innerHTML} */}
                    {/* ${this.selectContractNames} ${this.compFails} */}
                    {/* <CompilationFail /> */}
                    {/* ${this.abiLabel} */}
                    {/* <AbiLabel /> */}
                </div>
                <div>
                    {/* ${this.createPanel} */}
                    <div className="deployDropdown"></div>
                    {/* ${this.orLabel} */}
                    <div className="orLabel mt-2">or</div>
                    {/* ${this.atAddressComponent} */}
                    {/* <AtAddressComponent enabledAtAddress={enabledAtAddress} loadFromAddress={loadFromAddress} atAddressChanged={atAddressChanged} /> */}
                    <AtAddressComponent loadFromAddress={loadFromAddress} atAddressChanged={atAddressChanged} enabledAtAddress={enabledAtAddress} setEnabledAtAddress={setEnabledAtAddress} />
                </div>
            </div>
        </div>
    );
}

export default ContractsComponent
