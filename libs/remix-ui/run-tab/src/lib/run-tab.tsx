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
import { Modal, RunTabProps } from './types'
import { runTabInitialState, runTabReducer } from './reducers/runTab'
import './css/run-tab.css'

export function RunTabUI (props: RunTabProps) {
  const { runTab, setupEvents, setAccount, setUnit, setGasFee, setExecEnv, setExecutionContext, setProviderFromEndpoint, setFinalContext, setWeb3Endpoint } = useRunTabPlugin(props.plugin, executionContextModal)
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
  const REACT_API = { runTab }

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

  useEffect(() => {
    props.plugin.onReady(runTab)
  }, [REACT_API])

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

  const handleInputEndpoint = (e: any) => {
    setWeb3Endpoint(e.target.value)
  }

  function executionContextModal (executionContext: { context: string, fork: string }) {
    modal('External node request', web3ProviderDialogBody(), 'OK', () => { setProviderFromEndpoint(executionContext) }, 'Cancel', () => { setFinalContext() })
  }

  const web3ProviderDialogBody = () => {
    const thePath = '<path/to/local/folder/for/test/chain>'

    return (
      <>
        <div className="">
            Note: To use Geth & https://remix.ethereum.org, configure it to allow requests from Remix:(see <a href="https://geth.ethereum.org/docs/rpc/server" target="_blank">Geth Docs on rpc server</a>)
          <div className="border p-1">geth --http --http.corsdomain https://remix.ethereum.org</div>
          <br />
          To run Remix & a local Geth test node, use this command: (see <a href="https://geth.ethereum.org/getting-started/dev-mode" target="_blank">Geth Docs on Dev mode</a>)
          <div className="border p-1">geth --http --http.corsdomain="${window.origin}" --http.api web3,eth,debug,personal,net --vmdebug --datadir ${thePath} --dev console</div>
          <br />
          <br />
          <b>WARNING:</b> It is not safe to use the --http.corsdomain flag with a wildcard: <b>--http.corsdomain *</b>
          <br />
          <br />For more info: <a href="https://remix-ide.readthedocs.io/en/latest/run.html#more-about-web3-provider" target="_blank">Remix Docs on Web3 Provider</a>
          <br />
          <br />
          Web3 Provider Endpoint
        </div>
        <input
          onInput={handleInputEndpoint}
          type='text'
          name='prompt_text'
          id='prompt_text'
          style={{ width: '100%' }}
          className="form-control"
          defaultValue={runTab.externalEndpoint}
          data-id="modalDialogCustomPromptText"
        />
      </>
    )
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
