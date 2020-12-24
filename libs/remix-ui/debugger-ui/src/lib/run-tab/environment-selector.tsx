import React, { useState, useEffect } from 'react'
/* eslint-disable-next-line */
import './environment-selector.css'

export const EnvironmentSelector = (props: any) => {
    const {updateNetwork} = props
    return (
        <div className="crow">
        <label id="selectExEnv" className="settingsLabel">
            Environment
        </label>
        <div className="environment">
            <select id="selectExEnvOptions" data-id="settingsSelectEnvOptions" onChange={() => { updateNetwork() }}  className="form-control select custom-select">
            <option id="vm-mode"
                title="Execution environment does not connect to any node, everything is local and in memory only."
                value="vm"> JavaScript VM new one
            </option>
            <option id="injected-mode"
                title="Execution environment has been provided by Metamask or similar provider."
                value="injected"> Injected Web3
            </option>
            <option id="web3-mode" data-id="settingsWeb3Mode"
                title="Execution environment connects to node at localhost (or via IPC if available), transactions will be sent to the network and can cause loss of money or worse!
                If this page is served via https and you access your node via http, it might not work. In this case, try cloning the repository and serving it via http."
                value="web3"> Web3 Provider
            </option>
            </select>
            <a href="https://remix-ide.readthedocs.io/en/latest/run.html#run-setup" target="_blank"><i className="infoDeployAction ml-2 fas fa-info" title="check out docs to setup Environment"></i></a>
        </div>
        </div>
    )
}

export default EnvironmentSelector
