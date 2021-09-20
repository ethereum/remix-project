import React, { useEffect, useState, useRef, useContext } from 'react' // eslint-disable-line
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd' // eslint-disable-line
import { TreeView, TreeViewItem } from '@remix-ui/tree-view' // eslint-disable-line
import { FileExplorerMenu } from './file-explorer-menu' // eslint-disable-line
import { FileExplorerContextMenu } from './file-explorer-context-menu' // eslint-disable-line
import { FileExplorerProps, File, MenuItems, FileExplorerState } from '../types'
import { FileSystemContext } from '@remix-ui/workspace'
import { customAction } from '@remixproject/plugin-api/lib/file-system/file-panel'
import { contextMenuActions } from '../utils'

import './css/file-explorer.css'
import { checkSpecialChars, extractParentFromKey, getPathIcon, joinPath } from '@remix-ui/helper'

export const FileExplorer = (props: FileExplorerProps) => {
  const { name, focusRoot, contextMenuItems, externalUploads, removedContextMenuItems, resetFocus, files } = props
  const [state, setState] = useState<FileExplorerState>({
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
      }, 0)
    }
  }, [state.focusEdit.element])

  useEffect(() => {
    if (focusRoot) {
      global.dispatchSetFocusElement([{ key: '', type: 'folder' }])
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
    if (global.fs.focusEdit) {
      setState(prevState => {
        return { ...prevState, focusEdit: { element: global.fs.focusEdit, type: 'file', isNew: true, lastEdit: null } }
      })
    }
  }, [global.fs.focusEdit])

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

  const hasReservedKeyword = (content: string): boolean => {
    if (state.reservedKeywords.findIndex(value => content.startsWith(value)) !== -1) return true
    else return false
  }

  const getFocusedFolder = () => {
    if (global.fs.focusElement[0]) {
      if (global.fs.focusElement[0].type === 'folder' && global.fs.focusElement[0].key) return global.fs.focusElement[0].key
      else if (global.fs.focusElement[0].type === 'gist' && global.fs.focusElement[0].key) return global.fs.focusElement[0].key
      else if (global.fs.focusElement[0].type === 'file' && global.fs.focusElement[0].key) return extractParentFromKey(global.fs.focusElement[0].key) ? extractParentFromKey(global.fs.focusElement[0].key) : name
      else return name
    }
  }

  const createNewFile = async (newFilePath: string) => {
    try {
      global.dispatchCreateNewFile(newFilePath, props.name)
    } catch (error) {
      return global.modal('File Creation Failed', typeof error === 'string' ? error : error.message, 'Close', async () => {})
    }
  }

  const createNewFolder = async (newFolderPath: string) => {
    try {
      global.dispatchCreateNewFolder(newFolderPath, props.name)
    } catch (e) {
      return global.modal('Folder Creation Failed', typeof e === 'string' ? e : e.message, 'Close', async () => {})
    }
  }

  const deletePath = async (path: string[]) => {
    if (global.fs.readonly) return global.toast('cannot delete file. ' + name + ' is a read only explorer')
    if (!Array.isArray(path)) path = [path]

    global.modal(`Delete ${path.length > 1 ? 'items' : 'item'}`, deleteMessage(path), 'OK', () => { global.dispatchDeletePath(path) }, 'Cancel', () => {})
  }

  const renamePath = async (oldPath: string, newPath: string) => {
    try {
      global.dispatchRenamePath(oldPath, newPath)
    } catch (error) {
      global.modal('Rename File Failed', 'Unexpected error while renaming: ' + typeof error === 'string' ? error : error.message, 'Close', async () => {})
    }
  }

  const uploadFile = (target) => {
    const parentFolder = getFocusedFolder()
    const expandPath = [...new Set([...state.expandPath, parentFolder])]

    setState(prevState => {
      return { ...prevState, expandPath }
    })
    global.dispatchUploadFile(target, parentFolder)
  }

  const copyFile = (src: string, dest: string) => {
    try {
      global.dispatchCopyFile(src, dest)
    } catch (error) {
      global.modal('Copy File Failed', 'Unexpected error while copying file: ' + src, 'Close', async () => {})
    }
  }

  const copyFolder = (src: string, dest: string) => {
    try {
      global.dispatchCopyFolder(src, dest)
    } catch (error) {
      global.modal('Copy Folder Failed', 'Unexpected error while copying folder: ' + src, 'Close', async () => {})
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
    global.dispatchPublishToGist(path, type)
  }

  const runScript = async (path: string) => {
    try {
      global.dispatchRunScript(path)
    } catch (error) {
      global.toast('Run script failed')
    }
  }

  const emitContextMenuEvent = (cmd: customAction) => {
    try {
      global.dispatchEmitContextMenuEvent(cmd)
    } catch (error) {
      global.toast(error)
    }
  }

  const handleClickFile = (path: string, type: 'folder' | 'file' | 'gist') => {
    path = path.indexOf(props.name + '/') === 0 ? path.replace(props.name + '/', '') : path
    if (!state.ctrlKey) {
      global.dispatchHandleClickFile(path, type)
    } else {
      if (global.fs.focusElement.findIndex(item => item.key === path) !== -1) {
        const focusElement = global.fs.focusElement.filter(item => item.key !== path)

        global.dispatchSetFocusElement(focusElement)
      } else {
        const nonRootFocus = global.fs.focusElement.filter((el) => { return !(el.key === '' && el.type === 'folder') })

        nonRootFocus.push({ key: path, type })
        global.dispatchSetFocusElement(nonRootFocus)
      }
    }
  }

  const handleClickFolder = async (path: string, type: 'folder' | 'file' | 'gist') => {
    if (state.ctrlKey) {
      if (global.fs.focusElement.findIndex(item => item.key === path) !== -1) {
        const focusElement = global.fs.focusElement.filter(item => item.key !== path)

        global.dispatchSetFocusElement(focusElement)
      } else {
        const nonRootFocus = global.fs.focusElement.filter((el) => { return !(el.key === '' && el.type === 'folder') })

        nonRootFocus.push({ key: path, type })
        global.dispatchSetFocusElement(nonRootFocus)
      }
    } else {
      let expandPath = []

      if (!state.expandPath.includes(path)) {
        expandPath = [...new Set([...state.expandPath, path])]
        global.dispatchFetchDirectory(path)
      } else {
        expandPath = [...new Set(state.expandPath.filter(key => key && (typeof key === 'string') && !key.startsWith(path)))]
      }

      global.dispatchSetFocusElement([{ key: path, type }])
      setState(prevState => {
        return { ...prevState, expandPath }
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
      if (checkSpecialChars(content)) {
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
    global.toast(`Copied to clipboard ${path}`)
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
    const isEditable = (state.focusEdit.element === file.path) || (global.fs.focusEdit === file.path)

    return (
      <div
        className='remixui_items d-inline-block w-100'
        ref={ isEditable ? editRef : null}
        suppressContentEditableWarning={true}
        contentEditable={isEditable}
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
      ? 'bg-light' : global.fs.focusElement.findIndex(item => item.key === file.path) !== -1
        ? 'bg-secondary' : state.mouseOverElement === file.path
          ? 'bg-light border' : (state.focusContext.element === file.path) && (state.focusEdit.element !== file.path)
            ? 'bg-light border' : ''
    const icon = getPathIcon(file.path)
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
      { state.showContextMenu &&
        <FileExplorerContextMenu
          actions={global.fs.focusElement.length > 1 ? state.actions.filter(item => item.multiselect) : state.actions.filter(item => !item.multiselect)}
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
          focus={global.fs.focusElement}
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
