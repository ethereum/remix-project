// eslint-disable-next-line no-use-before-define
import React, { Fragment, useEffect, useReducer, useState } from 'react'
import { ModalDialog } from '@remix-ui/modal-dialog'
// eslint-disable-next-line no-unused-vars
import { Toaster } from '@remix-ui/toaster'
import { ContractDropdownUI } from './components/contractDropdownUI'
import { InstanceContainerUI } from './components/instanceContainerUI'
import { RecorderUI } from './components/recorderCardUI'
import { SettingsUI } from './components/settingsUI'
import { ContractData, Modal, RunTabProps } from './types'
import { runTabInitialState, runTabReducer } from './reducers/runTab'
import {
  initRunTab, setAccount,
  setUnit, setGasFee,
  setExecutionContext, setWeb3Endpoint,
  clearPopUp, createNewBlockchainAccount,
  setPassphrasePrompt, setMatchPassphrasePrompt,
  signMessageWithAddress, getSelectedContract,
  createInstance, setCheckIpfs,
  updateBaseFeePerGas, updateConfirmSettings,
  updateGasPrice, updateGasPriceStatus,
  updateMaxFee, updateMaxPriorityFee,
  updateTxFeeContent
} from './actions'
import './css/run-tab.css'
import { PublishToStorage } from '@remix-ui/publish-to-storage'

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

  return (
    <Fragment>
      <div className="udapp_runTabView run-tab" id="runTabView" data-id="runTabView">
        <div className="list-group list-group-flush">
          <SettingsUI
            networkName={runTab.networkName}
            personalMode={runTab.personalMode}
            selectExEnv={runTab.selectExEnv}
            externalEndpoint={runTab.externalEndpoint}
            setWeb3Endpoint={setWeb3Endpoint}
            accounts={runTab.accounts}
            setAccount={setAccount}
            setUnit={setUnit}
            sendValue={runTab.sendValue}
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
            updateBaseFeePerGas={updateBaseFeePerGas}
            updateConfirmSettings={updateConfirmSettings}
            updateGasPrice={updateGasPrice}
            updateGasPriceStatus={updateGasPriceStatus}
            updateMaxFee={updateMaxFee}
            updateMaxPriorityFee={updateMaxPriorityFee}
            updateTxFeeContent={updateTxFeeContent}
            txFeeContent={runTab.txFeeContent}
            maxFee={runTab.maxFee}
            maxPriorityFee={runTab.maxPriorityFee}
          />
          <RecorderUI />
          <InstanceContainerUI />
        </div>
      </div>
      <ModalDialog id='fileSystem' { ...focusModal } handleHide={ handleHideModal } />
      <Toaster message={focusToaster} handleHide={handleToaster} />
      <PublishToStorage api={props.plugin} resetStorage={resetStorage} storage={publishData.storage} contract={publishData.contract} />
    </Fragment>
  )
}
