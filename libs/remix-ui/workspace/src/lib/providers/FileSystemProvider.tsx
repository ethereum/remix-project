// eslint-disable-next-line no-use-before-define
import React, { useReducer, useState, useEffect, SyntheticEvent } from 'react'
import { ModalDialog } from '@remix-ui/modal-dialog' // eslint-disable-line
import { Toaster } from '@remix-ui/toaster' // eslint-disable-line
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FileSystemContext } from '../contexts'
import { browserReducer, browserInitialState } from '../reducers/workspace'
import { initWorkspace, fetchDirectory, removeInputField, deleteWorkspace, clearPopUp, publishToGist, createNewFile, setFocusElement, createNewFolder,
  deletePath, renamePath, copyFile, copyFolder, runScript, emitContextMenuEvent, handleClickFile, handleExpandPath, addInputField, createWorkspace,
  fetchWorkspaceDirectory, renameWorkspace, switchToWorkspace, uploadFile, handleDownloadFiles, restoreBackupZip, cloneRepository, moveFile, moveFolder,
  showAllBranches, switchBranch, createNewBranch, checkoutRemoteBranch, createSolidityGithubAction, createTsSolGithubAction, createSlitherGithubAction
} from '../actions'
import { Modal, WorkspaceProps, WorkspaceTemplate } from '../types'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Workspace } from '../remix-ui-workspace'
import { customAction } from '@remixproject/plugin-api/lib/file-system/file-panel/type'

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
    await fetchWorkspaceDirectory(path)
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

  const dispatchPublishToGist = async (path?: string, type?: string) => {
    await publishToGist(path, type)
  }

  const dispatchUploadFile = async (target?: SyntheticEvent, targetFolder?: string) => {
    await uploadFile(target, targetFolder)
  }

  const dispatchCreateNewFile = async (path: string, rootDir: string) => {
    await createNewFile(path, rootDir)
  }

  const dispatchSetFocusElement = async (elements: { key: string, type: 'file' | 'folder' | 'gist' }[]) => {
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

  const dispatchCopyFile = async (src: string, dest: string) => {
    await copyFile(src, dest)
  }

  const dispatchCopyFolder = async (src: string, dest: string) => {
    await copyFolder(src, dest)
  }

  const dispatchRunScript = async (path: string) => {
    await runScript(path)
  }

  const dispatchEmitContextMenuEvent = async (cmd: customAction) => {
    await emitContextMenuEvent(cmd)
  }

  const dispatchHandleClickFile = async (path: string, type: 'file' | 'folder' | 'gist') => {
    await handleClickFile(path, type)
  }

  const dispatchHandleExpandPath = async (paths: string[]) => {
    await handleExpandPath(paths)
  }

  const dispatchHandleDownloadFiles = async () => {
    await handleDownloadFiles()
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

  const dispatchMoveFolder = async (src: string, dest: string) => {
    await moveFolder(src, dest)
  }
  
  const dispatchShowAllBranches = async () => {
    await showAllBranches()
  }

  const dispatchSwitchToBranch = async (branch: string) => {
    await switchBranch(branch)
  }

  const dispatchCreateNewBranch = async (branch: string) => {
    await createNewBranch(branch)
  }

  const dispatchCheckoutRemoteBranch = async (branch: string, remote: string) => {
    await checkoutRemoteBranch(branch, remote)
  }

  const dispatchCreateSolidityGithubAction = async () => {
    await createSolidityGithubAction()
  }

  const dispatchCreateTsSolGithubAction = async () => {
    await createTsSolGithubAction()
  }

  const dispatchCreateSlitherGithubAction = async () => {
    await createSlitherGithubAction()
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
    clearPopUp()
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
    plugin,
    dispatchInitWorkspace,
    dispatchFetchDirectory,
    dispatchAddInputField,
    dispatchRemoveInputField,
    dispatchCreateWorkspace,
    dispatchFetchWorkspaceDirectory,
    dispatchSwitchToWorkspace,
    dispatchRenameWorkspace,
    dispatchDeleteWorkspace,
    dispatchPublishToGist,
    dispatchUploadFile,
    dispatchCreateNewFile,
    dispatchSetFocusElement,
    dispatchCreateNewFolder,
    dispatchDeletePath,
    dispatchRenamePath,
    dispatchCopyFile,
    dispatchCopyFolder,
    dispatchRunScript,
    dispatchEmitContextMenuEvent,
    dispatchHandleClickFile,
    dispatchHandleExpandPath,
    dispatchHandleDownloadFiles,
    dispatchHandleRestoreBackup,
    dispatchCloneRepository,
    dispatchMoveFile,
    dispatchMoveFolder,
    dispatchShowAllBranches,
    dispatchSwitchToBranch,
    dispatchCreateNewBranch,
    dispatchCheckoutRemoteBranch,
    dispatchCreateSolidityGithubAction,
    dispatchCreateTsSolGithubAction,
    dispatchCreateSlitherGithubAction
  }
  return (
    <FileSystemContext.Provider value={value}>
      { fs.initializingFS && <div className="text-center py-5"><i className="fas fa-spinner fa-pulse fa-2x"></i></div> }
      { !fs.initializingFS && <Workspace /> }
      <ModalDialog id='fileSystem' { ...focusModal } handleHide={ handleHideModal } />
      <Toaster message={focusToaster} handleHide={handleToaster} />
    </FileSystemContext.Provider>
  )
}

export default FileSystemProvider

