import React, { useEffect, useState, useRef, useReducer } from 'react' // eslint-disable-line
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd' // eslint-disable-line
import { TreeView, TreeViewItem } from '@remix-ui/tree-view' // eslint-disable-line
import { ModalDialog } from '@remix-ui/modal-dialog' // eslint-disable-line
import { Toaster } from '@remix-ui/toaster' // eslint-disable-line
import Gists from 'gists'
import { FileExplorerMenu } from './file-explorer-menu' // eslint-disable-line
import { FileExplorerContextMenu } from './file-explorer-context-menu' // eslint-disable-line
import { FileExplorerProps, File } from './types'
import { fileSystemReducer, fileSystemInitialState } from './reducers/fileSystem'
import { fetchDirectory, init, resolveDirectory, addInputField, removeInputField } from './actions/fileSystem'
import * as helper from '../../../../../apps/remix-ide/src/lib/helper'
import QueryParams from '../../../../../apps/remix-ide/src/lib/query-params'

import './css/file-explorer.css'

const queryParams = new QueryParams()

export const FileExplorer = (props: FileExplorerProps) => {
  const { name, registry, plugin, focusRoot, contextMenuItems, displayInput, externalUploads } = props
  const [state, setState] = useState({
    focusElement: [{
      key: '',
      type: 'folder'
    }],
    focusPath: null,
    files: [],
    fileManager: null,
    ctrlKey: false,
    newFileName: '',
    actions: [{
      id: 'newFile',
      name: 'New File',
      type: ['folder'],
      path: [],
      extension: [],
      pattern: []
    }, {
      id: 'newFolder',
      name: 'New Folder',
      type: ['folder'],
      path: [],
      extension: [],
      pattern: []
    }, {
      id: 'rename',
      name: 'Rename',
      type: ['file', 'folder'],
      path: [],
      extension: [],
      pattern: []
    }, {
      id: 'delete',
      name: 'Delete',
      type: ['file', 'folder'],
      path: [],
      extension: [],
      pattern: []
    }, {
      id: 'pushChangesToGist',
      name: 'Push changes to gist',
      type: [],
      path: [],
      extension: [],
      pattern: ['^browser/gists/([0-9]|[a-z])*$']
    }, {
      id: 'run',
      name: 'Run',
      type: [],
      path: [],
      extension: ['.js'],
      pattern: []
    }],
    focusContext: {
      element: null,
      x: null,
      y: null,
      type: ''
    },
    focusEdit: {
      element: null,
      type: '',
      isNew: false,
      lastEdit: ''
    },
    expandPath: [name],
    focusModal: {
      hide: true,
      title: '',
      message: '',
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
    modals: [],
    toasterMsg: '',
    mouseOverElement: null,
    showContextMenu: false
  })
  const [fileSystem, dispatch] = useReducer(fileSystemReducer, fileSystemInitialState)
  const editRef = useRef(null)

  useEffect(() => {
    if (props.filesProvider) {
      init(props.filesProvider, props.name, props.plugin, props.registry)(dispatch)
    }
  }, [props.filesProvider, props.name])

  useEffect(() => {
    const provider = fileSystem.provider.provider

    if (provider) {
      fetchDirectory(provider, props.name)(dispatch)
    }
  }, [fileSystem.provider.provider, props.name])

  useEffect(() => {
    if (fileSystem.notification.message) {
      modal(fileSystem.notification.title, fileSystem.notification.message, {
        label: fileSystem.notification.labelOk,
        fn: fileSystem.notification.actionOk
      }, {
        label: fileSystem.notification.labelCancel,
        fn: fileSystem.notification.actionCancel
      })
    }
  }, [fileSystem.notification.message])

  useEffect(() => {
    if (fileSystem.files.expandPath.length > 0) {
      setState(prevState => {
        return { ...prevState, expandPath: [...new Set([...prevState.expandPath, ...fileSystem.files.expandPath])] }
      })
    }
  }, [fileSystem.files.expandPath])

  useEffect(() => {
    if (state.focusEdit.element) {
      setTimeout(() => {
        if (editRef && editRef.current) {
          editRef.current.focus()
        }
      }, 150)
    }
  }, [state.focusEdit.element])

  useEffect(() => {
    (async () => {
      const fileManager = registry.get('filemanager').api

      setState(prevState => {
        return { ...prevState, fileManager, expandPath: [name] }
      })
    })()
  }, [name])

  useEffect(() => {
    if (focusRoot) {
      setState(prevState => {
        return { ...prevState, focusElement: [{ key: '', type: 'folder' }] }
      })
      plugin.resetFocus(false)
    }
  }, [focusRoot])

  useEffect(() => {
    if (contextMenuItems) {
      setState(prevState => {
        // filter duplicate items
        const items = contextMenuItems.filter(({ name }) => prevState.actions.findIndex(action => action.name === name) === -1)

        return { ...prevState, actions: [...prevState.actions, ...items] }
      })
    }
  }, [contextMenuItems])

  useEffect(() => {
    if (displayInput) {
      handleNewFileInput()
      plugin.resetNewFile()
    }
  }, [displayInput])

  useEffect(() => {
    if (externalUploads) {
      uploadFile(externalUploads)
      plugin.resetUploadFile()
    }
  }, [externalUploads])

  useEffect(() => {
    if (state.modals.length > 0) {
      setState(prevState => {
        const focusModal = {
          hide: false,
          title: prevState.modals[0].title,
          message: prevState.modals[0].message,
          ok: prevState.modals[0].ok,
          cancel: prevState.modals[0].cancel,
          handleHide: prevState.modals[0].handleHide
        }

        prevState.modals.shift()
        return {
          ...prevState,
          focusModal,
          modals: prevState.modals
        }
      })
    }
  }, [state.modals])

  const extractNameFromKey = (key: string):string => {
    const keyPath = key.split('/')

    return keyPath[keyPath.length - 1]
  }

  const extractParentFromKey = (key: string):string => {
    if (!key) return
    const keyPath = key.split('/')
    keyPath.pop()

    return keyPath.join('/')
  }

  const createNewFile = async (newFilePath: string) => {
    const fileManager = state.fileManager

    try {
      const newName = await helper.createNonClashingNameAsync(newFilePath, fileManager)
      const createFile = await fileManager.writeFile(newName, '')

      if (!createFile) {
        return toast('Failed to create file ' + newName)
      } else {
        const path = newName.indexOf(props.name + '/') === 0 ? newName.replace(props.name + '/', '') : newName

        await fileManager.open(path)
        setState(prevState => {
          return { ...prevState, focusElement: [{ key: newName, type: 'file' }] }
        })
      }
    } catch (error) {
      return modal('File Creation Failed', typeof error === 'string' ? error : error.message, {
        label: 'Close',
        fn: async () => {}
      }, null)
    }
  }

  const createNewFolder = async (newFolderPath: string) => {
    const fileManager = state.fileManager
    const dirName = newFolderPath + '/'

    try {
      const exists = await fileManager.exists(dirName)

      if (exists) {
        return modal('Rename File Failed', `A file or folder ${extractNameFromKey(newFolderPath)} already exists at this location. Please choose a different name.`, {
          label: 'Close',
          fn: () => {}
        }, null)
      }
      await fileManager.mkdir(dirName)
      setState(prevState => {
        return { ...prevState, focusElement: [{ key: newFolderPath, type: 'folder' }] }
      })
    } catch (e) {
      return modal('Folder Creation Failed', typeof e === 'string' ? e : e.message, {
        label: 'Close',
        fn: async () => {}
      }, null)
    }
  }

  const deletePath = async (path: string) => {
    const filesProvider = fileSystem.provider.provider

    if (filesProvider.isReadOnly(path)) {
      return toast('cannot delete file. ' + name + ' is a read only explorer')
    }
    const isDir = state.fileManager.isDirectory(path)

    modal(`Delete ${isDir ? 'folder' : 'file'}`, `Are you sure you want to delete ${path} ${isDir ? 'folder' : 'file'}?`, {
      label: 'OK',
      fn: async () => {
        try {
          const fileManager = state.fileManager

          await fileManager.remove(path)
        } catch (e) {
          toast(`Failed to remove ${isDir ? 'folder' : 'file'} ${path}.`)
        }
      }
    }, {
      label: 'Cancel',
      fn: () => {}
    })
  }

  const renamePath = async (oldPath: string, newPath: string) => {
    try {
      const fileManager = state.fileManager
      const exists = await fileManager.exists(newPath)

      if (exists) {
        modal('Rename File Failed', `A file or folder ${extractNameFromKey(newPath)} already exists at this location. Please choose a different name.`, {
          label: 'Close',
          fn: () => {}
        }, null)
      } else {
        await fileManager.rename(oldPath, newPath)
      }
    } catch (error) {
      modal('Rename File Failed', 'Unexpected error while renaming: ' + typeof error === 'string' ? error : error.message, {
        label: 'Close',
        fn: async () => {}
      }, null)
    }
  }

  const uploadFile = (target) => {
    const filesProvider = fileSystem.provider.provider
    // TODO The file explorer is merely a view on the current state of
    // the files module. Please ask the user here if they want to overwrite
    // a file and then just use `files.add`. The file explorer will
    // pick that up via the 'fileAdded' event from the files module.
    const parentFolder = state.focusElement[0] ? state.focusElement[0].type === 'folder' ? state.focusElement[0].key : extractParentFromKey(state.focusElement[0].key) : name
    const expandPath = [...new Set([...state.expandPath, parentFolder])]

    setState(prevState => {
      return { ...prevState, expandPath }
    });

    [...target.files].forEach((file) => {
      const loadFile = (name: string): void => {
        const fileReader = new FileReader()

        fileReader.onload = async function (event) {
          if (helper.checkSpecialChars(file.name)) {
            modal('File Upload Failed', 'Special characters are not allowed', {
              label: 'Close',
              fn: async () => {}
            }, null)
            return
          }
          const success = await filesProvider.set(name, event.target.result)

          if (!success) {
            return modal('File Upload Failed', 'Failed to create file ' + name, {
              label: 'Close',
              fn: async () => {}
            }, null)
          }
          const config = registry.get('config').api
          const editor = registry.get('editor').api

          if ((config.get('currentFile') === name) && (editor.currentContent() !== event.target.result)) {
            editor.setText(event.target.result)
          }
        }
        fileReader.readAsText(file)
      }
      const name = `${parentFolder}/${file.name}`

      filesProvider.exists(name).then(exist => {
        if (!exist) {
          loadFile(name)
        } else {
          modal('Confirm overwrite', `The file ${name} already exists! Would you like to overwrite it?`, {
            label: 'OK',
            fn: () => {
              loadFile(name)
            }
          }, {
            label: 'Cancel',
            fn: () => {}
          })
        }
      }).catch(error => {
        if (error) console.log(error)
      })
    })
  }

  const publishToGist = () => {
    modal('Create a public gist', `Are you sure you want to anonymously publish all your files in the ${name} workspace as a public gist on github.com?`, {
      label: 'OK',
      fn: toGist
    }, {
      label: 'Cancel',
      fn: () => {}
    })
  }

  const toGist = (id?: string) => {
    const filesProvider = fileSystem.provider.provider
    const proccedResult = function (error, data) {
      if (error) {
        modal('Publish to gist Failed', 'Failed to manage gist: ' + error, {
          label: 'Close',
          fn: async () => {}
        }, null)
      } else {
        if (data.html_url) {
          modal('Gist is ready', `The gist is at ${data.html_url}. Would you like to open it in a new window?`, {
            label: 'OK',
            fn: () => {
              window.open(data.html_url, '_blank')
            }
          }, {
            label: 'Cancel',
            fn: () => {}
          })
        } else {
          const error = JSON.stringify(data.errors, null, '\t') || ''
          const message = data.message === 'Not Found' ? data.message + '. Please make sure the API token has right to create a gist.' : data.message
          modal('Publish to gist Failed', message + ' ' + data.documentation_url + ' ' + error, {
            label: 'Close',
            fn: async () => {}
          }, null)
        }
      }
    }

    /**
       * This function is to get the original content of given gist
       * @params id is the gist id to fetch
       */
    const getOriginalFiles = async (id) => {
      if (!id) {
        return []
      }

      const url = `https://api.github.com/gists/${id}`
      const res = await fetch(url)
      const data = await res.json()
      return data.files || []
    }

    // If 'id' is not defined, it is not a gist update but a creation so we have to take the files from the browser explorer.
    const folder = id ? '/gists/' + id : '/'

    packageFiles(filesProvider, folder, async (error, packaged) => {
      if (error) {
        console.log(error)
        modal('Publish to gist Failed', 'Failed to create gist: ' + error.message, {
          label: 'Close',
          fn: async () => {}
        }, null)
      } else {
        // check for token
        const config = registry.get('config').api
        const accessToken = config.get('settings/gist-access-token')

        if (!accessToken) {
          modal('Authorize Token', 'Remix requires an access token (which includes gists creation permission). Please go to the settings tab to create one.', {
            label: 'Close',
            fn: async () => {}
          }, null)
        } else {
          const description = 'Created using remix-ide: Realtime Ethereum Contract Compiler and Runtime. \n Load this file by pasting this gists URL or ID at https://remix.ethereum.org/#version=' +
            queryParams.get().version + '&optimize=' + queryParams.get().optimize + '&runs=' + queryParams.get().runs + '&gist='
          const gists = new Gists({ token: accessToken })

          if (id) {
            const originalFileList = await getOriginalFiles(id)
            // Telling the GIST API to remove files
            const updatedFileList = Object.keys(packaged)
            const allItems = Object.keys(originalFileList)
              .filter(fileName => updatedFileList.indexOf(fileName) === -1)
              .reduce((acc, deleteFileName) => ({
                ...acc,
                [deleteFileName]: null
              }), originalFileList)
            // adding new files
            updatedFileList.forEach((file) => {
              const _items = file.split('/')
              const _fileName = _items[_items.length - 1]
              allItems[_fileName] = packaged[file]
            })

            toast('Saving gist (' + id + ') ...')
            gists.edit({
              description: description,
              public: true,
              files: allItems,
              id: id
            }, (error, result) => {
              proccedResult(error, result)
              if (!error) {
                for (const key in allItems) {
                  if (allItems[key] === null) delete allItems[key]
                }
              }
            })
          } else {
            // id is not existing, need to create a new gist
            toast('Creating a new gist ...')
            gists.create({
              description: description,
              public: true,
              files: packaged
            }, (error, result) => {
              proccedResult(error, result)
            })
          }
        }
      }
    })
  }

  const runScript = async (path: string) => {
    const filesProvider = fileSystem.provider.provider

    filesProvider.get(path, (error, content: string) => {
      if (error) return console.log(error)
      plugin.call('scriptRunner', 'execute', content)
    })
  }

  const emitContextMenuEvent = (id: string, path: string) => {
    plugin.emit(id, path)
  }

  const handleHideModal = () => {
    setState(prevState => {
      return { ...prevState, focusModal: { ...state.focusModal, hide: true } }
    })
  }

  const modal = (title: string, message: string, ok: { label: string, fn: () => void }, cancel: { label: string, fn: () => void }) => {
    setState(prevState => {
      return {
        ...prevState,
        modals: [...prevState.modals,
          {
            message,
            title,
            ok,
            cancel,
            handleHide: handleHideModal
          }]
      }
    })
  }

  const toast = (message: string) => {
    setState(prevState => {
      return { ...prevState, toasterMsg: message }
    })
  }

  const handleClickFile = (path: string) => {
    path = path.indexOf(props.name + '/') === 0 ? path.replace(props.name + '/', '') : path
    state.fileManager.open(path)
    setState(prevState => {
      return { ...prevState, focusElement: [{ key: path, type: 'file' }] }
    })
  }

  const handleClickFolder = async (path: string) => {
    if (state.ctrlKey) {
      if (state.focusElement.findIndex(item => item.key === path) !== -1) {
        setState(prevState => {
          return { ...prevState, focusElement: [...prevState.focusElement.filter(item => item.key !== path)] }
        })
      } else {
        setState(prevState => {
          return { ...prevState, focusElement: [...prevState.focusElement, { key: path, type: 'folder' }] }
        })
      }
    } else {
      let expandPath = []

      if (!state.expandPath.includes(path)) {
        expandPath = [...new Set([...state.expandPath, path])]
        resolveDirectory(fileSystem.provider.provider, path)(dispatch)
      } else {
        expandPath = [...new Set(state.expandPath.filter(key => key && (typeof key === 'string') && !key.startsWith(path)))]
      }

      setState(prevState => {
        return { ...prevState, focusElement: [{ key: path, type: 'folder' }], expandPath }
      })
    }
  }

  const handleContextMenuFile = (pageX: number, pageY: number, path: string, content: string) => {
    if (!content) return
    setState(prevState => {
      return { ...prevState, focusContext: { element: path, x: pageX, y: pageY, type: 'file' }, focusEdit: { ...prevState.focusEdit, lastEdit: content }, showContextMenu: prevState.focusEdit.element !== path }
    })
  }

  const handleContextMenuFolder = (pageX: number, pageY: number, path: string, content: string) => {
    if (!content) return
    setState(prevState => {
      return { ...prevState, focusContext: { element: path, x: pageX, y: pageY, type: 'folder' }, focusEdit: { ...prevState.focusEdit, lastEdit: content }, showContextMenu: prevState.focusEdit.element !== path }
    })
  }

  const hideContextMenu = () => {
    setState(prevState => {
      return { ...prevState, focusContext: { element: null, x: 0, y: 0, type: '' }, showContextMenu: false }
    })
  }

  const editModeOn = (path: string, type: string, isNew: boolean = false) => {
    if (fileSystem.provider.provider.isReadOnly(path)) return
    setState(prevState => {
      return { ...prevState, focusEdit: { ...prevState.focusEdit, element: path, isNew, type } }
    })
  }

  const editModeOff = async (content: string) => {
    if (typeof content === 'string') content = content.trim()
    const parentFolder = extractParentFromKey(state.focusEdit.element)

    if (!content || (content.trim() === '')) {
      if (state.focusEdit.isNew) {
        removeInputField(parentFolder)(dispatch)
        setState(prevState => {
          return { ...prevState, focusEdit: { element: null, isNew: false, type: '', lastEdit: '' } }
        })
      } else {
        editRef.current.textContent = state.focusEdit.lastEdit
        setState(prevState => {
          return { ...prevState, focusEdit: { element: null, isNew: false, type: '', lastEdit: '' } }
        })
      }
    } else {
      if (state.focusEdit.lastEdit === content) {
        editRef.current.textContent = content
        return setState(prevState => {
          return { ...prevState, focusEdit: { element: null, isNew: false, type: '', lastEdit: '' } }
        })
      }
      if (helper.checkSpecialChars(content)) {
        modal('Validation Error', 'Special characters are not allowed', {
          label: 'OK',
          fn: () => {}
        }, null)
      } else {
        if (state.focusEdit.isNew) {
          state.focusEdit.type === 'file' ? createNewFile(joinPath(parentFolder, content)) : createNewFolder(joinPath(parentFolder, content))
          removeInputField(parentFolder)(dispatch)
        } else {
          const oldPath: string = state.focusEdit.element
          const oldName = extractNameFromKey(oldPath)
          const newPath = oldPath.replace(oldName, content)

          editRef.current.textContent = extractNameFromKey(oldPath)
          renamePath(oldPath, newPath)
        }
        setState(prevState => {
          return { ...prevState, focusEdit: { element: null, isNew: false, type: '', lastEdit: '' } }
        })
      }
    }
  }

  const handleNewFileInput = async (parentFolder?: string) => {
    if (!parentFolder) parentFolder = state.focusElement[0] ? state.focusElement[0].type === 'folder' ? state.focusElement[0].key ? state.focusElement[0].key : name : extractParentFromKey(state.focusElement[0].key) ? extractParentFromKey(state.focusElement[0].key) : name : name
    const expandPath = [...new Set([...state.expandPath, parentFolder])]

    await addInputField(fileSystem.provider.provider, 'file', parentFolder)(dispatch)
    setState(prevState => {
      return { ...prevState, expandPath }
    })
    editModeOn(parentFolder + '/blank', 'file', true)
  }

  const handleNewFolderInput = async (parentFolder?: string) => {
    if (!parentFolder) parentFolder = state.focusElement[0] ? state.focusElement[0].type === 'folder' ? state.focusElement[0].key ? state.focusElement[0].key : name : extractParentFromKey(state.focusElement[0].key) ? extractParentFromKey(state.focusElement[0].key) : name : name
    else if ((parentFolder.indexOf('.sol') !== -1) || (parentFolder.indexOf('.js') !== -1)) parentFolder = extractParentFromKey(parentFolder)
    const expandPath = [...new Set([...state.expandPath, parentFolder])]

    await addInputField(fileSystem.provider.provider, 'folder', parentFolder)(dispatch)
    setState(prevState => {
      return { ...prevState, expandPath }
    })
    editModeOn(parentFolder + '/blank', 'folder', true)
  }

  const handleEditInput = (event) => {
    if (event.which === 13) {
      event.preventDefault()
      editModeOff(editRef.current.innerText)
    }
  }

  const handleMouseOver = (path: string) => {
    setState(prevState => {
      return { ...prevState, mouseOverElement: path }
    })
  }

  const handleMouseOut = () => {
    setState(prevState => {
      return { ...prevState, mouseOverElement: null }
    })
  }

  const label = (file: File) => {
    return (
      <div
        className='remixui_items d-inline-block w-100'
        ref={state.focusEdit.element === file.path ? editRef : null}
        suppressContentEditableWarning={true}
        contentEditable={state.focusEdit.element === file.path}
        onKeyDown={handleEditInput}
        onBlur={(e) => {
          e.stopPropagation()
          editModeOff(editRef.current.innerText)
        }}
      >
        <span
          title={file.path}
          className={'remixui_label ' + (file.isDirectory ? 'folder' : 'remixui_leaf')}
          data-path={file.path}
        >
          { file.name }
        </span>
      </div>
    )
  }

  const renderFiles = (file: File, index: number) => {
    if (!file || !file.path || typeof file === 'string' || typeof file === 'number' || typeof file === 'boolean') return
    const labelClass = state.focusEdit.element === file.path
      ? 'bg-light' : state.focusElement.findIndex(item => item.key === file.path) !== -1
        ? 'bg-secondary' : state.mouseOverElement === file.path
          ? 'bg-light border' : (state.focusContext.element === file.path) && (state.focusEdit.element !== file.path)
            ? 'bg-light border' : ''
    const icon = helper.getPathIcon(file.path)
    const spreadProps = {
      onClick: (e) => e.stopPropagation()
    }

    if (file.isDirectory) {
      return (
        <TreeViewItem
          id={`treeViewItem${file.path}`}
          iconX='pr-3 fa fa-folder'
          iconY='pr-3 fa fa-folder-open'
          key={`${file.path + index}`}
          label={label(file)}
          onClick={(e) => {
            e.stopPropagation()
            if (state.focusEdit.element !== file.path) handleClickFolder(file.path)
          }}
          onContextMenu={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleContextMenuFolder(e.pageX, e.pageY, file.path, e.target.textContent)
          }}
          labelClass={labelClass}
          controlBehaviour={ state.ctrlKey }
          expand={state.expandPath.includes(file.path)}
          onMouseOver={(e) => {
            e.stopPropagation()
            handleMouseOver(file.path)
          }}
          onMouseOut={(e) => {
            e.stopPropagation()
            if (state.mouseOverElement === file.path) handleMouseOut()
          }}
        >
          {
            file.child ? <TreeView id={`treeView${file.path}`} key={`treeView${file.path}`} {...spreadProps }>{
              Object.keys(file.child).map((key, index) => {
                return renderFiles(file.child[key], index)
              })
            }
            </TreeView> : <TreeView id={`treeView${file.path}`} key={`treeView${file.path}`} {...spreadProps }/>
          }
        </TreeViewItem>
      )
    } else {
      return (
        <TreeViewItem
          id={`treeViewItem${file.path}`}
          key={`treeView${file.path}`}
          label={label(file)}
          onClick={(e) => {
            e.stopPropagation()
            if (state.focusEdit.element !== file.path) handleClickFile(file.path)
          }}
          onContextMenu={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleContextMenuFile(e.pageX, e.pageY, file.path, e.target.textContent)
          }}
          icon={icon}
          labelClass={labelClass}
          onMouseOver={(e) => {
            e.stopPropagation()
            handleMouseOver(file.path)
          }}
          onMouseOut={(e) => {
            e.stopPropagation()
            if (state.mouseOverElement === file.path) handleMouseOut()
          }}
        />
      )
    }
  }

  return (
    <div>
      <TreeView id='treeView'>
        <TreeViewItem id="treeViewItem"
          controlBehaviour={true}
          label={
            <div onClick={(e) => {
              e.stopPropagation()
              if (e && (e.target as any).getAttribute('data-id') === 'fileExplorerUploadFileuploadFile') return // we don't want to let propagate the input of type file
              if (e && (e.target as any).getAttribute('data-id') === 'fileExplorerFileUpload') return // we don't want to let propagate the input of type file
              let expandPath = []

              if (!state.expandPath.includes(props.name)) {
                expandPath = [props.name, ...new Set([...state.expandPath])]
              } else {
                expandPath = [...new Set(state.expandPath.filter(key => key && (typeof key === 'string') && !key.startsWith(props.name)))]
              }
              setState(prevState => {
                return { ...prevState, expandPath }
              })
              plugin.resetFocus(true)
            }}>
              <FileExplorerMenu
                title={''}
                menuItems={props.menuItems}
                createNewFile={handleNewFileInput}
                createNewFolder={handleNewFolderInput}
                publishToGist={publishToGist}
                uploadFile={uploadFile}
                fileManager={state.fileManager}
              />
            </div>
          }
          expand={true}>
          <div className='pb-2'>
            <TreeView id='treeViewMenu'>
              {
                fileSystem.files.files[props.name] && Object.keys(fileSystem.files.files[props.name]).map((key, index) => {
                  return renderFiles(fileSystem.files.files[props.name][key], index)
                })
              }
            </TreeView>
          </div>
        </TreeViewItem>
      </TreeView>
      {
        props.name && <ModalDialog
          id={ props.name }
          title={ state.focusModal.title }
          message={ state.focusModal.message }
          hide={ state.focusModal.hide }
          ok={ state.focusModal.ok }
          cancel={ state.focusModal.cancel }
          handleHide={ handleHideModal }
        />
      }
      <Toaster message={state.toasterMsg} />
      { state.showContextMenu &&
        <FileExplorerContextMenu
          actions={state.actions}
          hideContextMenu={hideContextMenu}
          createNewFile={handleNewFileInput}
          createNewFolder={handleNewFolderInput}
          deletePath={deletePath}
          renamePath={editModeOn}
          runScript={runScript}
          emit={emitContextMenuEvent}
          pageX={state.focusContext.x}
          pageY={state.focusContext.y}
          path={state.focusContext.element}
          type={state.focusContext.type}
          onMouseOver={(e) => {
            e.stopPropagation()
            handleMouseOver(state.focusContext.element)
          }}
        />
      }
    </div>
  )
}

export default FileExplorer

async function packageFiles (filesProvider, directory, callback) {
  const ret = {}
  try {
    await filesProvider.copyFolderToJson(directory, ({ path, content }) => {
      if (/^\s+$/.test(content) || !content.length) {
        content = '// this line is added to create a gist. Empty file is not allowed.'
      }
      path = path.replace(/\//g, '...')
      ret[path] = { content }
    })
    callback(null, ret)
  } catch (e) {
    return callback(e)
  }
}

function joinPath (...paths) {
  paths = paths.filter((value) => value !== '').map((path) => path.replace(/^\/|\/$/g, '')) // remove first and last slash)
  if (paths.length === 1) return paths[0]
  return paths.join('/')
}
