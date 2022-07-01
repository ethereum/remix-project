// eslint-disable-next-line no-use-before-define
import React from 'react'
import { EnvironmentProps } from '../types'

export function EnvironmentUI (props: EnvironmentProps) {
  const handleChangeExEnv = (env: string) => {
    const provider = props.providers.providerList.find(exEnv => exEnv.value === env)
    const fork = provider.fork // can be undefined if connected to an external source (web3 provider / injected)
    let context = provider.value

    context = context.startsWith('vm') ? 'vm' : context // context has to be 'vm', 'web3' or 'injected'

    props.setExecutionContext({ context, fork })
  }

  return (
    <div className="udapp_crow">
      <label id="selectExEnv" className="udapp_settingsLabel">
        Environment
      </label>
      <div className="udapp_environment">
        <select id="selectExEnvOptions" data-id="settingsSelectEnvOptions" className="form-control udapp_select custom-select" value={props.selectedEnv || ''} onChange={(e) => { handleChangeExEnv(e.target.value) }}>
          {
            props.providers.providerList.map((provider, index) =>
              <option id={provider.id} key={index} data-id={provider.dataId}
                title={provider.title}
                value={provider.value}> { provider.content }
              </option>
            )
          }
        </select>
        <a href="https://remix-ide.readthedocs.io/en/latest/run.html#environment" target="_blank" rel="noreferrer"><i className="udapp_infoDeployAction ml-2 fas fa-info" title="Click for docs about Environment"></i></a>
      </div>
    </div>
  )
}
