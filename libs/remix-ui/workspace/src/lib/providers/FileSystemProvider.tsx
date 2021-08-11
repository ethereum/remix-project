// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useReducer, useState, useEffect } from 'react'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FileSystemContext } from '../contexts'
import { browserReducer, browserInitialState } from '../reducers/workspace'
import { initWorkspace, initLocalhost, fetchDirectory } from '../actions/workspace'
import { ModalDialog } from '@remix-ui/modal-dialog' // eslint-disable-line
import { Modal } from '../types'

export const FileSystemProvider = ({ filePanel, children }) => {
  const [fs, fsDispatch] = useReducer(browserReducer, browserInitialState)
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

  const dispatchInitWorkspace = async () => {
    await initWorkspace(filePanel)(fsDispatch)
  }

  const dispatchInitLocalhost = async () => {
    await initLocalhost(filePanel)(fsDispatch)
  }

  const dispatchFetchDirectory = async (path: string) => {
    await fetchDirectory(fs.mode, path)(fsDispatch)
  }

  useEffect(() => {
    if (modals.length > 0) {
      setModals(modals => {
        const focusModal = {
          hide: false,
          title: modals[0].title,
          message: modals[0].message,
          okLabel: modals[0].okLabel,
          okFn: modals[0].okFn,
          cancelLabel: modals[0].cancelLabel,
          cancelFn: modals[0].cancelFn
        }

        modals.shift()
        return {
          ...modals,
          focusModal,
          modals: modals
        }
      })
    }
  }, [modals])

  const handleHideModal = () => {
    setFocusModal(modal => {
      return { ...modal, hide: true, message: null }
    })
  }

  const modal = (title: string, message: string | JSX.Element, okLabel: string, okFn: () => void, cancelLabel?: string, cancelFn?: () => void) => {
    setModals(modals => [...modals, { message, title, okLabel, okFn, cancelLabel, cancelFn }])
  }

  const value = {
    fs,
    modal,
    dispatchInitWorkspace,
    dispatchInitLocalhost,
    dispatchFetchDirectory
  }
  return (
    <FileSystemContext.Provider value={value}>
      { children }
      <ModalDialog id='fileSystem' { ...focusModal } handleHide={ handleHideModal } />
    </FileSystemContext.Provider>
  )
}

export default FileSystemProvider
