// eslint-disable-next-line no-use-before-define
import { CustomTooltip } from '@remix-ui/helper'
import React, { useEffect, useRef } from 'react'
import { FormattedMessage } from 'react-intl'
import { InstanceContainerProps } from '../types'
import { UniversalDappUI } from './universalDappUI'

export function InstanceContainerUI(props: InstanceContainerProps) {
  const { instanceList } = props.instances

  const clearInstance = () => {
    props.clearInstances()
  }

  return (
    <div className="udapp_instanceContainer mt-3 border-0 list-group-item">
      <div className="d-flex justify-content-between align-items-center pl-2">
        <CustomTooltip placement="top-start" tooltipClasses="text-nowrap" tooltipId="deployAndRunPinnedContractsTooltip" tooltipText={<FormattedMessage id="udapp.tooltipTextPinnedContracts" />}>
          <label className="udapp_deployedContracts" data-id="pinnedContracts">
            <FormattedMessage id="udapp.pinnedContracts" />
            <span style={{ fontSize: '0.75rem' }} data-id="pinnedContractsSublabel"> (network: {props.plugin.REACT_API.chainId}) </span>
          </label>
        </CustomTooltip>
      </div>

      {props.pinnedInstances.instanceList.length > 0 ? (
        <div>
          {' '}
          {props.pinnedInstances.instanceList.map((instance, index) => {
            return (
              <UniversalDappUI
                key={index}
                instance={instance}
                isPinnedContract={true}
                context={props.getContext()}
                removeInstance={props.removeInstance}
                index={index}
                gasEstimationPrompt={props.gasEstimationPrompt}
                passphrasePrompt={props.passphrasePrompt}
                mainnetPrompt={props.mainnetPrompt}
                runTransactions={props.runTransactions}
                sendValue={props.sendValue}
                getFuncABIInputs={props.getFuncABIInputs}
                plugin={props.plugin}
                exEnvironment={props.exEnvironment}
                editInstance={props.editInstance}
                solcVersion={props.solcVersion}
                getVersion={props.getVersion}
              />
            )
          })}
        </div>
      ) : (
        <span className="mx-2 mt-3 alert alert-secondary" data-id="NoPinnedInstanceText">
          <FormattedMessage id="udapp.NoPinnedInstanceText" />
        </span>
      )}

      <div className="d-flex justify-content-between align-items-center pl-2 mb-2 mt-2">
        <CustomTooltip placement="top-start" tooltipClasses="text-nowrap" tooltipId="deployAndRunClearInstancesTooltip" tooltipText={<FormattedMessage id="udapp.tooltipText6" />}>
          <label className="udapp_deployedContracts" data-id="unpinnedContracts">
            <FormattedMessage id="udapp.deployedContracts" />
          </label>
        </CustomTooltip>
        {instanceList.length > 0 ? (
          <CustomTooltip
            placement={'auto-end'}
            tooltipClasses="text-nowrap"
            tooltipId="deployAndRunClearInstancesTooltip"
            tooltipText={<FormattedMessage id="udapp.deployAndRunClearInstances" />}
          >
            <i className="mr-1 p-2 udapp_icon far fa-trash-alt" data-id="deployAndRunClearInstances" onClick={clearInstance} aria-hidden="true"></i>
          </CustomTooltip>
        ) : null}
      </div>
      {instanceList.length > 0 ? (
        <div>
          {' '}
          {props.instances.instanceList.map((instance, index) => {
            return (
              <UniversalDappUI
                key={index}
                instance={instance}
                isPinnedContract={false}
                context={props.getContext()}
                removeInstance={props.removeInstance}
                index={index}
                gasEstimationPrompt={props.gasEstimationPrompt}
                passphrasePrompt={props.passphrasePrompt}
                mainnetPrompt={props.mainnetPrompt}
                runTransactions={props.runTransactions}
                sendValue={props.sendValue}
                getFuncABIInputs={props.getFuncABIInputs}
                plugin={props.plugin}
                exEnvironment={props.exEnvironment}
                editInstance={props.editInstance}
                solcVersion={props.solcVersion}
                getVersion={props.getVersion}
              />
            )
          })}
        </div>
      ) : (
        <span className="mx-2 mt-3 alert alert-secondary" data-id="deployAndRunNoInstanceText" role="alert">
          <FormattedMessage id="udapp.deployAndRunNoInstanceText" />
        </span>
      )}
    </div>
  )
}
