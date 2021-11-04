// eslint-disable-next-line no-use-before-define
import React, { useState } from 'react'
import { EnvironmentProps } from '../types'

export function EnvironmentUI (props: EnvironmentProps) {
  const [exEnv, setExEnv] = useState<string>('')

  // setDropdown (selectExEnv) {
  //   this.selectExEnv = selectExEnv

  //   const addProvider = (network) => {
  //     selectExEnv.appendChild(yo`<option
  //       title="provider name: ${network.name}"
  //       value="${network.name}"
  //       name="executionContext"
  //     >
  //       ${network.name}
  //     </option>`)
  //     addTooltip(yo`<span><b>${network.name}</b> provider added</span>`)
  //   }

  //   const removeProvider = (name) => {
  //     var env = selectExEnv.querySelector(`option[value="${name}"]`)
  //     if (env) {
  //       selectExEnv.removeChild(env)
  //       addTooltip(yo`<span><b>${name}</b> provider removed</span>`)
  //     }
  //   }
  //   this.blockchain.event.register('addProvider', provider => addProvider(provider))
  //   this.blockchain.event.register('removeProvider', name => removeProvider(name))

  //   selectExEnv.addEventListener('change', (event) => {
  //     const provider = selectExEnv.options[selectExEnv.selectedIndex]
  //     const fork = provider.getAttribute('fork') // can be undefined if connected to an external source (web3 provider / injected)
  //     let context = provider.value
  //     context = context.startsWith('vm') ? 'vm' : context // context has to be 'vm', 'web3' or 'injected'
  //     this.setExecutionContext({ context, fork })
  //   })

  //   selectExEnv.value = this._getProviderDropdownValue()
  // }

  const handleChangeExEnv = (env: string) => {
    setExEnv(env)
    props.updateExEnv(env)
  }
  return (
    <div className="udapp_crow">
      <label id="selectExEnv" className="udapp_settingsLabel">
        Environment
      </label>
      <div className="udapp_environment">
        <select id="selectExEnvOptions" data-id="settingsSelectEnvOptions" className="form-control udapp_select custom-select" value={exEnv} onChange={(e) => { handleChangeExEnv(e.target.value) }}>
          <option id="vm-mode-london" data-id="settingsVMLondonMode"
            title="Execution environment does not connect to any node, everything is local and in memory only."
            value="vm-london"> JavaScript VM (London) {/* fork="london" */}
          </option>
          <option id="vm-mode-berlin" data-id="settingsVMBerlinMode"
            title="Execution environment does not connect to any node, everything is local and in memory only."
            value="vm-berlin"> JavaScript VM (Berlin) {/* fork="berlin" */}
          </option>
          <option id="injected-mode" data-id="settingsInjectedMode"
            title="Execution environment has been provided by Metamask or similar provider."
            value="injected"> Injected Web3
          </option>
          <option id="web3-mode" data-id="settingsWeb3Mode"
            title="Execution environment connects to node at localhost (or via IPC if available), transactions will be sent to the network and can cause loss of money or worse!
            If this page is served via https and you access your node via http, it might not work. In this case, try cloning the repository and serving it via http."
            value="web3"> Web3 Provider
          </option>
        </select>
        <a href="https://remix-ide.readthedocs.io/en/latest/run.html#run-setup" target="_blank"><i className="udapp_infoDeployAction ml-2 fas fa-info" title="check out docs to setup Environment"></i></a>
      </div>
    </div>
  )
}
