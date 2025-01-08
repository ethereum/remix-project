// eslint-disable-next-line no-use-before-define
import React, { useRef } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { EnvironmentProps, Provider } from '../types'
import { Dropdown } from 'react-bootstrap'
import { CustomMenu, CustomToggle, CustomTooltip } from '@remix-ui/helper'
import EnvironmentDropdown from './EnvironmentDropdown'
const _paq = (window._paq = window._paq || [])

export function EnvironmentUI(props: EnvironmentProps) {
  const vmStateName = useRef('')

  Object.entries(props.providers.providerList.filter((provider) => { return provider.isVM }))
  Object.entries(props.providers.providerList.filter((provider) => { return provider.isInjected }))
  Object.entries(props.providers.providerList.filter((provider) => { return !(provider.isVM || provider.isInjected) }))

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

  const intl = useIntl()
  const isSaveEvmStateChecked = props.config.get('settings/save-evm-state')

  const forkStatePrompt = (defaultName: string) => {
    return (
      <div data-id="forkVmStateModal">
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
          <li><FormattedMessage id="udapp.deleteVmStateDesc1"/></li>
          <li><FormattedMessage id="udapp.deleteVmStateDesc2"/></li>
        </ul>
        <FormattedMessage id="udapp.deleteVmStateDesc3"/>
      </div>
    )
  }

  const forkState = async () => {
    _paq.push(['trackEvent', 'udapp', 'forkState', `forkState clicked`])
    const context = currentProvider.name
    vmStateName.current = `${context}_${Date.now()}`
    const contextExists = await props.runTabPlugin.call('fileManager', 'exists', `.states/${context}/state.json`)
    if (contextExists) {
      props.modal(
        intl.formatMessage({ id: 'udapp.forkStateTitle' }),
        forkStatePrompt(vmStateName.current),
        intl.formatMessage({ id: 'udapp.fork' }),
        async () => {
          let currentStateDb = await props.runTabPlugin.call('fileManager', 'readFile', `.states/${context}/state.json`)
          currentStateDb = JSON.parse(currentStateDb)
          currentStateDb.stateName = vmStateName.current
          currentStateDb.forkName = currentProvider.fork
          currentStateDb.savingTimestamp = Date.now()
          await props.runTabPlugin.call('fileManager', 'writeFile', `.states/forked_states/${vmStateName.current}.json`, JSON.stringify(currentStateDb, null, 2))
          props.runTabPlugin.emit('vmStateForked', vmStateName.current)
          _paq.push(['trackEvent', 'udapp', 'forkState', `forked from ${context}`])
        },
        intl.formatMessage({ id: 'udapp.cancel' }),
        null
      )
    } else props.runTabPlugin.call('notification', 'toast', `State not available to fork, as no transactions have been made for selected environment & selected workspace.`)
  }

  const deleteVmState = async() => {
    _paq.push(['trackEvent', 'udapp', 'deleteState', `deleteState clicked`])
    const context = currentProvider.name
    const contextExists = await props.runTabPlugin.call('fileManager', 'exists', `.states/${context}/state.json`)
    if (contextExists) {
      props.modal(
        intl.formatMessage({ id: 'udapp.deleteVmStateTitle' }),
        deleteVmStatePrompt(),
        intl.formatMessage({ id: 'udapp.delete' }),
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
          props.runTabPlugin.call('notification', 'toast', `VM state deleted successfully.`)
          _paq.push(['trackEvent', 'udapp', 'deleteState', `VM state deleted`])
        },
        intl.formatMessage({ id: 'udapp.cancel' }),
        null
      )
    } else props.runTabPlugin.call('notification', 'toast', `State not available to delete, as no transactions have been made for selected environment & selected workspace.`)
  }

  const isL2 = (providerDisplayName: string) => providerDisplayName && (providerDisplayName.startsWith('L2 - Optimism') || providerDisplayName.startsWith('L2 - Arbitrum'))
  return (
    <div className="udapp_crow">
      <label id="selectExEnv" className="udapp_settingsLabel">
        <FormattedMessage id="udapp.environment" />
        <CustomTooltip placement={'auto-end'} tooltipClasses="text-nowrap" tooltipId="info-recorder" tooltipText={<FormattedMessage id="udapp.tooltipText2" />}>
          <a href="https://chainlist.org/" target="_blank">
            <i className={'ml-2 fas fa-plug'} aria-hidden="true"></i>
          </a>
        </CustomTooltip>
        <CustomTooltip placement={'auto-end'} tooltipClasses="text-wrap" tooltipId="runAndDeployAddresstooltip" tooltipText={<FormattedMessage id="udapp.environmentDocs" />}>
          <a href="https://remix-ide.readthedocs.io/en/latest/run.html#environment" target="_blank" rel="noreferrer">
            <i className="udapp_infoDeployAction ml-2 fas fa-info"></i>
          </a>
        </CustomTooltip>
        { currentProvider && currentProvider.isVM && isSaveEvmStateChecked && <CustomTooltip placement={'auto-end'} tooltipClasses="text-wrap" tooltipId="forkStatetooltip" tooltipText={<FormattedMessage id="udapp.forkStateTitle" />}>
          <i className="udapp_infoDeployAction ml-2 fas fa-code-branch" style={{ cursor: 'pointer' }} onClick={forkState} data-id="fork-state-icon"></i>
        </CustomTooltip> }
        { currentProvider && currentProvider.isVM && isSaveEvmStateChecked && <CustomTooltip placement={'auto-end'} tooltipClasses="text-wrap" tooltipId="deleteVMStatetooltip" tooltipText={<FormattedMessage id="udapp.deleteVmStateTitle" />}>
          <i className="udapp_infoDeployAction ml-2 fas fa-trash" style={{ cursor: 'pointer' }} onClick={deleteVmState} data-id="delete-state-icon"></i>
        </CustomTooltip> }
      </label>
      <div className="udapp_environment" data-id={`selected-provider-${currentProvider && currentProvider.name}`}>
        <EnvironmentDropdown currentProvider={currentProvider} isL2={isL2} bridges={bridges} handleChangeExEnv={handleChangeExEnv} props={props} />
      </div>
    </div>
  )
}
