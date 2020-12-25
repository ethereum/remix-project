import React, { useState, useEffect } from 'react'
/* eslint-disable-next-line */
import './environment-selector.css'

const defaultOptions = [
    {value: "vm", name: "JavaScript VM", title: "Execution environment does not connect to any node, everything is local and in memory only."},
    {value: "injected", name: "Injected Web3", title: "Execution environment has been provided by Metamask or similar provider."},
    {value: "web3", name: "Web3 Provider", title: "Execution environment connects to node at localhost (or via IPC if available), transactions will be sent to the network and can cause loss of money or worse! If this page is served via https and you access your node via http, it might not work. In this case, try cloning the repository and serving it via http."}
]

export const EnvironmentSelector = (props: any) => {
    const [networkMessage, setNetworkMessage] = useState("");
    const {updateNetwork, selectedProvider} = props

    const onSettingsChange = (e) => {
        const provider = e.target.value
        updateNetwork(provider, (msg) => {
            setNetworkMessage(msg)
        })
    }

    return (
        <div className="crow">
            <label id="selectExEnv" className="settingsLabel">
                Environment
            </label>
            <div className="environment">
                <select id="selectExEnvOptions" value={selectedProvider} data-id="settingsSelectEnvOptions" onChange={(e) => { onSettingsChange(e) }}  className="form-control select custom-select">
                {props.options.map((option, index) => (
                    <option id={`${option.value}-mode`} title={option.title} value={option.value}>{option.name}</option>
                ))}
                </select>
                <a href="https://remix-ide.readthedocs.io/en/latest/run.html#run-setup" target="_blank"><i className="infoDeployAction ml-2 fas fa-info" title="check out docs to setup Environment"></i></a>
            </div>
            <div className="crow">
                <div className="settingsLabel">
                </div>
                <div className="environment" data-id="settingsNetworkEnv">
                <span className="network badge badge-secondary">{networkMessage}</span>
                </div>
            </div>
        </div>
    )
}

export default EnvironmentSelector
