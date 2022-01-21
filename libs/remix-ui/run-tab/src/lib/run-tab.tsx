// eslint-disable-next-line no-use-before-define
import React, { Fragment, useEffect, useReducer, useState } from 'react'
import { ModalDialog } from '@remix-ui/modal-dialog'
// eslint-disable-next-line no-unused-vars
import { Toaster } from '@remix-ui/toaster'
import { ContractDropdownUI } from './components/contractDropdownUI'
import { InstanceContainerUI } from './components/instanceContainerUI'
import { RecorderUI } from './components/recorderCardUI'
import { SettingsUI } from './components/settingsUI'
import { ContractData, Modal, Network, RunTabProps, Tx } from './types'
import { runTabInitialState, runTabReducer } from './reducers/runTab'
import {
  initRunTab, setAccount,
  setUnit, setGasFee,
  setExecutionContext, setWeb3Endpoint,
  clearPopUp, createNewBlockchainAccount,
  setPassphrasePrompt, setMatchPassphrasePrompt,
  signMessageWithAddress, getSelectedContract,
  createInstance, setSendTransactionValue,
  updateBaseFeePerGas, updateConfirmSettings,
  updateGasPrice, updateGasPriceStatus,
  updateMaxFee, updateMaxPriorityFee,
  updateTxFeeContent, clearInstances,
  removeInstance, getContext,
  runTransactions, loadAddress,
  storeScenario, runCurrentScenario,
  updateScenarioPath, initWebDialogs,
  getFuncABIInputs, setNetworkNameFromProvider
} from './actions'
import './css/run-tab.css'
import { PublishToStorage } from '@remix-ui/publish-to-storage'
import { PassphrasePrompt } from './components/passphrase'
import { MainnetPrompt } from './components/mainnet'
import { ScenarioPrompt } from './components/scenario'
import { Web3ProviderDialog } from './components/web3Dialog'
import { setIpfsCheckedState } from './actions/payload'

export function RunTabUI (props: RunTabProps) {
  const { plugin } = props
  const [focusModal, setFocusModal] = useState<Modal>({
    hide: true,
    title: '',
    message: '',
    okLabel: '',
    okFn: () => {},
    cancelLabel: '',
    cancelFn: () => {}
  })
  const [modals, setModals] = useState<Modal[]>([])
  const [focusToaster, setFocusToaster] = useState<string>('')
  const [toasters, setToasters] = useState<string[]>([])
  const [publishData, setPublishData] = useState<{
    storage: 'ipfs' | 'swarm',
    contract: ContractData
  }>({
    storage: null,
    contract: null
  })
  const [runTab, dispatch] = useReducer(runTabReducer, runTabInitialState)
  const REACT_API = { runTab }

  useEffect(() => {
    initRunTab(plugin)(dispatch)
    initWebDialogs(envChangeNotification, web3Dialog)(dispatch)
  }, [plugin])

  useEffect(() => {
    plugin.onReady(runTab)
  }, [REACT_API])

  useEffect(() => {
    if (modals.length > 0) {
      setFocusModal(() => {
        const focusModal = {
          hide: false,
          title: modals[0].title,
          message: modals[0].message,
          okLabel: modals[0].okLabel,
          okFn: modals[0].okFn,
          cancelLabel: modals[0].cancelLabel,
          cancelFn: modals[0].cancelFn
        }
        return focusModal
      })
      const modalList = modals.slice()

      modalList.shift()
      setModals(modalList)
    }
  }, [modals])

  useEffect(() => {
    if (runTab.notification.title) {
      modal(runTab.notification.title, runTab.notification.message, runTab.notification.labelOk, runTab.notification.actionOk, runTab.notification.labelCancel, runTab.notification.actionCancel)
    }
  }, [runTab.notification])

  useEffect(() => {
    if (toasters.length > 0) {
      setFocusToaster(() => {
        return toasters[0]
      })
      const toasterList = toasters.slice()

      toasterList.shift()
      setToasters(toasterList)
    }
  }, [toasters])

  useEffect(() => {
    if (runTab.popup) {
      toast(runTab.popup)
    }
  }, [runTab.popup])

  const setCheckIpfs = (value: boolean) => {
    dispatch(setIpfsCheckedState(value))
  }

  const modal = (title: string, message: string | JSX.Element, okLabel: string, okFn: () => void, cancelLabel?: string, cancelFn?: () => void) => {
    setModals(modals => {
      modals.push({ message, title, okLabel, okFn, cancelLabel, cancelFn })
      return [...modals]
    })
  }

  const handleHideModal = () => {
    setFocusModal(modal => {
      return { ...modal, hide: true, message: null }
    })
  }

  const handleToaster = () => {
    setFocusToaster('')
    clearPopUp()
  }

  const toast = (toasterMsg: string) => {
    setToasters(messages => {
      messages.push(toasterMsg)
      return [...messages]
    })
  }

  const resetStorage = () => {
    setPublishData({
      storage: null,
      contract: null
    })
  }

  const publishToStorage = (storage: 'ipfs' | 'swarm', contract: ContractData) => {
    setPublishData({
      storage,
      contract
    })
  }

  const gasEstimationPrompt = (msg: string) => {
    return (
      <div>Gas estimation errored with the following message (see below). The transaction execution will likely fail. Do you want to force sending? <br />
        {msg}
      </div>
    )
  }

  const logBuilder = (msg: string) => {
    return <pre>{msg}</pre>
  }

  const passphrasePrompt = (message: string) => {
    return <PassphrasePrompt message={message} setPassphrase={setPassphrasePrompt} defaultValue={runTab.passphrase} />
  }

  const scenarioPrompt = (message: string, defaultValue) => {
    return <ScenarioPrompt message={message} setScenarioPath={updateScenarioPath} defaultValue={defaultValue} />
  }

  const mainnetPrompt = (tx: Tx, network: Network, amount: string, gasEstimation: string, gasFees: (maxFee: string, cb: (txFeeText: string, priceStatus: boolean) => void) => void, determineGasPrice: (cb: (txFeeText: string, gasPriceValue: string, gasPriceStatus: boolean) => void) => void) => {
    return <MainnetPrompt
      init={determineGasPrice}
      network={network}
      tx={tx}
      amount={amount}
      gasEstimation={gasEstimation}
      setNewGasPrice={gasFees}
      updateBaseFeePerGas={updateBaseFeePerGas}
      updateConfirmSettings={updateConfirmSettings}
      updateGasPrice={updateGasPrice}
      updateGasPriceStatus={updateGasPriceStatus}
      updateMaxFee={updateMaxFee}
      updateMaxPriorityFee={updateMaxPriorityFee}
      setTxFeeContent={updateTxFeeContent}
      txFeeContent={runTab.txFeeContent}
      maxFee={runTab.maxFee}
      maxPriorityFee={runTab.maxPriorityFee}
    />
  }

  const envChangeNotification = (env: { context: string, fork: string }, from: string) => {
    return (
      <div>
        <i className="fas fa-exclamation-triangle text-danger mr-1"></i>
        <span>
          {from}
          <span className="font-weight-bold text-warning">
            is changing your environment to
          </span> {env && env.context}
        </span>
      </div>
    )
  }

  const web3Dialog = () => {
    return <Web3ProviderDialog externalEndpoint={runTab.externalEndpoint} setWeb3Endpoint={setWeb3Endpoint} />
  }

  return (
    <Fragment>
      <div className="udapp_runTabView run-tab" id="runTabView" data-id="runTabView">
        <div className="list-group list-group-flush">
          <SettingsUI
            networkName={runTab.networkName}
            personalMode={runTab.personalMode}
            selectExEnv={runTab.selectExEnv}
            setWeb3Endpoint={setWeb3Endpoint}
            accounts={runTab.accounts}
            setAccount={setAccount}
            setUnit={setUnit}
            sendValue={runTab.sendValue}
            setSendValue={setSendTransactionValue}
            sendUnit={runTab.sendUnit}
            gasLimit={runTab.gasLimit}
            setGasFee={setGasFee}
            providers={runTab.providers}
            setExecutionContext={setExecutionContext}
            createNewBlockchainAccount={createNewBlockchainAccount}
            setPassphrase={setPassphrasePrompt}
            setMatchPassphrase={setMatchPassphrasePrompt}
            modal={modal}
            tooltip={toast}
            signMessageWithAddress={signMessageWithAddress}
            passphrase={runTab.passphrase}
            web3ProviderDialog={web3Dialog}
          />
          <ContractDropdownUI
            exEnvironment={runTab.selectExEnv}
            contracts={runTab.contracts}
            getSelectedContract={getSelectedContract}
            modal={modal}
            passphrase={runTab.passphrase}
            setPassphrase={setPassphrasePrompt}
            createInstance={createInstance}
            ipfsCheckedState={runTab.ipfsChecked}
            setIpfsCheckedState={setCheckIpfs}
            publishToStorage={publishToStorage}
            gasEstimationPrompt={gasEstimationPrompt}
            logBuilder={logBuilder}
            passphrasePrompt={passphrasePrompt}
            mainnetPrompt={mainnetPrompt}
            tooltip={toast}
            loadAddress={loadAddress}
            networkName={runTab.networkName}
            setNetworkName={setNetworkNameFromProvider}
          />
          <RecorderUI
            gasEstimationPrompt={gasEstimationPrompt}
            logBuilder={logBuilder}
            passphrasePrompt={passphrasePrompt}
            mainnetPrompt={mainnetPrompt}
            storeScenario={storeScenario}
            runCurrentScenario={runCurrentScenario}
            scenarioPrompt={scenarioPrompt}
            count={runTab.recorder.transactionCount}
          />
          <InstanceContainerUI
            instances={runTab.instances}
            clearInstances={clearInstances}
            removeInstance={removeInstance}
            getContext={getContext}
            gasEstimationPrompt={gasEstimationPrompt}
            logBuilder={logBuilder}
            passphrasePrompt={passphrasePrompt}
            mainnetPrompt={mainnetPrompt}
            runTransactions={runTransactions}
            sendValue={runTab.sendValue}
            getFuncABIInputs={getFuncABIInputs}
          />
        </div>
      </div>
      <ModalDialog id='udappNotify' { ...focusModal } handleHide={ handleHideModal } />
      <Toaster message={focusToaster} handleHide={handleToaster} />
      <PublishToStorage id='udapp' api={props.plugin} resetStorage={resetStorage} storage={publishData.storage} contract={publishData.contract} />
    </Fragment>
  )
}
