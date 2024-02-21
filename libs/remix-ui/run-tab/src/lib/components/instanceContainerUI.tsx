// eslint-disable-next-line no-use-before-define
import { CustomTooltip } from '@remix-ui/helper'
import React, {useEffect} from 'react'
import { FormattedMessage } from 'react-intl'
import { InstanceContainerProps } from '../types'
import { UniversalDappUI } from './universalDappUI'

export function InstanceContainerUI(props: InstanceContainerProps) {
  const { instanceList } = props.instances

  useEffect(() => {
    const fetchSavedContracts = async () => {
      const allSavedContracts = localStorage.getItem('savedContracts')
      if (allSavedContracts) {
        const savedContracts = JSON.parse(allSavedContracts)
        const { network } = await props.plugin.call('blockchain', 'getCurrentNetworkStatus')
        if (network.id === ' - ') network.id = network.id.trim() // For VM, id is ' - '
        const env = await props.plugin.call('blockchain', 'getProvider')
        if (savedContracts[env] && savedContracts[env][network.id]) {
          const instances = savedContracts[env][network.id]
          for (const inst of instances)
            if (inst) await props.plugin.call('udapp', 'addSavedInstance', inst.address, inst.contractData.abi, inst.name)
        }
      }
    }
    fetchSavedContracts()
  }, [props.plugin.REACT_API.networkName])

  const clearInstance = () => {
    props.clearInstances()
  }

  return (
    <div className="udapp_instanceContainer mt-3 border-0 list-group-item">
      <div className="d-flex justify-content-between align-items-center pl-2 mb-2">
        <CustomTooltip placement="top-start" tooltipClasses="text-nowrap" tooltipId="deployAndRunClearInstancesTooltip" tooltipText={<FormattedMessage id="udapp.tooltipText6" />}>
          <label className="udapp_deployedContracts">
            <FormattedMessage id="udapp.savedContracts" />
          </label>
        </CustomTooltip>
      </div>
      {props.savedInstances.instanceList.length > 0 ? (
        <div>
          {' '}
          {props.savedInstances.instanceList.map((instance, index) => {
            return (
              <UniversalDappUI
                key={index}
                instance={instance}
                isSavedContract={true}
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
              />
            )
          })}
        </div>
      ) : (
        <span className="mx-2 mt-3 alert alert-warning" data-id="NoSavedInstanceText" role="alert">
          <FormattedMessage id="udapp.NoSavedInstanceText" />
        </span>
      )}

      <div className="d-flex justify-content-between align-items-center pl-2 mb-2 mt-3">
        <CustomTooltip placement="top-start" tooltipClasses="text-nowrap" tooltipId="deployAndRunClearInstancesTooltip" tooltipText={<FormattedMessage id="udapp.tooltipText6" />}>
          <label className="udapp_deployedContracts">
            <FormattedMessage id="udapp.deployedContracts" />
          </label>
        </CustomTooltip>
        {instanceList.length > 0 ? (
          <CustomTooltip
            placement="right"
            tooltipClasses="text-nowrap"
            tooltipId="deployAndRunClearInstancesTooltip"
            tooltipText={<FormattedMessage id="udapp.deployAndRunClearInstances" />}
          >
            <i className="mr-1 udapp_icon far fa-trash-alt" data-id="deployAndRunClearInstances" onClick={clearInstance} aria-hidden="true"></i>
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
                isSavedContract={false}
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
              />
            )
          })}
        </div>
      ) : (
        <span className="mx-2 mt-3 alert alert-warning" data-id="deployAndRunNoInstanceText" role="alert">
          <FormattedMessage id="udapp.deployAndRunNoInstanceText" />
        </span>
      )}
    </div>
  )
}
