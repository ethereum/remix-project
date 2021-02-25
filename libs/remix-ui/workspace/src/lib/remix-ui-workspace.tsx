import React, { useState, useEffect, useRef } from 'react';
import ethutil from 'ethereumjs-util'
import { FileExplorer } from '@remix-ui/file-explorer' // eslint-disable-line
import './remix-ui-workspace.css';
import { ModalDialog } from '@remix-ui/modal-dialog' // eslint-disable-line

type CodeExamples = {
  [key: string]: { name: string, content: string }
};
/* eslint-disable-next-line */
export interface WorkspaceProps {
  setWorkspace: ({ name: string, isLocalhost: boolean }) => void,
  workspaceRenamed: ({ name: string }) => void,
  workspaceCreated: ({ name: string }) => void,
  workspaceDeleted: ({ name: string }) => void,
  workspace: any // workspace provider,
  browser: any // browser provider
  localhost: any // localhost provider
  fileManager : any
  examples: CodeExamples,
  queryParams: any // URL parameters
  gistHandler: any // handle load gist
  registry: any // registry
  plugin: any // plugin call and resetFocus
  request: any // api request,
  workspaces: any,
  registeredMenuItems: [] // menu items
}

var canUpload = window.File || window.FileReader || window.FileList || window.Blob
export const Workspace = (props: WorkspaceProps) => {
  const LOCALHOST = ' - connect to localhost - '
  const NO_WORKSPACE = ' - none - '

  /* extends the parent 'plugin' with some function needed by the file explorer */
  props.plugin.resetFocus = () => {
    setState(prevState => {
      return { ...prevState, reset: true }
    })
  }

  props.plugin.resetNewFile = () => {
    setState(prevState => {
      return { ...prevState, displayNewFile: !state.displayNewFile }
    })
  }

  /* implement an external API, consumed by the parent */
  props.request.createWorkspace = () => {
    return createWorkspace()
  }

  // props.request.getWorkspaces = () => {
  //   return getWorkspaces()
  // }

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

  useEffect(() => { initWorkspace() }, [])

  useEffect(() => {
    const getWorkspaces = async () => {
      if (props.workspaces && Array.isArray(props.workspaces)) {
        if (props.workspaces.length > 0 && state.currentWorkspace === NO_WORKSPACE) {
          props.workspace.setWorkspace(props.workspaces[0])
          setState(prevState => {
            return { ...prevState, workspaces: props.workspaces, currentWorkspace: props.workspaces[0] }
          })
        } else {
          props.workspace.clearWorkspace()
          setState(prevState => {
            return { ...prevState, workspaces: props.workspaces, currentWorkspace: NO_WORKSPACE }
          })
        }
      }
    }

    getWorkspaces()
  }, [props.workspaces])

  const [state, setState] = useState({
    workspaces: [],
    reset: false,
    currentWorkspace: NO_WORKSPACE,
    hideRemixdExplorer: true,
    displayNewFile: false,
    externalUploads: null,
    uploadFileEvent: null,
    renameModal: {
      id: 'renameWorkspace',
      hide: true,
      title: 'Rename Workspace',
      message: 'Please choose a name for the workspace',
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
    deleteModal: {
      id: 'deleteWorkspace',
      hide: true,
      title: 'Remove Workspace',
      message: 'Please confirm workspace deletion',
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
    createModal: {
      id: 'createWorkspace',
      hide: true,
      title: 'Create Workspace',
      message: 'Please choose a name for the workspace',
      ok: {
        label: '',
        fn: () => {}
      },
      cancel: {
        label: '',
        fn: () => {}
      },
      handleHide: null
    }
  })

  /* workspace creation, renaming and deletion */

  const renameCurrentWorkspace = () => {
    setState(prevState => {
      return {
        ...prevState,
        renameModal: {
          ...prevState.renameModal,
          hide: false,
          ok: {
            label: '',
            fn: () => onFinishRenameWorkspace()
          },
          cancel: {
            label: '',
            fn: () => {}
          },
          handleHide: () => {
            setState(prevState => {
              return { ...prevState, renameModal: {...prevState.renameModal, hide: true }  } 
            })   
          }
        },
      }
    })
  }

  const createWorkspace = () => {
    setState(prevState => {
      return {
        ...prevState,
        createModal: {
          ...prevState.createModal,
          hide: false,
          ok: {
            label: '',
            fn: () => onFinishCreateWorkspace()
          },
          cancel: {
            label: '',
            fn: () => {}
          },
          handleHide: () => {
            setState(prevState => {
              return { ...prevState, createModal: {...prevState.createModal, hide: true }  } 
            })   
          }
        }
      }
    })
  }

  const deleteCurrentWorkspace = () => {
    setState(prevState => {
      return {
        ...prevState,
        deleteModal: {
          ...prevState.deleteModal,
          hide: false,
          ok: {
            label: '',
            fn: () => onFinishDeleteWorkspace()
          },
          cancel: {
            label: '',
            fn: () => {}
          },
          handleHide: () => {
            setState(prevState => {
              return { ...prevState, deleteModal: {...prevState.deleteModal, hide: true }  } 
            })   
          }
        },
      }
    })
  }

  const workspaceRenameInput = useRef()
  const workspaceCreateInput = useRef()

  const onFinishRenameWorkspace = async () => {
    if (workspaceRenameInput.current === undefined) return
    // @ts-ignore: Object is possibly 'null'.
    const workspaceName = workspaceRenameInput.current.value
    const workspacesPath = props.workspace.workspacesPath
    await props.fileManager.rename('browser/' + workspacesPath + '/' + state.currentWorkspace, 'browser/' + workspacesPath + '/' + workspaceName)
    setWorkspace(workspaceName)
    props.workspaceRenamed({ name: state.currentWorkspace })
  }

  const onFinishCreateWorkspace = async () => {
    if (workspaceCreateInput.current === undefined) return
    // @ts-ignore: Object is possibly 'null'.
    const workspaceName = workspaceCreateInput.current.value
    const workspacesPath = props.workspace.workspacesPath
    props.browser.createDir(workspacesPath + '/' + workspaceName, async () => {
      setWorkspace(workspaceName)
      for (const file in props.examples) {
        await props.fileManager.writeFile(`${props.examples[file].name}`, props.examples[file].content)
      }
      props.workspaceCreated({ name: state.currentWorkspace })
    })
  }

  const onFinishDeleteWorkspace = async () => {
    const workspacesPath = props.workspace.workspacesPath
    props.browser.remove(workspacesPath + '/' + state.currentWorkspace)
    const name = state.currentWorkspace
    setWorkspace(NO_WORKSPACE)
    props.workspaceDeleted({ name })    
  }
  /**** ****/

  const resetFocus = (reset) => {
    setState(prevState => {
      return { ...prevState, reset }
    })
  }  

  const setWorkspace = async (name) => {
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
    props.setWorkspace({ name, isLocalhost: name === LOCALHOST })
  }

  const initWorkspace = async () => {
    const workspacesPath = props.workspace.workspacesPath
    const params = props.queryParams.get()
    // get the file from gist
    const loadedFromGist = props.gistHandler.loadFromGist(params, props.fileManager)
    if (loadedFromGist) return
    if (params.code) {
      try {
        await props.fileManager.createWorkspace('code-sample')
        var hash = ethutil.bufferToHex(ethutil.keccak(params.code))
        const fileName = 'contract-' + hash.replace('0x', '').substring(0, 10) + '.sol'
        const path = 'browser/' + workspacesPath + '/code-sample/' + fileName
        await props.fileManager.writeFile(path, atob(params.code))
        setWorkspace('code-sample')
        await props.fileManager.openFile(path)
      } catch (e) {
        console.error(e)
      }
      return
    }
    // insert example contracts if there are no files to show
    props.browser.resolveDirectory('/', async (error, filesList) => {
      if (error) console.error(error)
      if (Object.keys(filesList).length === 0) {
        for (const file in props.examples) {
          try {
            await props.fileManager.writeFile('browser/' + workspacesPath + '/default_workspace/' + props.examples[file].name, props.examples[file].content)
          } catch (error) {
            console.error(error)
          }
        }
        props.plugin.getWorkspaces()
      }
    })
  }

  const remixdExplorer = {
    hide: () => {
      if (state.currentWorkspace === LOCALHOST) setWorkspace(NO_WORKSPACE)
      props.fileManager.setMode('browser')
      setState(prevState => {
        return { ...prevState, hideRemixdExplorer: true }
      })
    },
    show: () => {
      props.fileManager.setMode('localhost')
      setState(prevState => {
        return { ...prevState, hideRemixdExplorer: false }
      })
    }
  }

  props.localhost.event.register('connecting', (event) => {})

  props.localhost.event.register('connected', (event) => {
    remixdExplorer.show()
  })

  props.localhost.event.register('errored', (event) => {
    remixdExplorer.hide()
  })

  props.localhost.event.register('closed', (event) => {
    remixdExplorer.hide()
  })
  
  return (
    <div className='remixui_container'>
        <ModalDialog 
          id={ state.renameModal.id }
          title={ state.renameModal.title }
          hide={ state.renameModal.hide }
          ok={ state.renameModal.ok }
          cancel={ state.renameModal.cancel }
          handleHide={ state.renameModal.handleHide }>
           <span>{ state.renameModal.message }</span>
           <input placeholder={ state.currentWorkspace } ref={workspaceRenameInput} className="form-control" />
        </ModalDialog>
        <ModalDialog 
          id={ state.createModal.id }
          title={ state.createModal.title }
          hide={ state.createModal.hide }
          ok={ state.createModal.ok }
          cancel={ state.createModal.cancel }
          handleHide={ state.createModal.handleHide }>
            <span>{ state.createModal.message }</span>
            <input placeholder={ `workspace_${Date.now()}` } ref={workspaceCreateInput} className="form-control" />
        </ModalDialog>
        <ModalDialog 
          id={ state.deleteModal.id }
          title={ state.deleteModal.title }
          message={ state.deleteModal.message }
          hide={ state.deleteModal.hide }
          ok={ state.deleteModal.ok }
          cancel={ state.deleteModal.cancel }
          handleHide={ state.deleteModal.handleHide }>
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
                    title='Create a new Workspace'>
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
                    title='Rename current Workspace'>
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
                    title='Delete current Workspace'>
                  </span>
                </span>
                <select id="workspacesSelect" data-id="workspacesSelect" onChange={(e) => setWorkspace(e.target.value)} className="form-control custom-select">
                {
                  state.workspaces
                  .map((folder) => {
                    return <option selected={state.currentWorkspace === folder} value={folder}>{folder}</option>
                  })
                }
                <option selected={state.currentWorkspace === LOCALHOST} value={LOCALHOST}>{LOCALHOST}</option>
                { state.workspaces.length <= 0 && <option selected={state.currentWorkspace === NO_WORKSPACE} value={NO_WORKSPACE}>{NO_WORKSPACE}</option> }
                </select>
              </div>
            </header>
          </div>
          <div className='remixui_fileExplorerTree'>
            <div>
              <div className='pl-2 remixui_treeview' data-id='filePanelFileExplorerTree'>
                { state.hideRemixdExplorer && state.currentWorkspace && state.currentWorkspace !== NO_WORKSPACE &&
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
              <div className='pl-2 filesystemexplorer remixui_treeview'>
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
              <div className='pl-2 remixui_treeview'>
                { false && <FileExplorer
                  name='browser'
                  registry={props.registry}
                  filesProvider={props.browser}
                  menuItems={['createNewFile', 'createNewFolder', 'publishToGist', canUpload ? 'uploadFile' : '']}
                  plugin={props.plugin}
                  focusRoot={state.reset}
                  contextMenuItems={props.registeredMenuItems}
                  displayInput={state.displayNewFile}
                  externalUploads={state.uploadFileEvent}
                />
                }
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Workspace;
