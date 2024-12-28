import { CustomTooltip } from '@remix-ui/helper'
import { FormattedMessage } from 'react-intl'
import { UniversalDappUI } from './UniversalDappUI'
import * as remixLib from '@remix-project/remix-lib'
import { Chain } from '../types'
import { AppContext } from '../AppContext'
import { useContext } from 'react'
import { clearInstancesAction } from '../actions'
const _paq = (window._paq = window._paq || [])

const txHelper = remixLib.execution.txHelper

// TODO: fill initial state with the pinned contracts.

const getFuncABIInputs = (funABI: any) => {
  if (!funABI.inputs) {
    return '';
  }
  return txHelper.inputParametersDeclarationToString(funABI.inputs);
};

export interface InstanceContainerUIProps {
  // TODO:
  //  runTransactions: (
  //   instanceIndex: number,
  //   lookupOnly: boolean,
  //   funcABI: FuncABI,
  //   inputsValues: string,
  //   contractName: string,
  //   contractABI, contract,
  //   address,
  //   logMsg:string,
  //   // mainnetPrompt: MainnetPrompt,
  //   gasEstimationPrompt: (msg: string) => JSX.Element,
  //   passphrasePrompt: (msg: string) => JSX.Element,
  //   funcIndex?: number) => void,
  // sendValue: string,
  // gasEstimationPrompt: (msg: string) => JSX.Element,
  // passphrasePrompt: (message: string) => JSX.Element,

  // mainnetPrompt: (tx: Tx, network: Network, amount: string, gasEstimation: string, gasFees: (maxFee: string, cb: (txFeeText: string, priceStatus: boolean) => void) => void, determineGasPrice: (cb: (txFeeText: string, gasPriceValue: string, gasPriceStatus: boolean) => void) => void) => JSX.Element,
  // getFuncABIInputs: (funcABI: FuncABI) => string

  // getCompilerDetails: () => Promise<CheckStatus>
  // runTabState: RunTabState
  // clearInstances: () => void,
  // removeInstance: (index: number) => void,
  // pinInstance: (index: number, pinnedAt: number) => void,
  // unpinInstance: (index: number) => void,

  evmCheckComplete?: boolean
  // instances: {
  //   instanceList: {
  //     // contractData?: ContractData,
  //     address: string,
  //     balance?: number,
  //     name: string,
  //     decodedResponse?: Record<number, any>,
  //     abi?: any,
  //     isPinned?: boolean,
  //     pinnedTimeStamp?: number
  //   }[],
  //   error: string
  // },
  chain: Chain,
  editInstance: (instance) => void,
  exEnvironment: string
  // plugin: ContractInteractionPluginClient
  solcVersion: { version: string, canReceive: boolean }
}


export function InstanceContainerUI(props: InstanceContainerUIProps) {
  const { appState, plugin } = useContext(AppContext);
  const contractInstances = appState.contractInstances;

  const clearInstances = async () => {

    // const isPinnedAvailable = await plugin.call('fileManager', 'exists', `.looked-up-contracts/pinned-contracts/${props.chain.chainId}`)
    // if (isPinnedAvailable) {
    //   await plugin.call('fileManager', 'remove', `.looked-up-contracts/pinned-contracts/${props.chain.chainId}`)
    //   _paq.push(['trackEvent', 'contractInteraction', 'pinnedContracts', 'clearInstance'])
    // }
    await clearInstancesAction()
  }

  return (
    <div className="udapp_instanceContainer mt-2 border-0 list-group-item">
      <div className="d-flex justify-content-between align-items-center p-2">
        <CustomTooltip placement="top-start" tooltipClasses="text-nowrap" tooltipId="userInterfacesForContractsTooltip" tooltipText={<FormattedMessage id="contractInteraction.userInterfacesForContracts" />}>
          <label className="udapp_deployedContracts text-nowrap" data-id="deployedContracts">
            <FormattedMessage id="contractInteraction.lookedupContracts" />
          </label>
        </CustomTooltip>
        <CustomTooltip placement="top-start" tooltipClasses="text-nowrap" tooltipId="numOfDeployedInstancesTooltip" tooltipText="Number of looked up contracts">
          <div className="badge badge-pill badge-primary text-center ml-2 mb-1" data-id="deployedContractsBadge">{contractInstances.length}</div>
        </CustomTooltip>
        <div className="w-100"></div>
        {contractInstances.length > 0 && (
          <CustomTooltip
            placement={'auto-end'}
            tooltipClasses="text-nowrap"
            tooltipId="clearContractInstancesTooltip"
            tooltipText={<FormattedMessage id="contractInteraction.clearContractInstances" />}
          >
            <i className="far fa-trash-alt udapp_icon mr-1 mb-2" data-id="clearContractInstances" onClick={clearInstances} aria-hidden="true"></i>
          </CustomTooltip>
        )}
      </div>

      {contractInstances.length > 0 && (
        <div>
          {' '}
          {contractInstances.map((instance, index) => {
            return (
              <UniversalDappUI
                key={index}
                instance={instance}
                // TODO
                // mainnetPrompt={props.mainnetPrompt}
                // runTransactions={props.runTransactions}
                // sendValue={props.sendValue}
                // gasEstimationPrompt={props.gasEstimationPrompt}
                // passphrasePrompt={props.passphrasePrompt}
                // context={getContext()}
                // pinInstance={props.pinInstance}
                // unpinInstance={props.unpinInstance}
                // removeInstance={props.removeInstance}
                // getVersion={props.getVersion}
                // getCompilerDetails={props.getCompilerDetails}
                // runTabState={props.runTabState}
                index={index}
                chain={props.chain}
                getFuncABIInputs={getFuncABIInputs}
                exEnvironment={props.exEnvironment}
                editInstance={props.editInstance}
                solcVersion={props.solcVersion}
                evmCheckComplete={props.evmCheckComplete}
              />
            )
          })}
        </div>
      )}

    </div>
  )
}
