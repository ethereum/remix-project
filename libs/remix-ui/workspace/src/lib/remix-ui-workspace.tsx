import React, { useState, useEffect, useRef } from 'react' // eslint-disable-line
import { FileExplorer } from '@remix-ui/file-explorer' // eslint-disable-line
import './remix-ui-workspace.css'
import { ModalDialog } from '@remix-ui/modal-dialog' // eslint-disable-line
import { Toaster } from '@remix-ui/toaster'// eslint-disable-line
import { MenuItems } from 'libs/remix-ui/file-explorer/src/lib/types'

/* eslint-disable-next-line */
export interface WorkspaceProps {
  setWorkspace: ({ name: string, isLocalhost: boolean }, setEvent: boolean) => void,
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
  registeredMenuItems: MenuItems // menu items
  removedMenuItems: MenuItems
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

  props.request.setWorkspace = (workspaceName) => {
    return setWorkspace(workspaceName)
  }

  props.request.createNewFile = async () => {
    if (!state.workspaces.length) await createNewWorkspace('default_workspace')
    props.plugin.resetNewFile()
  }

  props.request.uploadFile = async (target) => {
    if (!state.workspaces.length) await createNewWorkspace('default_workspace')

    setState(prevState => {
      return { ...prevState, uploadFileEvent: target }
    })
  }

  props.request.getCurrentWorkspace = () => {
    return { name: state.currentWorkspace, isLocalhost: state.currentWorkspace === LOCALHOST, absolutePath: `${props.workspace.workspacesPath}/${state.currentWorkspace}` }
  }

  useEffect(() => {
    let getWorkspaces = async () => {
      if (props.workspaces && Array.isArray(props.workspaces)) {
        if (props.workspaces.length > 0 && state.currentWorkspace === NO_WORKSPACE) {
          const currentWorkspace = props.workspace.getWorkspace() ? props.workspace.getWorkspace() : props.workspaces[0]
          await props.workspace.setWorkspace(currentWorkspace)
          setState(prevState => {
            return { ...prevState, workspaces: props.workspaces, currentWorkspace }
          })
        } else {
          setState(prevState => {
            return { ...prevState, workspaces: props.workspaces }
          })
        }
      }
    }

    getWorkspaces()

    return () => {
      getWorkspaces = async () => {}
    }
  }, [props.workspaces])

  const localhostDisconnect = () => {
    if (state.currentWorkspace === LOCALHOST) setWorkspace(props.workspaces.length > 0 ? props.workspaces[0] : NO_WORKSPACE)
    // This should be removed some time after refactoring: https://github.com/ethereum/remix-project/issues/1197
    else {
      setWorkspace(state.currentWorkspace) // Useful to switch to last selcted workspace when remixd is disconnected
      props.fileManager.setMode('browser')
    }
  }

  useEffect(() => {
    props.localhost.event.off('disconnected', localhostDisconnect)
    props.localhost.event.on('disconnected', localhostDisconnect)
    props.localhost.event.on('connected', () => {
      remixdExplorer.show()
      setWorkspace(LOCALHOST)
    })

    props.localhost.event.on('disconnected', () => {
      remixdExplorer.hide()
    })

    props.localhost.event.on('loading', () => {
      remixdExplorer.loading()
    })

    props.workspace.event.on('createWorkspace', (name) => {
      createNewWorkspace(name)
    })

    if (props.initialWorkspace) {
      props.workspace.setWorkspace(props.initialWorkspace)
      setState(prevState => {
        return { ...prevState, currentWorkspace: props.initialWorkspace }
      })
    }
  }, [])

  const createNewWorkspace = async (workspaceName) => {
    try {
      await props.fileManager.closeAllFiles()
      await props.createWorkspace(workspaceName)
      await setWorkspace(workspaceName)
      toast('New default workspace has been created.')
    } catch (e) {
      modalMessage('Create Default Workspace', e.message)
      console.error(e)
    }
  }

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
      okLabel: '',
      okFn: () => {},
      cancelLabel: '',
      cancelFn: () => {},
      handleHide: null
    },
    loadingLocalhost: false,
    toasterMsg: ''
  })

  const toast = (message: string) => {
    setState(prevState => {
      return { ...prevState, toasterMsg: message }
    })
  }

  /* workspace creation, renaming and deletion */

  const renameCurrentWorkspace = () => {
    modal('Rename Current Workspace', renameModalMessage(), 'OK', onFinishRenameWorkspace, '', () => {})
  }

  const createWorkspace = () => {
    modal('Create Workspace', createModalMessage(), 'OK', onFinishCreateWorkspace, '', () => {})
  }

  const deleteCurrentWorkspace = () => {
    modal('Delete Current Workspace', 'Are you sure to delete the current workspace?', 'OK', onFinishDeleteWorkspace, '', () => {})
  }

  const modalMessage = (title: string, body: string) => {
    setTimeout(() => { // wait for any previous modal a chance to close
      modal(title, body, 'OK', () => {}, '', null)
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
      await props.fileManager.closeAllFiles()
      await props.createWorkspace(workspaceName)
      await setWorkspace(workspaceName)
    } catch (e) {
      modalMessage('Create Workspace', e.message)
      console.error(e)
    }
  }

  const onFinishDeleteWorkspace = async () => {
    await props.fileManager.closeAllFiles()
    const workspacesPath = props.workspace.workspacesPath
    await props.browser.remove(workspacesPath + '/' + state.currentWorkspace)
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
    await props.fileManager.closeAllFiles()
    if (name === LOCALHOST) {
      props.workspace.clearWorkspace()
    } else if (name === NO_WORKSPACE) {
      props.workspace.clearWorkspace()
    } else {
      await props.workspace.setWorkspace(name)
    }
    await props.setWorkspace({ name, isLocalhost: name === LOCALHOST }, !(name === LOCALHOST || name === NO_WORKSPACE))
    props.plugin.getWorkspaces()
    setState(prevState => {
      return { ...prevState, currentWorkspace: name }
    })
  }

  const remixdExplorer = {
    hide: async () => {
      // If 'connect to localhost' is clicked from home tab, mode is not 'localhost'
      // if (props.fileManager.mode === 'localhost') {
      await setWorkspace(NO_WORKSPACE)
      props.fileManager.setMode('browser')
      setState(prevState => {
        return { ...prevState, hideRemixdExplorer: true, loadingLocalhost: false }
      })
      // } else {
      //   // Hide spinner in file explorer
      //   setState(prevState => {
      //     return { ...prevState, loadingLocalhost: false }
      //   })
      // }
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

  const modal = async (title: string, message: string | JSX.Element, okLabel: string, okFn: () => void, cancelLabel: string, cancelFn: () => void) => {
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
          cancelFn,
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
        okLabel={ state.modal.okLabel }
        okFn={ state.modal.okFn }
        cancelLabel={ state.modal.cancelLabel }
        cancelFn={ state.modal.cancelFn }
        handleHide={ handleHideModal }>
        { (typeof state.modal.message !== 'string') && state.modal.message }
      </ModalDialog>
      <Toaster message={state.toasterMsg} />
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
                    removedContextMenuItems={props.removedMenuItems}
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
                        removedContextMenuItems={props.removedMenuItems}
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
