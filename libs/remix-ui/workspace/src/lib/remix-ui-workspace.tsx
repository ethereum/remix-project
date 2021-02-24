import React, { useState, useEffect } from 'react';
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
  renameWorkspace: ({ name: string }) => void,
  createWorkspace: ({ name: string }) => void,
  deleteWorkspace: ({ name: string }) => void,
  workspace: any // workspace provider,
  browser: any // browser provider
  localhost: any // localhost provider
  fileManager : any
  examples: CodeExamples,
  queryParams: any // URL parameters
  gistHandler: any // handle load gist
  registry: any // registry
  plugin: any // plugin call and resetFocus
  request: any // api request
}

var canUpload = window.File || window.FileReader || window.FileList || window.Blob

export const Workspace = (props: WorkspaceProps) => {
  const LOCALHOST = ' - connect to localhost - '
  const NO_WORKSPACE = ' - none - '

  props.request.createWorkspace = () => {
    createWorkspace()
  }

  props.request.getWorkspaces = () => {
    return getWorkspaces()
  }

  props.request.createNewFile = () => {
    setState(prevState => {
      return { ...prevState, displayNewFile: true }
    })
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
   initWorkspace()
  }, [])

  const handleHideCreateModal = () => {
    setState(prevState => {
      state.createModal.hide = true
      return { ...prevState, ...state.createModal }
    })
  }  

  const handleHideDeleteModal = () => {
    setState(prevState => {
      state.deleteModal.hide = true
      return { ...prevState, ...state.deleteModal }
    })
  }  

  const handleHideRenameModal = () => {
    setState(prevState => {
      state.renameModal.hide = true
      return { ...prevState, ...state.renameModal }
    })
  }

  const createWorkspace = () => {
    setState(prevState => {
      state.createModal.hide = false
      return { ...prevState, ...state.createModal }
    })
  }

  const renameCurrentWorkspace = () => {
    setState(prevState => {
      state.renameModal.hide = false
      return { ...prevState, ...state.renameModal }
    })
  }  

  const deleteCurrentWorkspace = () => {
    setState(prevState => {
      state.deleteModal.hide = false
      return { ...prevState, ...state.deleteModal }
    })
  }

  const [state, setState] = useState({
    workspaces: [],
    reset: false,
    currentWorkspace: NO_WORKSPACE,
    hideRemixdExplorer: true,
    registeredMenuItems: [],
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
        fn: () => onFinishRenameWorkspace()
      },
      cancel: {
        label: '',
        fn: () => {}
      },
      handleHide: handleHideRenameModal
    },
    deleteModal: {
      id: 'deleteWorkspace',
      hide: true,
      title: 'Remove Workspace',
      message: 'Please confirm workspace deletion',
      ok: {
        label: '',
        fn: () => onFinishDeleteWorkspace()
      },
      cancel: {
        label: '',
        fn: () => {}
      },
      handleHide: handleHideDeleteModal
    },
    createModal: {
      id: 'createWorkspace',
      hide: true,
      title: 'Create Workspace',
      message: 'Please choose a name for the workspace',
      ok: {
        label: '',
        fn: () => onFinishCreateWorkspace()
      },
      cancel: {
        label: '',
        fn: () => {}
      },
      handleHide: handleHideCreateModal
    }
  })

  let worspaceNewName // used for renaming and creation

  const onFinishRenameWorkspace = async () => {
    const workspacesPath = props.workspace.workspacesPath
    await props.fileManager.rename('browser/' + workspacesPath + '/' + state.currentWorkspace, 'browser/' + workspacesPath + '/' + worspaceNewName)
    setWorkspace(worspaceNewName)    
    worspaceNewName = ''
    props.renameWorkspace({ name: state.currentWorkspace })
  }

  const onFinishCreateWorkspace = async () => {
    const workspacesPath = props.workspace.workspacesPath
    props.browser.createDir(workspacesPath + '/' + worspaceNewName, async () => {
      setWorkspace(worspaceNewName)
      for (const file in props.examples) {
        await props.fileManager.writeFile(`${props.examples[file].name}`, props.examples[file].content)
      }
      worspaceNewName = ''
      props.createWorkspace({ name: state.currentWorkspace })
    })
  }

  const onFinishDeleteWorkspace = async () => {
    const workspacesPath = props.workspace.workspacesPath
    props.browser.remove(workspacesPath + '/' + state.currentWorkspace)
    const name = state.currentWorkspace
    setWorkspace(NO_WORKSPACE)
    props.deleteWorkspace({ name })    
  }

  const resetFocus = (reset) => {
    /*setState(prevState => {
      return { ...prevState, reset }
    })*/
  }  

  const setWorkspace = async (name) => {        
    if (name === LOCALHOST) {
      props.workspace.clearWorkspace()
    } else if (name === NO_WORKSPACE) {
      props.workspace.clearWorkspace()
    } else {
      props.workspace.setWorkspace(name)
    }
    const workspaces = await getWorkspaces()
    setState(prevState => {
      return { ...prevState, workspaces, currentWorkspace: name }
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
          await props.fileManager.writeFile('browser/' + workspacesPath + '/default_workspace/' + props.examples[file].name, props.examples[file].content)
        }
        setWorkspace('default_workspace')
      } else {
        // we've already got some workspaces
        const workspaces = await getWorkspaces()
        if (workspaces.length) setWorkspace(workspaces[0])
        else setWorkspace(NO_WORKSPACE)
      }
    })
  }

  const getWorkspaces = (): any => {
    return new Promise((resolve, reject) => {
      const workspacesPath = props.workspace.workspacesPath
      props.browser.resolveDirectory('/' + workspacesPath, (error, items) => {
        if (error) return reject(error)
        resolve(Object.keys(items)
          .filter((item) => items[item].isDirectory)
          .map((folder) => folder.replace(workspacesPath + '/', '')))
      })
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

  props.plugin.resetFocus = () => {
    setState(prevState => {
      return { ...prevState, reset: true }
    })
  }
  
  return (
    <div className='remixui_container'>
        <ModalDialog 
          id={ state.renameModal.id }
          title={ state.renameModal.title }
          message={ state.renameModal.message }
          hide={ state.renameModal.hide }
          ok={ state.renameModal.ok }
          cancel={ state.renameModal.cancel }
          handleHide={ handleHideRenameModal }>
          <input placeholder={ state.currentWorkspace } onChange={(e) => { worspaceNewName = e.target.value }  }/>
        </ModalDialog>
        <ModalDialog 
          id={ state.createModal.id }
          title={ state.createModal.title }
          message={ state.createModal.message }
          hide={ state.createModal.hide }
          ok={ state.createModal.ok }
          cancel={ state.createModal.cancel }
          handleHide={ handleHideCreateModal }>
          <input placeholder={ `workspace_${Date.now()}` } onChange={(e) => { worspaceNewName = e.target.value }  }/>
        </ModalDialog>
        <ModalDialog 
          id={ state.deleteModal.id }
          title={ state.deleteModal.title }
          message={ state.deleteModal.message }
          hide={ state.deleteModal.hide }
          ok={ state.deleteModal.ok }
          cancel={ state.deleteModal.cancel }
          handleHide={ handleHideDeleteModal }>
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
                <option selected={state.currentWorkspace === NO_WORKSPACE} value={NO_WORKSPACE}>{NO_WORKSPACE}</option>
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
                    contextMenuItems={state.registeredMenuItems}
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
                    contextMenuItems={state.registeredMenuItems}
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
                  contextMenuItems={state.registeredMenuItems}
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
