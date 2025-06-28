// eslint-disable-next-line no-use-before-define
import React, { useRef } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { EnvironmentProps } from '../types'
import { Dropdown } from 'react-bootstrap'
import { CustomMenu, CustomToggle, CustomTooltip } from '@remix-ui/helper'
import { DropdownLabel } from './dropdownLabel'
import { setExecutionContext } from '../actions/account'

const _paq = (window._paq = window._paq || [])

export function EnvironmentUI(props: EnvironmentProps) {
  const vmStateName = useRef('')

  Object.entries(props.providers.providerList.filter((provider) => { return provider.config.isVM }))
  Object.entries(props.providers.providerList.filter((provider) => { return provider.config.isInjected }))
  Object.entries(props.providers.providerList.filter((provider) => { return !(provider.config.isVM || provider.config.isInjected) }))

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

  const isL2 = (providerDisplayName: string) => providerDisplayName && (providerDisplayName.startsWith('L2 - Optimism') || providerDisplayName.startsWith('L2 - Arbitrum'))

  const intl = useIntl()
  const isSaveEvmStateChecked = props.config.get('settings/save-evm-state')

  const forkStatePrompt = (defaultName: string) => {
    return (
      <div data-id="forkVmStateModal">
        <ul className='ml-3'>
          <li><FormattedMessage id="udapp.forkVmStateDesc1"/></li>
          <li><FormattedMessage id="udapp.forkVmStateDesc2"/></li>
        </ul>
        <label id="stateName" className="form-check-label" style={{ fontWeight: 'bolder' }}>
          <FormattedMessage id="udapp.forkStateLabel" />
        </label>
        <input
          type="text"
          data-id="modalDialogForkState"
          defaultValue={defaultName}
          className="form-control"
          onChange={(e) => vmStateName.current = e.target.value}
        />
      </div>
    )
  }

  const deleteVmStatePrompt = () => {
    return (
      <div data-id="deleteVmStateModal">
        <ul className='ml-3'>
          <li><FormattedMessage id="udapp.resetVmStateDesc1"/></li>
          <li><FormattedMessage id="udapp.resetVmStateDesc2"/></li>
        </ul>
        <FormattedMessage id="udapp.resetVmStateDesc3"/>
      </div>
    )
  }

  const forkState = async () => {
    _paq.push(['trackEvent', 'udapp', 'forkState', `forkState clicked`])
    let context = currentProvider.name
    context = context.replace('vm-fs-', '')

    let currentStateDb
    try {
      currentStateDb = JSON.parse(await props.runTabPlugin.blockchain.executionContext.getStateDetails())
    } catch (e) {
      props.runTabPlugin.call('notification', 'toast', `State not available to fork. ${e.message}`)
      return
    }

    if (Object.keys(currentStateDb.db).length === 0) {
      props.runTabPlugin.call('notification', 'toast', `State not available to fork, as no transactions have been made for selected environment & selected workspace.`)
      return
    }

    vmStateName.current = `${context}_${Date.now()}`
    props.modal(
      intl.formatMessage({ id: 'udapp.forkStateTitle' }),
      forkStatePrompt(vmStateName.current),
      intl.formatMessage({ id: 'udapp.fork' }),
      async () => {
        currentStateDb.stateName = vmStateName.current
        currentStateDb.forkName = currentProvider.config.fork
        currentStateDb.nodeUrl = currentProvider.config.nodeUrl
        currentStateDb.savingTimestamp = Date.now()
        await props.runTabPlugin.call('fileManager', 'writeFile', `.states/forked_states/${vmStateName.current}.json`, JSON.stringify(currentStateDb, null, 2))
        props.runTabPlugin.emit('vmStateForked', vmStateName.current)

        // we also need to copy the pinned contracts:
        if (await props.runTabPlugin.call('fileManager', 'exists', `.deploys/pinned-contracts/${currentProvider.name}`)) {
          const files = await props.runTabPlugin.call('fileManager', 'readdir', `.deploys/pinned-contracts/${currentProvider.name}`)
          if (files && Object.keys(files).length) {
            await props.runTabPlugin.call('fileManager', 'copyDir', `.deploys/pinned-contracts/${currentProvider.name}`, `.deploys/pinned-contracts`, 'vm-fs-' + vmStateName.current)
          }
        }
        _paq.push(['trackEvent', 'udapp', 'forkState', `forked from ${context}`])
      },
      intl.formatMessage({ id: 'udapp.cancel' }),
      () => {}
    )
  }

  const resetVmState = async() => {
    _paq.push(['trackEvent', 'udapp', 'deleteState', `deleteState clicked`])
    const context = currentProvider.name
    const contextExists = await props.runTabPlugin.call('fileManager', 'exists', `.states/${context}/state.json`)
    if (contextExists) {
      props.modal(
        intl.formatMessage({ id: 'udapp.resetVmStateTitle' }),
        deleteVmStatePrompt(),
        intl.formatMessage({ id: 'udapp.reset' }),
        async () => {
          const currentProvider = await props.runTabPlugin.call('blockchain', 'getCurrentProvider')
          // Reset environment blocks and account data
          await currentProvider.resetEnvironment()
          // Remove deployed and pinned contracts from UI
          await props.runTabPlugin.call('udapp', 'clearAllInstances')
          // Delete environment state file
          await props.runTabPlugin.call('fileManager', 'remove', `.states/${context}/state.json`)
          // If there are pinned contracts, delete pinned contracts folder
          const isPinnedContracts = await props.runTabPlugin.call('fileManager', 'exists', `.deploys/pinned-contracts/${context}`)
          if (isPinnedContracts) await props.runTabPlugin.call('fileManager', 'remove', `.deploys/pinned-contracts/${context}`)
          props.runTabPlugin.call('notification', 'toast', `VM state reset successfully.`)
          _paq.push(['trackEvent', 'udapp', 'deleteState', `VM state reset`])
        },
        intl.formatMessage({ id: 'udapp.cancel' }),
        null
      )
    } else props.runTabPlugin.call('notification', 'toast', `State not available to reset, as no transactions have been made for selected environment & selected workspace.`)
  }

  return (
    <div className="udapp_crow">
      <label id="selectExEnv" className="udapp_settingsLabel w-100">
        <FormattedMessage id="udapp.environment" />
        <CustomTooltip placement={'auto-end'} tooltipClasses="text-nowrap" tooltipId="info-recorder" tooltipText={<FormattedMessage id="udapp.tooltipText2" />}>
          <a href="https://chainlist.org/" target="_blank">
            <i className='udapp_infoDeployAction ml-2 fas fa-plug' aria-hidden="true"></i>
          </a>
        </CustomTooltip>
        { currentProvider && currentProvider.config.isVM && isSaveEvmStateChecked && <CustomTooltip placement={'auto-end'} tooltipClasses="text-wrap" tooltipId="forkStatetooltip" tooltipText={<FormattedMessage id="udapp.forkStateTitle" />}>
          <i className="udapp_infoDeployAction ml-2 fas fa-code-branch" style={{ cursor: 'pointer' }} onClick={forkState} data-id="fork-state-icon"></i>
        </CustomTooltip> }
        { currentProvider && currentProvider.config.isVM && isSaveEvmStateChecked && !currentProvider.config.isVMStateForked && !currentProvider.config.isRpcForkedState && <CustomTooltip placement={'auto-end'} tooltipClasses="text-wrap" tooltipId="deleteVMStatetooltip" tooltipText={<FormattedMessage id="udapp.resetVmStateTitle" />}>
          <span onClick={resetVmState} style={{ cursor: 'pointer', float: 'right', textTransform: 'none' }}>
            <i className="udapp_infoDeployAction ml-2 fas fa-rotate-right" data-id="delete-state-icon"></i>
            <span className="ml-1" style = {{ textTransform: 'none', fontSize: '13px' }}>Reset State</span>
          </span>
        </CustomTooltip> }
      </label>
      <div className="udapp_environment" data-id={`selected-provider-${currentProvider && currentProvider.name}`}>
        <Dropdown id="selectExEnvOptions" data-id="settingsSelectEnvOptions" className="udapp_selectExEnvOptions">
          <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components" className="btn btn-light btn-block w-100 d-inline-block border border-dark form-control" icon={null}>
            {/* {isL2(currentProvider && currentProvider.displayName)} */}
            <DropdownLabel label={currentProvider && currentProvider.displayName} bridges={bridges} currentProvider={currentProvider} envLabel={props.envLabel} runTabState={props.udappState} setExecutionEnv={props.setExecutionContext} isL2={isL2} plugin={props.runTabPlugin} />
          </Dropdown.Toggle>
          <Dropdown.Menu as={CustomMenu} className="w-100 custom-dropdown-items" data-id="custom-dropdown-items">
            {props.providers.providerList.length === 0 && <Dropdown.Item>
              <span className="">
                No provider pinned
              </span>
            </Dropdown.Item>}
            { (props.providers.providerList.filter((provider) => { return provider.config.isInjected })).map(({ name, displayName }) => (
              <Dropdown.Item
                key={name}
                onClick={async () => {
                  handleChangeExEnv(name)
                }}
                data-id={`dropdown-item-${name}`}
              >
                <span className="">
                  {displayName}
                </span>
              </Dropdown.Item>
            ))}
            { props.providers.providerList.filter((provider) => { return provider.config.isInjected }).length !== 0 && <Dropdown.Divider className='border-secondary'></Dropdown.Divider> }
            { (props.providers.providerList.filter((provider) => { return provider.config.isVM })).map(({ displayName, name }) => (
              <Dropdown.Item
                key={name}
                onClick={() => {
                  handleChangeExEnv(name)
                }}
                data-id={`dropdown-item-${name}`}
              >
                <span className="">
                  {displayName}
                </span>
              </Dropdown.Item>
            ))}
            { props.providers.providerList.filter((provider) => { return provider.config.isVM }).length !== 0 && <Dropdown.Divider className='border-secondary'></Dropdown.Divider> }
            { (props.providers.providerList.filter((provider) => { return !(provider.config.isVM || provider.config.isInjected) })).map(({ displayName, name }) => (
              <Dropdown.Item
                key={name}
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
            <Dropdown.Divider className='border-secondary'></Dropdown.Divider>
            <Dropdown.Item
              key={10000}
              onClick={() => {
                props.setExecutionContext({ context: 'item-another-chain' })
              }}
              data-id={`dropdown-item-another-chain`}
            >
              <span className="">
                Customize this list...
              </span>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  )
}
