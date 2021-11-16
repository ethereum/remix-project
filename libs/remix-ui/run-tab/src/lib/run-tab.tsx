// eslint-disable-next-line no-use-before-define
import React, { Fragment, useEffect, useState } from 'react'
import { ModalDialog } from '@remix-ui/modal-dialog'
// eslint-disable-next-line no-unused-vars
import { Toaster } from '@remix-ui/toaster'
import { useRunTabPlugin } from './actions/custom'
import { ContractDropdownUI } from './components/contractDropdownUI'
import { InstanceContainerUI } from './components/instanceContainerUI'
import { RecorderUI } from './components/recorderCardUI'
import { SettingsUI } from './components/settingsUI'
import './css/run-tab.css'
import { Modal, RunTabProps } from './types'

export function RunTabUI (props: RunTabProps) {
  const { runTab, setupEvents, setAccount, setUnit, setGasFee, setExecEnv, setExecutionContext } = useRunTabPlugin(props.plugin)
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

  useEffect(() => {
    setupEvents()
  }, [])

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

  // eslint-disable-next-line no-undef
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

  return (
    <Fragment>
      <div className="udapp_runTabView run-tab" id="runTabView" data-id="runTabView">
        <div className="list-group list-group-flush">
          <SettingsUI networkName={runTab.networkName} personalMode={runTab.personalMode} selectExEnv={runTab.selectExEnv} setExecEnv={setExecEnv} accounts={runTab.accounts} setAccount={setAccount} setUnit={setUnit} sendValue={runTab.sendValue} sendUnit={runTab.sendUnit} gasLimit={runTab.gasLimit} setGasFee={setGasFee} providers={runTab.providers} setExecutionContext={setExecutionContext} />
          <ContractDropdownUI exEnvironment={runTab.selectExEnv} />
          <RecorderUI />
          <InstanceContainerUI />
        </div>
      </div>
      <ModalDialog id='fileSystem' { ...focusModal } handleHide={ handleHideModal } />
      {/* <Toaster message={focusToaster} handleHide={handleToaster} /> */}
    </Fragment>
  )
}
