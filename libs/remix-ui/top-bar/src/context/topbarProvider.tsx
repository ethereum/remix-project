/* eslint-disable @nrwl/nx/enforce-module-boundaries */
// eslint-disable-next-line no-use-before-define
import React, { useReducer, useState, useEffect, SyntheticEvent, useContext } from 'react'
import {ModalDialog} from '@remix-ui/modal-dialog' // eslint-disable-line
import {Toaster} from '@remix-ui/toaster' // eslint-disable-line
import { browserReducer, browserInitialState } from 'libs/remix-ui/workspace/src/lib/reducers/workspace'
import { branch } from '@remix-ui/git'
import {
  initWorkspace,
  fetchDirectory,
  removeInputField,
  deleteWorkspace,
  deleteAllWorkspaces,
  clearPopUp,
  publishToGist,
  publishFilesToGist,
  createNewFile,
  setFocusElement,
  createNewFolder,
  deletePath,
  renamePath,
  downloadPath,
  copyFile,
  copyShareURL,
  copyFolder,
  runScript,
  signTypedData,
  emitContextMenuEvent,
  handleClickFile,
  handleExpandPath,
  addInputField,
  createWorkspace,
  fetchWorkspaceDirectory,
  renameWorkspace,
  switchToWorkspace,
  uploadFile,
  uploadFolder,
  handleDownloadWorkspace,
  handleDownloadFiles,
  restoreBackupZip,
  cloneRepository,
  moveFile,
  moveFolder,
  showAllBranches,
  switchBranch,
  createNewBranch,
  checkoutRemoteBranch,
  openElectronFolder,
  getElectronRecentFolders,
  removeRecentElectronFolder,
  updateGitSubmodules
} from 'libs/remix-ui/workspace/src/lib/actions'
import { FilePanelType, Modal, WorkspaceTemplate } from 'libs/remix-ui/workspace/src/lib/types'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Workspace } from 'libs/remix-ui/workspace/src/lib/remix-ui-workspace'
import { customAction } from '@remixproject/plugin-api'
import { TopbarContext } from './topbarContext'
import { Topbar } from 'apps/remix-ide/src/app/components/top-bar'
import { RemixUiTopbar } from '..'

export interface TopbarProviderProps {
  plugin: Topbar
}

export const TopbarProvider = (props: TopbarProviderProps) => {
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
    await initWorkspace(plugin.filePanel)(fsDispatch)
  }

  useEffect(() => {
    dispatchInitWorkspace()
  }, [])

  // useEffect(() => {
  //   // Helper function to refresh workspace list
  //   const refreshWorkspaces = async () => {
  //     try {
  //       const workspaces = await plugin.filePanel.getWorkspaces()
  //       fsDispatch({ type: 'SET_WORKSPACES', payload: workspaces })
  //     } catch (error) {
  //       console.error('Failed to refresh workspaces:', error)
  //     }
  //   }

  //   // Listen for workspace deletion events
  //   const handleWorkspaceDeleted = (workspaceName: string) => {
  //     console.log('TopbarProvider: workspaceDeleted event received', workspaceName)
  //     // Use the reducer action to remove the workspace
  //     fsDispatch({ type: 'DELETE_WORKSPACE', payload: workspaceName })
  //   }

  //   // Listen for workspace creation events
  //   const handleWorkspaceCreated = (workspace: any) => {
  //     console.log('TopbarProvider: workspaceCreated event received', workspace)
  //     // Refresh the entire workspace list to get the new workspace
  //     refreshWorkspaces()
  //   }

  //   // Listen for workspace rename events
  //   const handleWorkspaceRenamed = (workspace: any) => {
  //     console.log('TopbarProvider: workspaceRenamed event received', workspace)
  //     // Refresh the entire workspace list to get the updated workspace
  //     refreshWorkspaces()
  //   }

  //   // Listen for workspace switching events
  //   const handleSetWorkspace = (workspace: any) => {
  //     console.log('TopbarProvider: setWorkspace event received', workspace)
  //     if (workspace && workspace.name) {
  //       fsDispatch({ type: 'SET_CURRENT_WORKSPACE', payload: workspace.name })
  //     }
  //   }

  //   // Register event listeners
  //   plugin.on('filePanel', 'workspaceDeleted', handleWorkspaceDeleted)
  //   plugin.on('filePanel', 'workspaceCreated', handleWorkspaceCreated)
  //   plugin.on('filePanel', 'workspaceRenamed', handleWorkspaceRenamed)
  //   plugin.on('filePanel', 'setWorkspace', handleSetWorkspace)

  //   // Cleanup function
  //   return () => {
  //     plugin.off('filePanel', 'workspaceDeleted')
  //     plugin.off('filePanel', 'workspaceCreated')
  //     plugin.off('filePanel', 'workspaceRenamed')
  //     plugin.off('filePanel', 'setWorkspace')
  //   }
  // }, [plugin])

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
    setFocusModal((modal) => {
      return { ...modal, hide: true, message: null }
    })
  }

  const modal = (title: string, message: string | JSX.Element, okLabel: string, okFn: () => void, cancelLabel?: string, cancelFn?: () => void) => {
    setModals((modals) => {
      modals.push({ message, title, okLabel, okFn, cancelLabel, cancelFn })
      return [...modals]
    })
  }

  const handleToaster = () => {
    setFocusToaster('')
    clearPopUp()
  }

  const toast = (toasterMsg: string) => {
    setToasters((messages) => {
      messages.push(toasterMsg)
      return [...messages]
    })
  }

  const value = {
    fs,
    plugin: plugin as unknown as Topbar,
    modal,
    toast,
    dispatchInitWorkspace,
  }

  return (
    <TopbarContext.Provider value={value}>
      {fs.initializingFS && (
        <div className="text-center py-5">
          <i className="fas fa-spinner fa-pulse fa-2x"></i>
        </div>
      )}
      {!fs.initializingFS && <RemixUiTopbar />}
      <ModalDialog id="topbarModal" {...focusModal} handleHide={handleHideModal} />
      <Toaster message={focusToaster} handleHide={handleToaster} />
    </TopbarContext.Provider>
  )
}

export default TopbarProvider
