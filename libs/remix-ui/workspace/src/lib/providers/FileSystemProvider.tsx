// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useReducer, useState, useEffect } from 'react'
import { ModalDialog } from '@remix-ui/modal-dialog' // eslint-disable-line
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FileSystemContext } from '../contexts'
import { browserReducer, browserInitialState } from '../reducers/workspace'
import { initWorkspace, fetchDirectory, addInputField, removeInputField } from '../actions/workspace'
import { Modal, WorkspaceProps } from '../types'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Workspace } from '../remix-ui-workspace'

export const FileSystemProvider = (props: WorkspaceProps) => {
  const { plugin } = props
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
    await initWorkspace(plugin)(fsDispatch)
  }

  const dispatchFetchDirectory = async (path: string) => {
    await fetchDirectory(path)(fsDispatch)
  }

  const dispatchAddInputField = async (path: string, type: 'file' | 'folder') => {
    await addInputField(type, path)(fsDispatch)
  }

  const dispatchRemoveInputField = async (path: string) => {
    await removeInputField(path)(fsDispatch)
  }

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
    if (fs.notification.title) {
      modal(fs.notification.title, fs.notification.message, fs.notification.labelOk, fs.notification.actionOk, fs.notification.labelCancel, fs.notification.actionCancel)
    }
  }, [fs.notification])

  const handleHideModal = () => {
    setFocusModal(modal => {
      return { ...modal, hide: true, message: null }
    })
  }

  const modal = (title: string, message: string | JSX.Element, okLabel: string, okFn: () => void, cancelLabel?: string, cancelFn?: () => void) => {
    setModals(modals => {
      modals.push({ message, title, okLabel, okFn, cancelLabel, cancelFn })
      return [...modals]
    })
  }

  const value = {
    fs,
    modal,
    dispatchInitWorkspace,
    dispatchFetchDirectory,
    dispatchAddInputField,
    dispatchRemoveInputField
  }
  return (
    <FileSystemContext.Provider value={value}>
      <Workspace plugin={plugin} />
      <ModalDialog id='fileSystem' { ...focusModal } handleHide={ handleHideModal } />
    </FileSystemContext.Provider>
  )
}

export default FileSystemProvider
