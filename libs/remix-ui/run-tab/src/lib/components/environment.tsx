// eslint-disable-next-line no-use-before-define
import React from 'react'
import { FormattedMessage } from 'react-intl'
import { EnvironmentProps, Provider } from '../types'
import { Dropdown } from 'react-bootstrap'
import { CustomMenu, CustomToggle, CustomTooltip } from '@remix-ui/helper'

export function EnvironmentUI(props: EnvironmentProps) {
  const handleChangeExEnv = (env: string) => {
    const provider = props.providers.providerList.find((exEnv) => exEnv.name === env)
    const context = provider.name
    props.setExecutionContext({ context })
  }

  const currentProvider = props.providers.providerList.find((exEnv) => exEnv.name === props.selectedEnv)
  const bridges = {
    'L2 - Optimism': 'https://app.optimism.io/bridge/deposit',
    'L2 - Arbitrum': 'https://bridge.arbitrum.io/'
  }

  const isL2 = (providerDisplayName: string) => providerDisplayName === 'L2 - Optimism' || providerDisplayName === 'L2 - Arbitrum'
  return (
    <div className="udapp_crow">
      <label id="selectExEnv" className="udapp_settingsLabel">
        <FormattedMessage id="udapp.environment" />

        <CustomTooltip placement={'right'} tooltipClasses="text-nowrap" tooltipId="info-recorder" tooltipText={<FormattedMessage id="udapp.tooltipText2" />}>
          <a href="https://chainlist.org/" target="_blank">
            <i className={'ml-2 fas fa-plug'} aria-hidden="true"></i>
          </a>
        </CustomTooltip>
        <CustomTooltip placement={'right'} tooltipClasses="text-wrap" tooltipId="runAndDeployAddresstooltip" tooltipText={<FormattedMessage id="udapp.environmentDocs" />}>
          <a href="https://remix-ide.readthedocs.io/en/latest/run.html#environment" target="_blank" rel="noreferrer">
            <i className="udapp_infoDeployAction ml-2 fas fa-info-circle"></i>
          </a>
        </CustomTooltip>
      </label>
      <div className="udapp_environment">
        <Dropdown id="selectExEnvOptions" data-id="settingsSelectEnvOptions" className="udapp_selectExEnvOptions">
          <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components" className="btn btn-light btn-block w-100 d-inline-block border border-dark form-control" icon={null}>
            {isL2(currentProvider && currentProvider.displayName)}
            {currentProvider && currentProvider.displayName}
            {currentProvider && bridges[currentProvider.displayName] && (
              <CustomTooltip placement={'right'} tooltipClasses="text-nowrap" tooltipId="info-recorder" tooltipText={<FormattedMessage id="udapp.tooltipText3" />}>
                <i
                  style={{ fontSize: 'medium' }}
                  className={'ml-2 fa fa-rocket-launch'}
                  aria-hidden="true"
                  onClick={() => {
                    window.open(bridges[currentProvider.displayName], '_blank')
                  }}
                ></i>
              </CustomTooltip>
            )}
          </Dropdown.Toggle>
          <Dropdown.Menu as={CustomMenu} className="w-100 custom-dropdown-items" data-id="custom-dropdown-items">
            {props.providers.providerList.map(({ displayName, name }, index) => (
              <Dropdown.Item
                key={index}
                onClick={() => {
                  handleChangeExEnv(name)
                }}
                data-id={`dropdown-item-${name}`}
              >
                <span className="">
                  {isL2(displayName)}
                  {displayName}
                </span>
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  )
}
