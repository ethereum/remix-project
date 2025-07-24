/* eslint-disable @nrwl/nx/enforce-module-boundaries */
// eslint-disable-next-line no-use-before-define
import React, { useReducer, useState, useEffect, SyntheticEvent } from 'react'
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
import { FileSystemContext, FileSystemProvider } from '@remix-ui/workspace'

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
    await initWorkspace(plugin)(fsDispatch)
  }

  const dispatchFetchDirectory = async (path: string) => {
    await fetchDirectory(path)
  }

  const dispatchAddInputField = async (path: string, type: 'file' | 'folder') => {
    await addInputField(type, path)
  }

  const dispatchRemoveInputField = async (path: string) => {
    await removeInputField(path)
  }

  const dispatchCreateWorkspace = async (workspaceName: string, workspaceTemplateName: WorkspaceTemplate, opts?, initGitRepo?: boolean) => {
    await createWorkspace(workspaceName, workspaceTemplateName, opts, null, null, initGitRepo)
  }

  const dispatchFetchWorkspaceDirectory = async (path: string) => {
    try {
      await fetchWorkspaceDirectory(path)
    } catch (err) {
      console.warn(err)
    }
  }

  const dispatchSwitchToWorkspace = async (name: string) => {
    await switchToWorkspace(name)
  }

  const dispatchRenameWorkspace = async (oldName: string, workspaceName: string) => {
    await renameWorkspace(oldName, workspaceName)
  }

  const dispatchDeleteWorkspace = async (workspaceName: string) => {
    await deleteWorkspace(workspaceName)
  }

  const dispatchDeleteAllWorkspaces = async () => {
    await deleteAllWorkspaces()
  }

  const dispatchPublishToGist = async (path?: string) => {
    await publishToGist(path)
  }

  const dispatchPublishFilesToGist = (selectedFiles: { key: string, type: 'file' | 'folder', content: string }[]) => {
    publishFilesToGist(selectedFiles)
  }

  const dispatchUploadFile = async (target?: SyntheticEvent, targetFolder?: string) => {
    await uploadFile(target, targetFolder)
  }

  const dispatchUploadFolder = async (target?: SyntheticEvent, targetFolder?: string) => {
    await uploadFolder(target, targetFolder)
  }

  const dispatchCreateNewFile = async (path: string, rootDir: string) => {
    await createNewFile(path, rootDir)
  }

  const dispatchSetFocusElement = async (elements: {key: string; type: 'file' | 'folder' }[]) => {
    await setFocusElement(elements)
  }

  const dispatchCreateNewFolder = async (path: string, rootDir: string) => {
    await createNewFolder(path, rootDir)
  }

  const dispatchDeletePath = async (path: string[]) => {
    await deletePath(path)
  }

  const dispatchRenamePath = async (oldPath: string, newPath: string) => {
    await renamePath(oldPath, newPath)
  }

  const dispatchDownloadPath = async (path: string) => {
    await downloadPath(path)
  }

  const dispatchCopyFile = async (src: string, dest: string) => {
    await copyFile(src, dest)
  }

  const dispatchCopyShareURL = async (path: string) => {
    await copyShareURL(path)
  }

  const dispatchCopyFolder = async (src: string, dest: string) => {
    await copyFolder(src, dest)
  }

  const dispatchRunScript = async (path: string) => {
    await runScript(path)
  }

  const dispatchSignTypedData = async (path: string) => {
    await signTypedData(path)
  }

  const dispatchEmitContextMenuEvent = async (cmd: customAction) => {
    await emitContextMenuEvent(cmd)
  }

  const dispatchHandleClickFile = async (path: string, type: 'file' | 'folder' ) => {
    await handleClickFile(path, type)
  }

  const dispatchHandleExpandPath = async (paths: string[]) => {
    await handleExpandPath(paths)
  }

  const dispatchHandleDownloadFiles = async () => {
    await handleDownloadFiles()
  }

  const dispatchHandleDownloadWorkspace = async () => {
    await handleDownloadWorkspace()
  }

  const dispatchHandleRestoreBackup = async () => {
    await restoreBackupZip()
  }

  const dispatchCloneRepository = async (url: string) => {
    await cloneRepository(url)
  }

  const dispatchMoveFile = async (src: string, dest: string) => {
    await moveFile(src, dest)
  }

  const dispatchMoveFiles = async (src: string[], dest: string) => {
    for (const path of src) {
      await moveFile(path, dest)
    }
  }

  const dispatchMoveFolder = async (src: string, dest: string) => {
    await moveFolder(src, dest)
  }

  const dispatchMoveFolders = async (src: string[], dest: string) => {
    for (const path of src) {
      await moveFolder(path, dest)
    }
  }

  const dispatchShowAllBranches = async () => {
    await showAllBranches()
  }

  const dispatchSwitchToBranch = async (branch: branch) => {
    await switchBranch(branch)
  }

  const dispatchCreateNewBranch = async (branch: string) => {
    await createNewBranch(branch)
  }

  const dispatchCheckoutRemoteBranch = async (branch: branch) => {
    await checkoutRemoteBranch(branch)
  }

  const dispatchOpenElectronFolder = async (path: string) => {
    await openElectronFolder(path)
  }

  const dispatchGetElectronRecentFolders = async () => {
    await getElectronRecentFolders()
  }

  const dispatchRemoveRecentFolder = async (path: string) => {
    await removeRecentElectronFolder(path)
  }

  const dispatchUpdateGitSubmodules = async () => {
    await updateGitSubmodules()
  }

  useEffect(() => {
    dispatchInitWorkspace()
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

  useEffect(() => {
    plugin.filePanel.expandPath = fs.browser.expandPath
  },[fs.browser.expandPath])

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
    dispatchFetchDirectory,
    dispatchAddInputField,
    dispatchRemoveInputField,
    dispatchCreateWorkspace,
    dispatchFetchWorkspaceDirectory,
    dispatchSwitchToWorkspace,
    dispatchRenameWorkspace,
    dispatchDeleteWorkspace,
    dispatchDeleteAllWorkspaces,
    dispatchPublishToGist,
    dispatchPublishFilesToGist,
    dispatchUploadFile,
    dispatchUploadFolder,
    dispatchCreateNewFile,
    dispatchSetFocusElement,
    dispatchCreateNewFolder,
    dispatchDeletePath,
    dispatchRenamePath,
    dispatchDownloadPath,
    dispatchCopyFile,
    dispatchCopyShareURL,
    dispatchCopyFolder,
    dispatchRunScript,
    dispatchSignTypedData,
    dispatchEmitContextMenuEvent,
    dispatchHandleClickFile,
    dispatchHandleExpandPath,
    dispatchHandleDownloadFiles,
    dispatchHandleDownloadWorkspace,
    dispatchHandleRestoreBackup,
    dispatchCloneRepository,
    dispatchMoveFile,
    dispatchMoveFiles,
    dispatchMoveFolder,
    dispatchMoveFolders,
    dispatchShowAllBranches,
    dispatchSwitchToBranch,
    dispatchCreateNewBranch,
    dispatchCheckoutRemoteBranch,
    dispatchOpenElectronFolder,
    dispatchGetElectronRecentFolders,
    dispatchRemoveRecentFolder,
    dispatchUpdateGitSubmodules
  }
  return (
    <TopbarContext.Provider value={value}>
      <RemixUiTopbar plugin={plugin as unknown as Topbar} reducerState={fs} dispatch={fsDispatch} />
    </TopbarContext.Provider>
  )
}

export default TopbarProvider
