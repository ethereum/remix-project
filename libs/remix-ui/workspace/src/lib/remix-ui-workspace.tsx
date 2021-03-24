import React, { useState, useEffect, useRef } from 'react' // eslint-disable-line
import { FileExplorer } from '@remix-ui/file-explorer' // eslint-disable-line
import './remix-ui-workspace.css'
import { ModalDialog } from '@remix-ui/modal-dialog' // eslint-disable-line

/* eslint-disable-next-line */
export interface WorkspaceProps {
  setWorkspace: ({ name: string, isLocalhost: boolean }) => void,
  createWorkspace: (name: string) => void,
  renameWorkspace: (oldName: string, newName: string) => void
  workspaceRenamed: ({ name: string }) => void,
  workspaceCreated: ({ name: string }) => void,
  workspaceDeleted: ({ name: string }) => void,
  workspace: any // workspace provider,
  browser: any // browser provider
  localhost: any // localhost provider
  fileManager : any
  registry: any // registry
  plugin: any // plugin call and resetFocus
  request: any // api request,
  workspaces: any,
  registeredMenuItems: [] // menu items
  initialWorkspace: string
}

var canUpload = window.File || window.FileReader || window.FileList || window.Blob
export const Workspace = (props: WorkspaceProps) => {
  const LOCALHOST = ' - connect to localhost - '
  const NO_WORKSPACE = ' - none - '

  /* extends the parent 'plugin' with some function needed by the file explorer */
  props.plugin.resetFocus = (reset) => {
    setState(prevState => {
      return { ...prevState, reset }
    })
  }

  props.plugin.resetNewFile = () => {
    setState(prevState => {
      return { ...prevState, displayNewFile: !state.displayNewFile }
    })
  }

  props.plugin.resetUploadFile = () => {}

  /* implement an external API, consumed by the parent */
  props.request.createWorkspace = () => {
    return createWorkspace()
  }

  props.request.createNewFile = () => {
    props.plugin.resetNewFile()
  }

  props.request.uploadFile = (target) => {
    setState(prevState => {
      return { ...prevState, uploadFileEvent: target }
    })
  }

  props.request.getCurrentWorkspace = () => {
    return state.currentWorkspace
  }

  useEffect(() => {
    const getWorkspaces = async () => {
      if (props.workspaces && Array.isArray(props.workspaces)) {
        if (props.workspaces.length > 0 && state.currentWorkspace === NO_WORKSPACE) {
          props.workspace.setWorkspace(props.workspaces[0])
          setState(prevState => {
            return { ...prevState, workspaces: props.workspaces, currentWorkspace: props.workspaces[0] }
          })
        } else {
          setState(prevState => {
            return { ...prevState, workspaces: props.workspaces }
          })
        }
      }
    }

    getWorkspaces()
  }, [props.workspaces])

  const localhostDisconnect = () => {
    if (state.currentWorkspace === LOCALHOST) setWorkspace(props.workspaces.length > 0 ? props.workspaces[0] : NO_WORKSPACE)
  }
  props.localhost.event.unregister('disconnected', localhostDisconnect)
  props.localhost.event.register('disconnected', localhostDisconnect)

  useEffect(() => {
    props.localhost.event.register('connected', () => {
      remixdExplorer.show()
      setWorkspace(LOCALHOST)
    })

    props.localhost.event.register('disconnected', () => {
      remixdExplorer.hide()
    })

    props.localhost.event.register('loading', () => {
      remixdExplorer.loading()
    })

    if (props.initialWorkspace) {
      props.workspace.setWorkspace(props.initialWorkspace)
      setState(prevState => {
        return { ...prevState, currentWorkspace: props.initialWorkspace }
      })
    }
  }, [])

  const [state, setState] = useState({
    workspaces: [],
    reset: false,
    currentWorkspace: NO_WORKSPACE,
    hideRemixdExplorer: true,
    displayNewFile: false,
    externalUploads: null,
    uploadFileEvent: null,
    modal: {
      hide: true,
      title: '',
      message: null,
      ok: {
        label: '',
        fn: () => {}
      },
      cancel: {
        label: '',
        fn: () => {}
      },
      handleHide: null
    },
    loadingLocalhost: false
  })

  /* workspace creation, renaming and deletion */

  const renameCurrentWorkspace = () => {
    modal('Rename Current Workspace', renameModalMessage(), {
      label: 'OK',
      fn: onFinishRenameWorkspace
    }, {
      label: '',
      fn: () => {}
    })
  }

  const createWorkspace = () => {
    modal('Create Workspace', createModalMessage(), {
      label: 'OK',
      fn: onFinishCreateWorkspace
    }, {
      label: '',
      fn: () => {}
    })
  }

  const deleteCurrentWorkspace = () => {
    modal('Delete Current Workspace', 'Are you sure to delete the current workspace?', {
      label: 'OK',
      fn: onFinishDeleteWorkspace
    }, {
      label: '',
      fn: () => {}
    })
  }

  const modalMessage = (title: string, body: string) => {
    setTimeout(() => { // wait for any previous modal a chance to close
      modal(title, body, {
        label: 'OK',
        fn: () => {}
      }, null)
    }, 200)
  }

  const workspaceRenameInput = useRef()
  const workspaceCreateInput = useRef()

  const onFinishRenameWorkspace = async () => {
    if (workspaceRenameInput.current === undefined) return
    // @ts-ignore: Object is possibly 'null'.
    const workspaceName = workspaceRenameInput.current.value

    try {
      await props.renameWorkspace(state.currentWorkspace, workspaceName)
      setWorkspace(workspaceName)
      props.workspaceRenamed({ name: workspaceName })
    } catch (e) {
      modalMessage('Rename Workspace', e.message)
      console.error(e)
    }
  }

  const onFinishCreateWorkspace = async () => {
    if (workspaceCreateInput.current === undefined) return
    // @ts-ignore: Object is possibly 'null'.
    const workspaceName = workspaceCreateInput.current.value

    try {
      await props.createWorkspace(workspaceName)
      await setWorkspace(workspaceName)
    } catch (e) {
      modalMessage('Create Workspace', e.message)
      console.error(e)
    }
  }

  const onFinishDeleteWorkspace = async () => {
    const workspacesPath = props.workspace.workspacesPath
    props.browser.remove(workspacesPath + '/' + state.currentWorkspace)
    const name = state.currentWorkspace
    setWorkspace(NO_WORKSPACE)
    props.workspaceDeleted({ name })
  }
  /** ** ****/

  const resetFocus = (reset) => {
    setState(prevState => {
      return { ...prevState, reset }
    })
  }

  const setWorkspace = async (name) => {
    props.setWorkspace({ name, isLocalhost: name === LOCALHOST })
    if (name === LOCALHOST) {
      props.workspace.clearWorkspace()
    } else if (name === NO_WORKSPACE) {
      props.workspace.clearWorkspace()
    } else {
      props.workspace.setWorkspace(name)
    }
    props.plugin.getWorkspaces()
    setState(prevState => {
      return { ...prevState, currentWorkspace: name }
    })
  }

  const remixdExplorer = {
    hide: () => {
      if (state.currentWorkspace === LOCALHOST) setWorkspace(NO_WORKSPACE)
      props.fileManager.setMode('browser')
      setState(prevState => {
        return { ...prevState, hideRemixdExplorer: true, loadingLocalhost: false }
      })
    },
    show: () => {
      props.fileManager.setMode('localhost')
      setState(prevState => {
        return { ...prevState, hideRemixdExplorer: false, loadingLocalhost: false }
      })
    },
    loading: () => {
      setState(prevState => {
        return { ...prevState, loadingLocalhost: true }
      })
    }
  }

  const handleHideModal = () => {
    setState(prevState => {
      return { ...prevState, modal: { ...state.modal, hide: true, message: null } }
    })
  }

  const modal = async (title: string, message: string | JSX.Element, ok: { label: string, fn: () => void }, cancel: { label: string, fn: () => void }) => {
    await setState(prevState => {
      return {
        ...prevState,
        modal: {
          ...prevState.modal,
          hide: false,
          message,
          title,
          ok,
          cancel,
          handleHide: handleHideModal
        }
      }
    })
  }

  const createModalMessage = () => {
    return (
      <>
        <span>{ state.modal.message }</span>
        <input type="text" data-id="modalDialogCustomPromptTextCreate" defaultValue={`workspace_${Date.now()}`} ref={workspaceCreateInput} className="form-control" />
      </>
    )
  }

  const renameModalMessage = () => {
    return (
      <>
        <span>{ state.modal.message }</span>
        <input type="text" data-id="modalDialogCustomPromptTextRename" defaultValue={ state.currentWorkspace } ref={workspaceRenameInput} className="form-control" />
      </>
    )
  }

  return (
    <div className='remixui_container'>
      <ModalDialog
        id='workspacesModalDialog'
        title={ state.modal.title }
        message={ state.modal.message }
        hide={ state.modal.hide }
        ok={ state.modal.ok }
        cancel={ state.modal.cancel }
        handleHide={ handleHideModal }>
        { (typeof state.modal.message !== 'string') && state.modal.message }
      </ModalDialog>
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
                  hidden={state.currentWorkspace === LOCALHOST || state.currentWorkspace === NO_WORKSPACE}
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
                  hidden={state.currentWorkspace === LOCALHOST || state.currentWorkspace === NO_WORKSPACE}
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
              <select id="workspacesSelect" value={state.currentWorkspace} data-id="workspacesSelect" onChange={(e) => setWorkspace(e.target.value)} className="form-control custom-select">
                {
                  state.workspaces
                    .map((folder, index) => {
                      return <option key={index} value={folder}>{folder}</option>
                    })
                }
                <option value={LOCALHOST}>{state.currentWorkspace === LOCALHOST ? 'localhost' : LOCALHOST}</option>
                { state.workspaces.length <= 0 && <option value={NO_WORKSPACE}>{NO_WORKSPACE}</option> }
              </select>
            </div>
          </header>
        </div>
        <div className='remixui_fileExplorerTree'>
          <div>
            <div className='pl-2 remixui_treeview' data-id='filePanelFileExplorerTree'>
              { state.hideRemixdExplorer && state.currentWorkspace && state.currentWorkspace !== NO_WORKSPACE && state.currentWorkspace !== LOCALHOST &&
                  <FileExplorer
                    name={state.currentWorkspace}
                    registry={props.registry}
                    filesProvider={props.workspace}
                    menuItems={['createNewFile', 'createNewFolder', 'publishToGist', canUpload ? 'uploadFile' : '']}
                    plugin={props.plugin}
                    focusRoot={state.reset}
                    contextMenuItems={props.registeredMenuItems}
                    displayInput={state.displayNewFile}
                    externalUploads={state.uploadFileEvent}
                  />
              }
            </div>
            {
              state.loadingLocalhost ? <div className="text-center py-5"><i className="fas fa-spinner fa-pulse fa-2x"></i></div>
                : <div className='pl-2 filesystemexplorer remixui_treeview'>
                  { !state.hideRemixdExplorer &&
                      <FileExplorer
                        name='localhost'
                        registry={props.registry}
                        filesProvider={props.localhost}
                        menuItems={['createNewFile', 'createNewFolder']}
                        plugin={props.plugin}
                        focusRoot={state.reset}
                        contextMenuItems={props.registeredMenuItems}
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
