// eslint-disable-next-line no-use-before-define
import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { EnvironmentProps } from '../types'

export function EnvironmentUI (props: EnvironmentProps) {
  const handleChangeExEnv = (env: string) => {
    const provider = props.providers.providerList.find(exEnv => exEnv.value === env)
    const fork = provider.fork // can be undefined if connected to an external source (web3 provider / injected)
    let context = provider.value

    context = context.startsWith('vm') ? 'vm' : context

    props.setExecutionContext({ context, fork })
  }

  const intl = useIntl()

  return (
    <div className="udapp_crow">
      <label id="selectExEnv" className="udapp_settingsLabel">
        <FormattedMessage id='udapp.environment' defaultMessage='Environment' />
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
        <a href="https://remix-ide.readthedocs.io/en/latest/run.html#environment" target="_blank" rel="noreferrer">
          <i
            className="udapp_infoDeployAction ml-2 fas fa-info"
            title={intl.formatMessage({id: 'udapp.environmentDocs', defaultMessage: "Click for docs about Environment"})}
          ></i>
        </a>
      </div>
    </div>
  )
}
