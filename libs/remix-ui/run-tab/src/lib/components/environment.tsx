// eslint-disable-next-line no-use-before-define
import React from 'react'
import { FormattedMessage } from 'react-intl'
import { EnvironmentProps } from '../types'
import { Dropdown } from 'react-bootstrap'
import { CustomMenu, CustomToggle } from '@remix-ui/helper'
import { OverlayTrigger, Tooltip } from 'react-bootstrap' // eslint-disable-line

export function EnvironmentUI (props: EnvironmentProps) {

  const handleChangeExEnv = (env: string) => {
    const provider = props.providers.providerList.find(exEnv => exEnv.value === env)
    const fork = provider.fork // can be undefined if connected to an external source (External Http Provider / injected)
    let context = provider.value

    context = context.startsWith('vm') ? 'vm' : context

    props.setExecutionContext({ context, fork })
  }

  const currentProvider = props.providers.providerList.find(exEnv => exEnv.value === props.selectedEnv)
  const bridges = {
    'Optimism Provider': 'https://www.optimism.io/apps/bridges',
    'Arbitrum One Provider': 'https://bridge.arbitrum.io/'
  }

  const isL2 = (provider) => provider && (provider.value === 'Optimism Provider' || provider.value === 'Arbitrum One Provider')
  return (
    <div className="udapp_crow">
      <label id="selectExEnv" className="udapp_settingsLabel">
        <FormattedMessage id='udapp.environment' defaultMessage='Environment' />
        <OverlayTrigger placement={'right'} overlay={
              <Tooltip className="text-nowrap" id="info-recorder">
                <span>Open chainlist and add a new provider for the chain you want to interact to.</span>
              </Tooltip>
            }>
            <a href='https://chainlist.org/' target='_blank'><i style={{ fontSize: 'medium' }} className={'ml-2 fad fa-plug'} aria-hidden="true"></i></a>
        </OverlayTrigger>
      </label>
      <div className="udapp_environment">

      <Dropdown id="selectExEnvOptions" data-id="settingsSelectEnvOptions" className='udapp_selectExEnvOptions'>
          <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components" className="btn btn-light btn-block w-100 d-inline-block border border-dark form-control" icon={null}>
            { isL2(currentProvider) && 'L2 - '}
            { currentProvider && currentProvider.content }
            { currentProvider && bridges[currentProvider.value] && <OverlayTrigger placement={'right'} overlay={
              <Tooltip className="text-nowrap" id="info-recorder">
                <span>Click to open a bridge for converting L1 mainnet ETH to the selected network currency.</span>
              </Tooltip>
            }>
            <i style={{ fontSize: 'medium' }} className={'ml-2 fal fa-plug'} aria-hidden="true" onClick={() => { window.open(bridges[currentProvider.value], '_blank') }}></i>
        </OverlayTrigger>}
          </Dropdown.Toggle>
          <Dropdown.Menu as={CustomMenu} className='w-100 custom-dropdown-items' data-id="custom-dropdown-items" >
            {
              props.providers.providerList.map(({ content, value }, index) => (
                <Dropdown.Item
                  key={index}
                  onClick={() => {
                    handleChangeExEnv(value)
                  }}
                  data-id={`dropdown-item-${value}`}
                >
                  <span className="pl-3">{ isL2({ value }) && 'L2 - ' }{ content }</span>
                </Dropdown.Item>
              ))
            }
          </Dropdown.Menu>
        </Dropdown>
        <OverlayTrigger placement={'bottom-start'} overlay={
          <Tooltip className="text-wrap" id="runAndDeployAddresstooltip">
            <span><FormattedMessage id='udapp.environmentDocs' defaultMessage='Click for docs about Environment' /></span>
          </Tooltip>
        }>
          <a href="https://remix-ide.readthedocs.io/en/latest/run.html#environment" target="_blank" rel="noreferrer"><i className="udapp_infoDeployAction ml-2 fas fa-info"></i></a>
        </OverlayTrigger>
      </div>
    </div>
  )
}
