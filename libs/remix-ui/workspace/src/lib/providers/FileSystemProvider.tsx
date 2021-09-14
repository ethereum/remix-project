// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useReducer, useState, useEffect } from 'react'
import { ModalDialog } from '@remix-ui/modal-dialog' // eslint-disable-line
import { Toaster } from '@remix-ui/toaster' // eslint-disable-line
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FileSystemContext } from '../contexts'
import { browserReducer, browserInitialState } from '../reducers/workspace'
import { initWorkspace, fetchDirectory, addInputField, removeInputField, createWorkspace, fetchWorkspaceDirectory, switchToWorkspace, renameWorkspace, deleteWorkspace, clearPopUp, publishToGist } from '../actions/workspace'
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
  const [focusToaster, setFocusToaster] = useState<string>('')
  const [toasters, setToasters] = useState<string[]>([])

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

  const dispatchCreateWorkspace = async (workspaceName: string) => {
    await createWorkspace(workspaceName)(fsDispatch)
  }

  const dispatchFetchWorkspaceDirectory = async (path: string) => {
    await fetchWorkspaceDirectory(path)(fsDispatch)
  }

  const dispatchSwitchToWorkspace = async (name: string) => {
    await switchToWorkspace(name)(fsDispatch)
  }

  const dispatchRenameWorkspace = async (oldName: string, workspaceName: string) => {
    await renameWorkspace(oldName, workspaceName)(fsDispatch)
  }

  const dispatchDeleteWorkspace = async (workspaceName: string) => {
    await deleteWorkspace(workspaceName)(fsDispatch)
  }

  const dispatchPublishToGist = async (path?: string, type?: string) => {
    await publishToGist(path, type)(fsDispatch)
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
    if (fs.notification.title) {
      modal(fs.notification.title, fs.notification.message, fs.notification.labelOk, fs.notification.actionOk, fs.notification.labelCancel, fs.notification.actionCancel)
    }
  }, [fs.notification])

  useEffect(() => {
    if (fs.popup) {
      toast(fs.popup)
    }
  }, [fs.popup])

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

  const handleToaster = () => {
    setFocusToaster('')
    clearPopUp()(fsDispatch)
  }

  const toast = (toasterMsg: string) => {
    setToasters(messages => {
      messages.push(toasterMsg)
      return [...messages]
    })
  }

  const value = {
    fs,
    modal,
    toast,
    dispatchInitWorkspace,
    dispatchFetchDirectory,
    dispatchAddInputField,
    dispatchRemoveInputField,
    dispatchCreateWorkspace,
    dispatchFetchWorkspaceDirectory,
    dispatchSwitchToWorkspace,
    dispatchRenameWorkspace,
    dispatchDeleteWorkspace,
    dispatchPublishToGist
  }
  return (
    <FileSystemContext.Provider value={value}>
      <Workspace plugin={plugin} />
      <ModalDialog id='fileSystem' { ...focusModal } handleHide={ handleHideModal } />
      <Toaster message={focusToaster} handleHide={handleToaster} />
    </FileSystemContext.Provider>
  )
}

export default FileSystemProvider
