// eslint-disable-next-line no-use-before-define
import React from 'react'
import { EnvironmentProps } from '../types'

export function EnvironmentUI (props: EnvironmentProps) {
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
    props.setExecEnv(env)
    const fork = provider.getAttribute('fork') // can be undefined if connected to an external source (web3 provider / injected)
    let context = provider.value
    context = context.startsWith('vm') ? 'vm' : context // context has to be 'vm', 'web3' or 'injected'
    this.setExecutionContext({ context, fork })
  }

  return (
    <div className="udapp_crow">
      <label id="selectExEnv" className="udapp_settingsLabel">
        Environment
      </label>
      <div className="udapp_environment">
        <select id="selectExEnvOptions" data-id="settingsSelectEnvOptions" className="form-control udapp_select custom-select" value={props.selectedEnv} onChange={(e) => { handleChangeExEnv(e.target.value) }}>
          {
            props.providerList.map((provider) =>
              <option id={provider.id} data-id={provider.dataId}
                title={provider.title}
                value={provider.value}> Web3 Provider
              </option>
            )
          }
        </select>
        <a href="https://remix-ide.readthedocs.io/en/latest/run.html#run-setup" target="_blank"><i className="udapp_infoDeployAction ml-2 fas fa-info" title="check out docs to setup Environment"></i></a>
      </div>
    </div>
  )
}
