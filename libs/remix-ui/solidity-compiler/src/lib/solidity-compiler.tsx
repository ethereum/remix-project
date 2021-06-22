import React, { useState, useEffect } from 'react' // eslint-disable-line
import { SolidityCompilerProps } from './types'
import { CompilerContainer } from './compiler-container' // eslint-disable-line
import { Toaster } from '@remix-ui/toaster' // eslint-disable-line
import { ModalDialog } from '@remix-ui/modal-dialog' // eslint-disable-line

import './css/style.css'

export const SolidityCompiler = (props: SolidityCompilerProps) => {
  const { editor, config, queryParams, plugin, compileTabLogic } = props
  const [state, setState] = useState({
    contractsDetails: {},
    eventHandlers: {},
    loading: false,
    compileTabLogic: null,
    compiler: null,
    toasterMsg: '',
    modal: {
      hide: true,
      title: '',
      message: null,
      okLabel: '',
      okFn: () => {},
      cancelLabel: '',
      cancelFn: () => {},
      handleHide: null
    }
  })

  const toast = (message: string) => {
    setState(prevState => {
      return { ...prevState, toasterMsg: message }
    })
  }

  const clearAnnotations = () => {
    plugin.call('editor', 'clearAnnotations')
  }

  const modal = async (title: string, message: string | JSX.Element, okLabel: string, okFn: () => void, cancelLabel?: string, cancelFn?: () => void) => {
    await setState(prevState => {
      return {
        ...prevState,
        modal: {
          ...prevState.modal,
          hide: false,
          message,
          title,
          okLabel,
          okFn,
          cancelLabel,
          cancelFn
        }
      }
    })
  }

  const handleHideModal = () => {
    setState(prevState => {
      return { ...prevState, modal: { ...state.modal, hide: true, message: null } }
    })
  }

  return (
    <>
      <div id="compileTabView">
        <CompilerContainer editor={editor} config={config} queryParams={queryParams} compileTabLogic={compileTabLogic} tooltip={toast} modal={modal} />
        {/* ${this._view.contractSelection} */}
        <div className="remixui_errorBlobs p-4" data-id="compiledErrors"></div>
      </div>
      <Toaster message={state.toasterMsg} />
      <ModalDialog
        id='workspacesModalDialog'
        title={ state.modal.title }
        message={ state.modal.message }
        hide={ state.modal.hide }
        okLabel={ state.modal.okLabel }
        okFn={ state.modal.okFn }
        cancelLabel={ state.modal.cancelLabel }
        cancelFn={ state.modal.cancelFn }
        handleHide={ handleHideModal }>
        { (typeof state.modal.message !== 'string') && state.modal.message }
      </ModalDialog>
    </>
  )
}

export default SolidityCompiler
