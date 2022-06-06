import React, { useState, useEffect, useRef, useContext } from 'react' // eslint-disable-line
import { FileExplorer } from './components/file-explorer' // eslint-disable-line
import './css/remix-ui-workspace.css'
import { FileSystemContext } from './contexts'

const canUpload = window.File || window.FileReader || window.FileList || window.Blob

export function Workspace () {
  const LOCALHOST = ' - connect to localhost - '
  const NO_WORKSPACE = ' - none - '
  const [currentWorkspace, setCurrentWorkspace] = useState<string>(NO_WORKSPACE)
  const global = useContext(FileSystemContext)
  const workspaceRenameInput = useRef()
  const workspaceCreateInput = useRef()
  const workspaceCreateTemplateInput = useRef()

  useEffect(() => {
    resetFocus()
  }, [])

  useEffect(() => {
    if (global.fs.mode === 'browser') {
      if (global.fs.browser.currentWorkspace) setCurrentWorkspace(global.fs.browser.currentWorkspace)
      else setCurrentWorkspace(NO_WORKSPACE)
      global.dispatchFetchWorkspaceDirectory(global.fs.browser.currentWorkspace)
    } else if (global.fs.mode === 'localhost') {
      global.dispatchFetchWorkspaceDirectory('/')
      setCurrentWorkspace(LOCALHOST)
    }
  }, [global.fs.browser.currentWorkspace, global.fs.localhost.sharedFolder, global.fs.mode])

  useEffect(() => {
    if (global.fs.browser.currentWorkspace && !global.fs.browser.workspaces.includes(global.fs.browser.currentWorkspace)) {
      if (global.fs.browser.workspaces.length > 0) {
        switchWorkspace(global.fs.browser.workspaces[global.fs.browser.workspaces.length - 1])
      } else {
        switchWorkspace(NO_WORKSPACE)
      }
    }
  }, [global.fs.browser.workspaces])

  const renameCurrentWorkspace = () => {
    global.modal('Rename Current Workspace', renameModalMessage(), 'OK', onFinishRenameWorkspace, '')
  }

  const createWorkspace = () => {
    global.modal('Create Workspace', createModalMessage(), 'OK', onFinishCreateWorkspace, '')
  }

  const deleteCurrentWorkspace = () => {
    global.modal('Delete Current Workspace', 'Are you sure to delete the current workspace?', 'OK', onFinishDeleteWorkspace, '')
  }

  const downloadWorkspaces = async () => {
    try {
      await global.dispatchHandleDownloadFiles()
    } catch (e) {
      console.error(e)
    }
  }

  const restoreBackup = async () => {
    try {
      await global.dispatchHandleRestoreBackup()
    } catch (e) {
      console.error(e)
    }
  }

  const onFinishRenameWorkspace = async () => {
    if (workspaceRenameInput.current === undefined) return
    // @ts-ignore: Object is possibly 'null'.
    const workspaceName = workspaceRenameInput.current.value

    try {
      await global.dispatchRenameWorkspace(currentWorkspace, workspaceName)
    } catch (e) {
      global.modal('Rename Workspace', e.message, 'OK', () => {}, '')
      console.error(e)
    }
  }

  const onFinishCreateWorkspace = async () => {
    if (workspaceCreateInput.current === undefined) return
    // @ts-ignore: Object is possibly 'null'.
    const workspaceName = workspaceCreateInput.current.value
    // @ts-ignore: Object is possibly 'null'.
    const workspaceTemplateName = workspaceCreateTemplateInput.current.value || 'remixDefault'

    try {
      await global.dispatchCreateWorkspace(workspaceName, workspaceTemplateName)
    } catch (e) {
      global.modal('Create Workspace', e.message, 'OK', () => {}, '')
      console.error(e)
    }
  }

  const onFinishDeleteWorkspace = async () => {
    try {
      await global.dispatchDeleteWorkspace(global.fs.browser.currentWorkspace)
    } catch (e) {
      global.modal('Delete Workspace', e.message, 'OK', () => {}, '')
      console.error(e)
    }
  }
  /** ** ****/

  const resetFocus = () => {
    global.dispatchSetFocusElement([{ key: '', type: 'folder' }])
  }

  const switchWorkspace = async (name: string) => {
    try {
      await global.dispatchSwitchToWorkspace(name)
      global.dispatchHandleExpandPath([])
    } catch (e) {
      global.modal('Switch To Workspace', e.message, 'OK', () => {}, '')
      console.error(e)
    }
  }

  const updateWsName = () => {
    // @ts-ignore
    workspaceCreateInput.current.value = `${workspaceCreateTemplateInput.current.value || 'remixDefault'}_${Date.now()}`
  }

  const createModalMessage = () => {
    return (
      <>
        <label id="wsName" className="form-check-label">Workspace name</label>
        <input type="text" data-id="modalDialogCustomPromptTextCreate" defaultValue={`remixDefault_${Date.now()}`} ref={workspaceCreateInput} className="form-control" /><br/>
        <label id="selectWsTemplate" className="form-check-label">Choose a template</label>
        <select name="wstemplate"  className="form-control custom-select" id="wstemplate" defaultValue='remixDefault' ref={workspaceCreateTemplateInput} onChange={updateWsName}>
          <option value='remixDefault'>Default</option>
          <option value='blank'>Blank</option>
          <option value='ozerc20'>OpenZeppelin ERC20</option>
          <option value='zeroxErc20'>0xProject ERC20</option>
          <option value='ozerc721'>OpenZeppelin ERC721</option>
        </select>
      </>
    )
  }

  const renameModalMessage = () => {
    return (
      <>
        <input type="text" data-id="modalDialogCustomPromptTextRename" defaultValue={ currentWorkspace } ref={workspaceRenameInput} className="form-control" />
      </>
    )
  }

  return (
    <div className='remixui_container'>
      <div className='remixui_fileexplorer' data-id="remixUIWorkspaceExplorer" onClick={resetFocus}>
        <div>
          <header>
            <div className="mb-2">
              <label className="form-check-label" htmlFor="workspacesSelect">
                Workspaces
              </label>
              <span className="remixui_menu">
                <span
                  hidden={currentWorkspace === LOCALHOST}
                  id='workspaceCreate'
                  data-id='workspaceCreate'
                  onClick={(e) => {
                    e.stopPropagation()
                    createWorkspace()
                  }}
                  className='far fa-plus-square remixui_menuicon'
                  title='Create'>
                </span>
                <span
                  hidden={currentWorkspace === LOCALHOST || currentWorkspace === NO_WORKSPACE}
                  id='workspaceRename'
                  data-id='workspaceRename'
                  onClick={(e) => {
                    e.stopPropagation()
                    renameCurrentWorkspace()
                  }}
                  className='far fa-edit remixui_menuicon'
                  title='Rename'>
                </span>
                <span
                  hidden={currentWorkspace === LOCALHOST || currentWorkspace === NO_WORKSPACE}
                  id='workspaceDelete'
                  data-id='workspaceDelete'
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteCurrentWorkspace()
                  }}
                  className='fas fa-trash remixui_menuicon'
                  title='Delete'>
                </span>
                <span
                  hidden={currentWorkspace === LOCALHOST || currentWorkspace === NO_WORKSPACE}
                  id='workspacesDownload'
                  data-id='workspacesDownload'
                  onClick={(e) => {
                    e.stopPropagation()
                    downloadWorkspaces()
                  }}
                  className='far fa-download remixui_menuicon'
                  title='Download Workspaces'>
                </span>
                <span
                  hidden={currentWorkspace === LOCALHOST}
                  id='workspacesRestore'
                  data-id='workspacesRestore'
                  onClick={(e) => {
                    e.stopPropagation()
                    restoreBackup()
                  }}
                  className='far fa-upload remixui_menuicon'
                  title='Restore Workspaces Backup'>
                </span>
              </span>
              <select id="workspacesSelect" value={currentWorkspace} data-id="workspacesSelect" onChange={(e) => switchWorkspace(e.target.value)} className="form-control custom-select">
                {
                  global.fs.browser.workspaces
                    .map((folder, index) => {
                      return <option key={index} value={folder}>{folder}</option>
                    })
                }
                <option value={LOCALHOST}>{currentWorkspace === LOCALHOST ? 'localhost' : LOCALHOST}</option>
                { global.fs.browser.workspaces.length <= 0 && <option value={NO_WORKSPACE}>{NO_WORKSPACE}</option> }
              </select>
            </div>
          </header>
        </div>
        <div className='h-100 remixui_fileExplorerTree'>
          <div className='h-100'>
            <div className='pl-2 remixui_treeview' data-id='filePanelFileExplorerTree'>
              { (global.fs.mode === 'browser') && (currentWorkspace !== NO_WORKSPACE) &&
                  <FileExplorer
                    name={currentWorkspace}
                    menuItems={['createNewFile', 'createNewFolder', 'publishToGist', canUpload ? 'uploadFile' : '']}
                    contextMenuItems={global.fs.browser.contextMenu.registeredMenuItems}
                    removedContextMenuItems={global.fs.browser.contextMenu.removedMenuItems}
                    files={global.fs.browser.files}
                    expandPath={global.fs.browser.expandPath}
                    focusEdit={global.fs.focusEdit}
                    focusElement={global.fs.focusElement}
                    dispatchCreateNewFile={global.dispatchCreateNewFile}
                    modal={global.modal}
                    dispatchCreateNewFolder={global.dispatchCreateNewFolder}
                    readonly={global.fs.readonly}
                    toast={global.toast}
                    dispatchDeletePath={global.dispatchDeletePath}
                    dispatchRenamePath={global.dispatchRenamePath}
                    dispatchUploadFile={global.dispatchUploadFile}
                    dispatchCopyFile={global.dispatchCopyFile}
                    dispatchCopyFolder={global.dispatchCopyFolder}
                    dispatchPublishToGist={global.dispatchPublishToGist}
                    dispatchRunScript={global.dispatchRunScript}
                    dispatchEmitContextMenuEvent={global.dispatchEmitContextMenuEvent}
                    dispatchHandleClickFile={global.dispatchHandleClickFile}
                    dispatchSetFocusElement={global.dispatchSetFocusElement}
                    dispatchFetchDirectory={global.dispatchFetchDirectory}
                    dispatchRemoveInputField={global.dispatchRemoveInputField}
                    dispatchAddInputField={global.dispatchAddInputField}
                    dispatchHandleExpandPath={global.dispatchHandleExpandPath}
                  />
              }
            </div>
            {
              global.fs.localhost.isRequestingLocalhost ? <div className="text-center py-5"><i className="fas fa-spinner fa-pulse fa-2x"></i></div>
                : <div className='pl-2 filesystemexplorer remixui_treeview'>
                  { global.fs.mode === 'localhost' && global.fs.localhost.isSuccessfulLocalhost &&
                      <FileExplorer
                        name='localhost'
                        menuItems={['createNewFile', 'createNewFolder']}
                        contextMenuItems={global.fs.localhost.contextMenu.registeredMenuItems}
                        removedContextMenuItems={global.fs.localhost.contextMenu.removedMenuItems}
                        files={global.fs.localhost.files}
                        expandPath={global.fs.localhost.expandPath}
                        focusEdit={global.fs.focusEdit}
                        focusElement={global.fs.focusElement}
                        dispatchCreateNewFile={global.dispatchCreateNewFile}
                        modal={global.modal}
                        dispatchCreateNewFolder={global.dispatchCreateNewFolder}
                        readonly={global.fs.readonly}
                        toast={global.toast}
                        dispatchDeletePath={global.dispatchDeletePath}
                        dispatchRenamePath={global.dispatchRenamePath}
                        dispatchUploadFile={global.dispatchUploadFile}
                        dispatchCopyFile={global.dispatchCopyFile}
                        dispatchCopyFolder={global.dispatchCopyFolder}
                        dispatchPublishToGist={global.dispatchPublishToGist}
                        dispatchRunScript={global.dispatchRunScript}
                        dispatchEmitContextMenuEvent={global.dispatchEmitContextMenuEvent}
                        dispatchHandleClickFile={global.dispatchHandleClickFile}
                        dispatchSetFocusElement={global.dispatchSetFocusElement}
                        dispatchFetchDirectory={global.dispatchFetchDirectory}
                        dispatchRemoveInputField={global.dispatchRemoveInputField}
                        dispatchAddInputField={global.dispatchAddInputField}
                        dispatchHandleExpandPath={global.dispatchHandleExpandPath}
                      />
                  }
                </div>
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default Workspace
