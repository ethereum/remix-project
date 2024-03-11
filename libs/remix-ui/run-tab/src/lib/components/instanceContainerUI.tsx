// eslint-disable-next-line no-use-before-define
import { CustomTooltip } from '@remix-ui/helper'
import React, {useEffect, useRef} from 'react'
import { FormattedMessage } from 'react-intl'
import { InstanceContainerProps } from '../types'
import { UniversalDappUI } from './universalDappUI'

export function InstanceContainerUI(props: InstanceContainerProps) {
  const { instanceList } = props.instances
  const enableSave = useRef(false)
  const chainId = useRef()

  useEffect(() => {
    const fetchSavedContracts = async () => {
      if (props.plugin.REACT_API.selectExEnv && props.plugin.REACT_API.selectExEnv.startsWith('vm-')) enableSave.current = false
      else enableSave.current = true
      if (enableSave.current) {
        const { network } = await props.plugin.call('blockchain', 'getCurrentNetworkStatus')
        chainId.current = network.id
        // Move contract saved in localstorage to Remix FE
        const allSavedContracts = localStorage.getItem('savedContracts')
        if (allSavedContracts) {
          const savedContracts = JSON.parse(allSavedContracts)
          for (const networkId in savedContracts) {
            if (savedContracts[networkId].length > 0) {
              for (const contractDetails of savedContracts[networkId]) {
                const objToSave = {
                  name: contractDetails.name,
                  address: contractDetails.address,
                  abi: contractDetails.abi || contractDetails.contractData.abi,
                  filePath: contractDetails.filePath,
                  pinnedAt: contractDetails.savedOn
                }
                await props.plugin.call('fileManager', 'writeFile', `.deploys/pinned-contracts/${networkId}/${contractDetails.address}.json`, JSON.stringify(objToSave, null, 2))
              }
            }
          }
          localStorage.removeItem('savedContracts')
        }
        // Clear existing saved instance state
        await props.plugin.call('udapp', 'clearAllSavedInstances')
        // Load contracts from FE
        const isPinnedAvailable = await props.plugin.call('fileManager', 'exists', `.deploys/pinned-contracts/${chainId.current}`)
        if (isPinnedAvailable) {
          const list = await props.plugin.call('fileManager', 'readdir', `.deploys/pinned-contracts/${chainId.current}`)
          const filePaths = Object.keys(list)
          for (const file of filePaths) {
            const pinnedContract = await props.plugin.call('fileManager', 'readFile', file)
            const pinnedContractObj = JSON.parse(pinnedContract)
            if (pinnedContractObj) await props.plugin.call('udapp', 'addSavedInstance', pinnedContractObj.address, pinnedContractObj.abi, pinnedContractObj.name, pinnedContractObj.pinnedAt, pinnedContractObj.filePath)
          }
        }
      }
    }
    fetchSavedContracts()
  }, [props.plugin.REACT_API.selectExEnv, props.plugin.REACT_API.networkName])

  const clearInstance = () => {
    props.clearInstances()
  }

  return (
    <div className="udapp_instanceContainer mt-3 border-0 list-group-item">
      { enableSave.current ? (
        <div className="d-flex justify-content-between align-items-center pl-2">
          <CustomTooltip placement="top-start" tooltipClasses="text-nowrap" tooltipId="deployAndRunPinnedContractsTooltip" tooltipText={<FormattedMessage id="udapp.tooltipTextPinnedContracts" />}>
            <label className="udapp_deployedContracts">
              <FormattedMessage id="udapp.savedContracts" /> 
              <span style={{fontSize: '0.75rem'}}> (chain id: {chainId.current})</span>
            </label>
          </CustomTooltip>
        </div>) : null }
      { enableSave.current ? (
        props.savedInstances.instanceList.length > 0 ? (
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
          <span className="mx-2 mt-2 text-dark" data-id="NoSavedInstanceText">
            <FormattedMessage id="udapp.NoSavedInstanceText" />
          </span>
        )
      ) :  null }

      <div className="d-flex justify-content-between align-items-center pl-2 mb-2 mt-2">
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
