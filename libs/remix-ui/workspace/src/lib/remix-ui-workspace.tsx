import React, { useState, useEffect, useRef, useContext } from 'react' // eslint-disable-line
import { FileExplorer } from '@remix-ui/file-explorer' // eslint-disable-line
import './remix-ui-workspace.css'
import { WorkspaceProps, WorkspaceState } from './types'
import { FileSystemContext } from './contexts'

const canUpload = window.File || window.FileReader || window.FileList || window.Blob

export function Workspace (props: WorkspaceProps) {
  const LOCALHOST = ' - connect to localhost - '
  const NO_WORKSPACE = ' - none - '
  const [state, setState] = useState<WorkspaceState>({
    reset: false,
    hideRemixdExplorer: true,
    displayNewFile: false,
    externalUploads: null,
    uploadFileEvent: null,
    loadingLocalhost: false
  })
  const [currentWorkspace, setCurrentWorkspace] = useState<string>(NO_WORKSPACE)
  const global = useContext(FileSystemContext)

  useEffect(() => {
    global.dispatchInitWorkspace()
  }, [])

  useEffect(() => {
    if (global.fs.mode === 'browser') {
      setCurrentWorkspace(global.fs.browser.currentWorkspace)
      global.dispatchFetchWorkspaceDirectory(global.fs.browser.currentWorkspace)
    } else if (global.fs.mode === 'localhost') {
      // global.dispatchFetchWorkspaceDirectory('/')
      setCurrentWorkspace(LOCALHOST)
    }
  }, [global.fs.browser.currentWorkspace, global.fs.localhost.sharedFolder, global.fs.mode])

  props.plugin.resetNewFile = () => {
    setState(prevState => {
      return { ...prevState, displayNewFile: !state.displayNewFile }
    })
  }

  /* implement an external API, consumed by the parent */
  props.plugin.request.createWorkspace = () => {
    return createWorkspace()
  }

  // props.plugin.request.createNewFile = async () => {
  //   if (!state.workspaces.length) await createNewWorkspace('default_workspace')
  //   props.plugin.resetNewFile()
  // }

  // props.plugin.request.uploadFile = async (target: EventTarget & HTMLInputElement) => {
  //   if (!state.workspaces.length) await createNewWorkspace('default_workspace')

  //   setState(prevState => {
  //     return { ...prevState, uploadFileEvent: target }
  //   })
  // }

  props.plugin.request.getCurrentWorkspace = () => {
    return { name: currentWorkspace, isLocalhost: currentWorkspace === LOCALHOST, absolutePath: `${props.plugin.workspace.workspacesPath}/${currentWorkspace}` }
  }

  const createNewWorkspace = async (workspaceName) => {
    try {
      await props.plugin.fileManager.closeAllFiles()
      await props.plugin.createWorkspace(workspaceName)
      await setWorkspace(workspaceName)
      global.toast('New default workspace has been created.')
    } catch (e) {
      global.modal('Create Default Workspace', e.message, 'OK', onFinishRenameWorkspace, '')
      console.error(e)
    }
  }

  /* workspace creation, renaming and deletion */

  const renameCurrentWorkspace = () => {
    global.modal('Rename Current Workspace', renameModalMessage(), 'OK', onFinishRenameWorkspace, '')
  }

  const createWorkspace = () => {
    global.modal('Create Workspace', createModalMessage(), 'OK', onFinishCreateWorkspace, '')
  }

  const deleteCurrentWorkspace = () => {
    global.modal('Delete Current Workspace', 'Are you sure to delete the current workspace?', 'OK', onFinishDeleteWorkspace, '')
  }

  const workspaceRenameInput = useRef()
  const workspaceCreateInput = useRef()

  const onFinishRenameWorkspace = async () => {
    if (workspaceRenameInput.current === undefined) return
    // @ts-ignore: Object is possibly 'null'.
    const workspaceName = workspaceRenameInput.current.value

    try {
      await props.plugin.renameWorkspace(currentWorkspace, workspaceName)
      setWorkspace(workspaceName)
      props.plugin.workspaceRenamed({ name: workspaceName })
    } catch (e) {
      global.modal('Rename Workspace', e.message, 'OK', () => {}, '')
      console.error(e)
    }
  }

  const onFinishCreateWorkspace = async () => {
    if (workspaceCreateInput.current === undefined) return
    // @ts-ignore: Object is possibly 'null'.
    const workspaceName = workspaceCreateInput.current.value

    try {
      await global.dispatchCreateWorkspace(workspaceName)
    } catch (e) {
      global.modal('Create Workspace', e.message, 'OK', () => {}, '')
      console.error(e)
    }
  }

  const onFinishDeleteWorkspace = async () => {
    await props.plugin.fileManager.closeAllFiles()
    const workspacesPath = props.plugin.workspace.workspacesPath
    props.plugin.browser.remove(workspacesPath + '/' + currentWorkspace)
    const name = currentWorkspace
    setWorkspace(NO_WORKSPACE)
    props.plugin.workspaceDeleted({ name })
  }
  /** ** ****/

  const resetFocus = (reset) => {
    setState(prevState => {
      return { ...prevState, reset }
    })
  }

  const switchWorkspace = async (name: string) => {
    global.dispatchSwitchToWorkspace(name)
  }

  const createModalMessage = () => {
    return (
      <>
        <input type="text" data-id="modalDialogCustomPromptTextCreate" defaultValue={`workspace_${Date.now()}`} ref={workspaceCreateInput} className="form-control" />
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
      <div className='remixui_fileexplorer' onClick={() => resetFocus(true)}>
        <div>
          <header>
            <div className="mb-2">
              <label className="form-check-label" htmlFor="workspacesSelect">
                Workspaces
              </label>
              <span className="remixui_menu">
                <span
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
                  className='fas fa-trash'
                  title='Delete'>
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
        <div className='remixui_fileExplorerTree'>
          <div>
            <div className='pl-2 remixui_treeview' data-id='filePanelFileExplorerTree'>
              { global.fs.mode === 'browser' &&
                  <FileExplorer
                    name={currentWorkspace}
                    registry={props.plugin.registry}
                    filesProvider={props.plugin.workspace}
                    menuItems={['createNewFile', 'createNewFolder', 'publishToGist', canUpload ? 'uploadFile' : '']}
                    plugin={props.plugin}
                    focusRoot={state.reset}
                    contextMenuItems={props.plugin.registeredMenuItems}
                    removedContextMenuItems={props.plugin.removedMenuItems}
                    displayInput={state.displayNewFile}
                    externalUploads={state.uploadFileEvent}
                    resetFocus={resetFocus}
                    files={global.fs.browser.files}
                  />
              }
            </div>
            {
              state.loadingLocalhost ? <div className="text-center py-5"><i className="fas fa-spinner fa-pulse fa-2x"></i></div>
                : <div className='pl-2 filesystemexplorer remixui_treeview'>
                  { global.fs.mode === 'localhost' &&
                      <FileExplorer
                        name='localhost'
                        registry={props.plugin.registry}
                        filesProvider={props.plugin.localhost}
                        menuItems={['createNewFile', 'createNewFolder']}
                        plugin={props.plugin}
                        focusRoot={state.reset}
                        contextMenuItems={props.plugin.registeredMenuItems}
                        removedContextMenuItems={props.plugin.removedMenuItems}
                        resetFocus={resetFocus}
                        files={global.fs.localhost.files}
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
