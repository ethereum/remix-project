import React, { useState, useEffect } from 'react'

export const Contracts = (props: any) => {
//   const { updateNetwork, newAccount, signMessage, copyToClipboard, options, personalModeChecked, selectedProvider, accounts } = props
    return (
        <div>
            <div className="container" data-id="contractDropdownContainer">
                <label className="settingsLabel">Contract</label>
                <div className="subcontainer">
                    {/* <ContractSelector contracts={contracts} enabledAtAddress={enabledAtAddress} /> */}
                    {/* <div className="button-container" ref={ref => ref && ((ref.childNodes[0] && ref.removeChild(ref.childNodes[0]) && ref.appendChild(deployButton)) || ref.appendChild(deployButton))} /> */}
                    {/* <IPFSCheck toggleCheckedState={this.toggleCheckedState.bind(this)} initialCheck={this.ipfsCheckedState} /> */}
                    {/* <IPFSCheck toggleCheckedState={testFunction} initialCheck={testFunction} /> */}
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
                    {/* <AtAddressComponent loadFromAddress={loadFromAddress} atAddressChanged={atAddressChanged} enabledAtAddress={enabledAtAddress} setEnabledAtAddress={setEnabledAtAddress} /> */}
                </div>
            </div>
        </div>
    )
}

export default Contracts