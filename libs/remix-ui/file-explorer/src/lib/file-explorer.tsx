import React, { useEffect, useState, useRef, useReducer, useContext } from 'react' // eslint-disable-line
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd' // eslint-disable-line
import { TreeView, TreeViewItem } from '@remix-ui/tree-view' // eslint-disable-line
import { Toaster } from '@remix-ui/toaster' // eslint-disable-line
import Gists from 'gists'
import { FileExplorerMenu } from './file-explorer-menu' // eslint-disable-line
import { FileExplorerContextMenu } from './file-explorer-context-menu' // eslint-disable-line
import { FileExplorerProps, File, MenuItems, FileExplorerState } from './types'
import * as helper from '../../../../../apps/remix-ide/src/lib/helper'
import QueryParams from '../../../../../apps/remix-ide/src/lib/query-params'
import { FileSystemContext } from '@remix-ui/workspace'
import { customAction } from '@remixproject/plugin-api/lib/file-system/file-panel'
import { contextMenuActions } from './utils'

import './css/file-explorer.css'

const queryParams = new QueryParams()

export const FileExplorer = (props: FileExplorerProps) => {
  const { name, registry, plugin, focusRoot, contextMenuItems, displayInput, externalUploads, removedContextMenuItems, resetFocus, files } = props
  const [state, setState] = useState<FileExplorerState>({
    focusElement: [{
      key: '',
      type: 'folder'
    }],
    fileManager: null,
    ctrlKey: false,
    newFileName: '',
    actions: contextMenuActions,
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
    toasterMsg: '',
    mouseOverElement: null,
    showContextMenu: false,
    reservedKeywords: [name, 'gist-'],
    copyElement: []
  })
  const [canPaste, setCanPaste] = useState(false)
  const editRef = useRef(null)
  const global = useContext(FileSystemContext)

  useEffect(() => {
    if (global.fs.mode === 'browser') {
      setState(prevState => {
        return { ...prevState, expandPath: [...new Set([...prevState.expandPath, ...global.fs.browser.expandPath])] }
      })
    } else if (global.fs.mode === 'localhost') {
      setState(prevState => {
        return { ...prevState, expandPath: [...new Set([...prevState.expandPath, ...global.fs.localhost.expandPath])] }
      })
    }
  }, [global.fs.browser.expandPath, global.fs.localhost.expandPath])

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
      resetFocus(false)
    }
  }, [focusRoot])

  useEffect(() => {
    if (contextMenuItems) {
      addMenuItems(contextMenuItems)
    }
  }, [contextMenuItems])

  useEffect(() => {
    if (removedContextMenuItems) {
      removeMenuItems(removedContextMenuItems)
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
    }
  }, [externalUploads])

  useEffect(() => {
    const keyPressHandler = (e: KeyboardEvent) => {
      if (e.shiftKey) {
        setState(prevState => {
          return { ...prevState, ctrlKey: true }
        })
      }
    }

    const keyUpHandler = (e: KeyboardEvent) => {
      if (!e.shiftKey) {
        setState(prevState => {
          return { ...prevState, ctrlKey: false }
        })
      }
    }

    document.addEventListener('keydown', keyPressHandler)
    document.addEventListener('keyup', keyUpHandler)
    return () => {
      document.removeEventListener('keydown', keyPressHandler)
      document.removeEventListener('keyup', keyUpHandler)
    }
  }, [])

  useEffect(() => {
    if (canPaste) {
      addMenuItems([{
        id: 'paste',
        name: 'Paste',
        type: ['folder', 'file'],
        path: [],
        extension: [],
        pattern: [],
        multiselect: false,
        label: ''
      }])
    } else {
      removeMenuItems([{
        id: 'paste',
        name: 'Paste',
        type: ['folder', 'file'],
        path: [],
        extension: [],
        pattern: [],
        multiselect: false,
        label: ''
      }])
    }
  }, [canPaste])

  const addMenuItems = (items: MenuItems) => {
    setState(prevState => {
      // filter duplicate items
      const actions = items.filter(({ name }) => prevState.actions.findIndex(action => action.name === name) === -1)

      return { ...prevState, actions: [...prevState.actions, ...actions] }
    })
  }

  const removeMenuItems = (items: MenuItems) => {
    setState(prevState => {
      const actions = prevState.actions.filter(({ id, name }) => items.findIndex(item => id === item.id && name === item.name) === -1)
      return { ...prevState, actions }
    })
  }

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

  const hasReservedKeyword = (content: string): boolean => {
    if (state.reservedKeywords.findIndex(value => content.startsWith(value)) !== -1) return true
    else return false
  }

  const getFocusedFolder = () => {
    if (state.focusElement[0]) {
      if (state.focusElement[0].type === 'folder' && state.focusElement[0].key) return state.focusElement[0].key
      else if (state.focusElement[0].type === 'gist' && state.focusElement[0].key) return state.focusElement[0].key
      else if (state.focusElement[0].type === 'file' && state.focusElement[0].key) return extractParentFromKey(state.focusElement[0].key) ? extractParentFromKey(state.focusElement[0].key) : name
      else return name
    }
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
      return global.modal('File Creation Failed', typeof error === 'string' ? error : error.message, 'Close', async () => {})
    }
  }

  const createNewFolder = async (newFolderPath: string) => {
    const fileManager = state.fileManager
    const dirName = newFolderPath + '/'

    try {
      const exists = await fileManager.exists(dirName)

      if (exists) {
        return global.modal('Rename File Failed', `A file or folder ${extractNameFromKey(newFolderPath)} already exists at this location. Please choose a different name.`, 'Close', () => {})
      }
      await fileManager.mkdir(dirName)
      setState(prevState => {
        return { ...prevState, focusElement: [{ key: newFolderPath, type: 'folder' }] }
      })
    } catch (e) {
      return global.modal('Folder Creation Failed', typeof e === 'string' ? e : e.message, 'Close', async () => {})
    }
  }

  const deletePath = async (path: string | string[]) => {
    if (global.fs.readonly) return toast('cannot delete file. ' + name + ' is a read only explorer')
    if (!Array.isArray(path)) path = [path]

    global.modal(`Delete ${path.length > 1 ? 'items' : 'item'}`, deleteMessage(path), 'OK', async () => {
      const fileManager = state.fileManager

      for (const p of path) {
        try {
          await fileManager.remove(p)
        } catch (e) {
          const isDir = await state.fileManager.isDirectory(p)

          toast(`Failed to remove ${isDir ? 'folder' : 'file'} ${p}.`)
        }
      }
    }, 'Cancel', () => {})
  }

  const renamePath = async (oldPath: string, newPath: string) => {
    try {
      const fileManager = state.fileManager
      const exists = await fileManager.exists(newPath)

      if (exists) {
        global.modal('Rename File Failed', `A file or folder ${extractNameFromKey(newPath)} already exists at this location. Please choose a different name.`, 'Close', () => {})
      } else {
        await fileManager.rename(oldPath, newPath)
      }
    } catch (error) {
      global.modal('Rename File Failed', 'Unexpected error while renaming: ' + typeof error === 'string' ? error : error.message, 'Close', async () => {})
    }
  }

  const uploadFile = (target) => {
    const filesProvider = fileSystem.provider.provider
    // TODO The file explorer is merely a view on the current state of
    // the files module. Please ask the user here if they want to overwrite
    // a file and then just use `files.add`. The file explorer will
    // pick that up via the 'fileAdded' event from the files module.
    const parentFolder = getFocusedFolder()
    const expandPath = [...new Set([...state.expandPath, parentFolder])]

    setState(prevState => {
      return { ...prevState, expandPath }
    });

    [...target.files].forEach((file) => {
      const loadFile = (name: string): void => {
        const fileReader = new FileReader()

        fileReader.onload = async function (event) {
          if (helper.checkSpecialChars(file.name)) {
            global.modal('File Upload Failed', 'Special characters are not allowed', 'Close', async () => {})
            return
          }
          const success = await filesProvider.set(name, event.target.result)

          if (!success) {
            return global.modal('File Upload Failed', 'Failed to create file ' + name, 'Close', async () => {})
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
          global.modal('Confirm overwrite', `The file ${name} already exists! Would you like to overwrite it?`, 'OK', () => {
            loadFile(name)
          }, 'Cancel', () => {})
        }
      }).catch(error => {
        if (error) console.log(error)
      })
    })
  }

  const copyFile = (src: string, dest: string) => {
    const fileManager = state.fileManager

    try {
      fileManager.copyFile(src, dest)
    } catch (error) {
      console.log('Oops! An error ocurred while performing copyFile operation.' + error)
    }
  }

  const copyFolder = (src: string, dest: string) => {
    const fileManager = state.fileManager

    try {
      fileManager.copyDir(src, dest)
    } catch (error) {
      console.log('Oops! An error ocurred while performing copyDir operation.' + error)
    }
  }

  const publishToGist = (path?: string, type?: string) => {
    global.modal('Create a public gist', `Are you sure you want to anonymously publish all your files in the ${name} workspace as a public gist on github.com?`, 'OK', () => toGist(path, type), 'Cancel', () => {})
  }

  const pushChangesToGist = (path?: string, type?: string) => {
    global.modal('Create a public gist', 'Are you sure you want to push changes to remote gist file on github.com?', 'OK', () => toGist(path, type), 'Cancel', () => {})
  }

  const publishFolderToGist = (path?: string, type?: string) => {
    global.modal('Create a public gist', `Are you sure you want to anonymously publish all your files in the ${path} folder as a public gist on github.com?`, 'OK', () => toGist(path, type), 'Cancel', () => {})
  }

  const publishFileToGist = (path?: string, type?: string) => {
    global.modal('Create a public gist', `Are you sure you want to anonymously publish ${path} file as a public gist on github.com?`, 'OK', () => toGist(path, type), 'Cancel', () => {})
  }

  const toGist = (path?: string, type?: string) => {
    const filesProvider = fileSystem.provider.provider
    const proccedResult = function (error, data) {
      if (error) {
        global.modal('Publish to gist Failed', 'Failed to manage gist: ' + error, 'Close', () => {})
      } else {
        if (data.html_url) {
          global.modal('Gist is ready', `The gist is at ${data.html_url}. Would you like to open it in a new window?`, 'OK', () => {
            window.open(data.html_url, '_blank')
          }, 'Cancel', () => {})
        } else {
          const error = JSON.stringify(data.errors, null, '\t') || ''
          const message = data.message === 'Not Found' ? data.message + '. Please make sure the API token has right to create a gist.' : data.message
          global.modal('Publish to gist Failed', message + ' ' + data.documentation_url + ' ' + error, 'Close', () => {})
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
    const folder = path || '/'
    const id = type === 'gist' ? extractNameFromKey(path).split('-')[1] : null

    packageFiles(filesProvider, folder, async (error, packaged) => {
      if (error) {
        console.log(error)
        global.modal('Publish to gist Failed', 'Failed to create gist: ' + error.message, 'Close', async () => {})
      } else {
        // check for token
        const config = registry.get('config').api
        const accessToken = config.get('settings/gist-access-token')

        if (!accessToken) {
          global.modal('Authorize Token', 'Remix requires an access token (which includes gists creation permission). Please go to the settings tab to create one.', 'Close', () => {})
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

  const emitContextMenuEvent = (cmd: customAction) => {
    plugin.call(cmd.id, cmd.name, cmd)
  }

  const toast = (message: string) => {
    setState(prevState => {
      return { ...prevState, toasterMsg: message }
    })
  }

  const handleClickFile = (path: string, type: 'folder' | 'file' | 'gist') => {
    path = path.indexOf(props.name + '/') === 0 ? path.replace(props.name + '/', '') : path
    if (!state.ctrlKey) {
      state.fileManager.open(path)
      setState(prevState => {
        return { ...prevState, focusElement: [{ key: path, type }] }
      })
    } else {
      if (state.focusElement.findIndex(item => item.key === path) !== -1) {
        setState(prevState => {
          return { ...prevState, focusElement: prevState.focusElement.filter(item => item.key !== path) }
        })
      } else {
        setState(prevState => {
          const nonRootFocus = prevState.focusElement.filter((el) => { return !(el.key === '' && el.type === 'folder') })

          nonRootFocus.push({ key: path, type })
          return { ...prevState, focusElement: nonRootFocus }
        })
      }
    }
  }

  const handleClickFolder = async (path: string, type: 'folder' | 'file' | 'gist') => {
    if (state.ctrlKey) {
      if (state.focusElement.findIndex(item => item.key === path) !== -1) {
        setState(prevState => {
          return { ...prevState, focusElement: [...prevState.focusElement.filter(item => item.key !== path)] }
        })
      } else {
        setState(prevState => {
          const nonRootFocus = prevState.focusElement.filter((el) => { return !(el.key === '' && el.type === 'folder') })

          nonRootFocus.push({ key: path, type })
          return { ...prevState, focusElement: nonRootFocus }
        })
      }
    } else {
      let expandPath = []

      if (!state.expandPath.includes(path)) {
        expandPath = [...new Set([...state.expandPath, path])]
        global.dispatchFetchDirectory(path)
      } else {
        expandPath = [...new Set(state.expandPath.filter(key => key && (typeof key === 'string') && !key.startsWith(path)))]
      }

      setState(prevState => {
        return { ...prevState, focusElement: [{ key: path, type }], expandPath }
      })
    }
  }

  const handleContextMenuFile = (pageX: number, pageY: number, path: string, content: string, type: string) => {
    if (!content) return
    setState(prevState => {
      return { ...prevState, focusContext: { element: path, x: pageX, y: pageY, type }, focusEdit: { ...prevState.focusEdit, lastEdit: content }, showContextMenu: prevState.focusEdit.element !== path }
    })
  }

  const handleContextMenuFolder = (pageX: number, pageY: number, path: string, content: string, type: string) => {
    if (!content) return
    setState(prevState => {
      return { ...prevState, focusContext: { element: path, x: pageX, y: pageY, type }, focusEdit: { ...prevState.focusEdit, lastEdit: content }, showContextMenu: prevState.focusEdit.element !== path }
    })
  }

  const hideContextMenu = () => {
    setState(prevState => {
      return { ...prevState, focusContext: { element: null, x: 0, y: 0, type: '' }, showContextMenu: false }
    })
  }

  const editModeOn = (path: string, type: string, isNew: boolean = false) => {
    if (global.fs.readonly) return
    setState(prevState => {
      return { ...prevState, focusEdit: { ...prevState.focusEdit, element: path, isNew, type } }
    })
  }

  const editModeOff = async (content: string) => {
    if (typeof content === 'string') content = content.trim()
    const parentFolder = extractParentFromKey(state.focusEdit.element)

    if (!content || (content.trim() === '')) {
      if (state.focusEdit.isNew) {
        global.dispatchRemoveInputField(parentFolder)
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
        global.modal('Validation Error', 'Special characters are not allowed', 'OK', () => {})
      } else {
        if (state.focusEdit.isNew) {
          if (hasReservedKeyword(content)) {
            global.dispatchRemoveInputField(parentFolder)
            global.modal('Reserved Keyword', `File name contains remix reserved keywords. '${content}'`, 'Close', () => {})
          } else {
            state.focusEdit.type === 'file' ? createNewFile(joinPath(parentFolder, content)) : createNewFolder(joinPath(parentFolder, content))
            global.dispatchRemoveInputField(parentFolder)
          }
        } else {
          if (hasReservedKeyword(content)) {
            editRef.current.textContent = state.focusEdit.lastEdit
            global.modal('Reserved Keyword', `File name contains remix reserved keywords. '${content}'`, 'Close', () => {})
          } else {
            const oldPath: string = state.focusEdit.element
            const oldName = extractNameFromKey(oldPath)
            const newPath = oldPath.replace(oldName, content)

            editRef.current.textContent = extractNameFromKey(oldPath)
            renamePath(oldPath, newPath)
          }
        }
        setState(prevState => {
          return { ...prevState, focusEdit: { element: null, isNew: false, type: '', lastEdit: '' } }
        })
      }
    }
  }

  const handleNewFileInput = async (parentFolder?: string) => {
    if (!parentFolder) parentFolder = getFocusedFolder()
    const expandPath = [...new Set([...state.expandPath, parentFolder])]

    await global.dispatchAddInputField(parentFolder, 'file')
    setState(prevState => {
      return { ...prevState, expandPath }
    })
    editModeOn(parentFolder + '/blank', 'file', true)
  }

  const handleNewFolderInput = async (parentFolder?: string) => {
    if (!parentFolder) parentFolder = getFocusedFolder()
    else if ((parentFolder.indexOf('.sol') !== -1) || (parentFolder.indexOf('.js') !== -1)) parentFolder = extractParentFromKey(parentFolder)
    const expandPath = [...new Set([...state.expandPath, parentFolder])]

    await global.dispatchAddInputField(parentFolder, 'folder')
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

  const handleCopyClick = (path: string, type: 'folder' | 'gist' | 'file') => {
    setState(prevState => {
      return { ...prevState, copyElement: [{ key: path, type }] }
    })
    setCanPaste(true)
    toast(`Copied to clipboard ${path}`)
  }

  const handlePasteClick = (dest: string, destType: string) => {
    dest = destType === 'file' ? extractParentFromKey(dest) || props.name : dest
    state.copyElement.map(({ key, type }) => {
      type === 'file' ? copyFile(key, dest) : copyFolder(key, dest)
    })
  }

  const deleteMessage = (path: string[]) => {
    return (
      <div>
        <div>Are you sure you want to delete {path.length > 1 ? 'these items' : 'this item'}?</div>
        {
          path.map((item, i) => (<li key={i}>{item}</li>))
        }
      </div>
    )
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
            if (state.focusEdit.element !== file.path) handleClickFolder(file.path, file.type)
          }}
          onContextMenu={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleContextMenuFolder(e.pageX, e.pageY, file.path, e.target.textContent, file.type)
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
            if (state.focusEdit.element !== file.path) handleClickFile(file.path, file.type)
          }}
          onContextMenu={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleContextMenuFile(e.pageX, e.pageY, file.path, e.target.textContent, file.type)
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
              resetFocus(true)
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
                files[props.name] && Object.keys(files[props.name]).map((key, index) => {
                  return renderFiles(files[props.name][key], index)
                })
              }
            </TreeView>
          </div>
        </TreeViewItem>
      </TreeView>
      <Toaster message={state.toasterMsg} />
      { state.showContextMenu &&
        <FileExplorerContextMenu
          actions={state.focusElement.length > 1 ? state.actions.filter(item => item.multiselect) : state.actions.filter(item => !item.multiselect)}
          hideContextMenu={hideContextMenu}
          createNewFile={handleNewFileInput}
          createNewFolder={handleNewFolderInput}
          deletePath={deletePath}
          renamePath={editModeOn}
          runScript={runScript}
          copy={handleCopyClick}
          paste={handlePasteClick}
          emit={emitContextMenuEvent}
          pageX={state.focusContext.x}
          pageY={state.focusContext.y}
          path={state.focusContext.element}
          type={state.focusContext.type}
          focus={state.focusElement}
          onMouseOver={(e) => {
            e.stopPropagation()
            handleMouseOver(state.focusContext.element)
          }}
          pushChangesToGist={pushChangesToGist}
          publishFolderToGist={publishFolderToGist}
          publishFileToGist={publishFileToGist}
        />
      }
    </div>
  )
}

export default FileExplorer

async function packageFiles (filesProvider, directory, callback) {
  const isFile = filesProvider.isFile(directory)
  const ret = {}

  if (isFile) {
    try {
      filesProvider.get(directory, (error, content) => {
        if (error) throw new Error('An error ocurred while getting file content. ' + directory)
        if (/^\s+$/.test(content) || !content.length) {
          content = '// this line is added to create a gist. Empty file is not allowed.'
        }
        directory = directory.replace(/\//g, '...')
        ret[directory] = { content }
        callback(null, ret)
      })
    } catch (e) {
      return callback(e)
    }
  } else {
    try {
      await filesProvider.copyFolderToJson(directory, ({ path, content }) => {
        if (/^\s+$/.test(content) || !content.length) {
          content = '// this line is added to create a gist. Empty file is not allowed.'
        }
        if (path.indexOf('gist-') === 0) {
          path = path.split('/')
          path.shift()
          path = path.join('/')
        }
        path = path.replace(/\//g, '...')
        ret[path] = { content }
      })
      callback(null, ret)
    } catch (e) {
      return callback(e)
    }
  }
}

function joinPath (...paths) {
  paths = paths.filter((value) => value !== '').map((path) => path.replace(/^\/|\/$/g, '')) // remove first and last slash)
  if (paths.length === 1) return paths[0]
  return paths.join('/')
}
