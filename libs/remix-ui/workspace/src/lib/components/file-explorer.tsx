import React, { useEffect, useState, useRef, SyntheticEvent } from 'react' // eslint-disable-line
import { TreeView, TreeViewItem } from '@remix-ui/tree-view' // eslint-disable-line
import { FileExplorerMenu } from './file-explorer-menu' // eslint-disable-line
import { FileExplorerContextMenu } from './file-explorer-context-menu' // eslint-disable-line
import { FileExplorerProps, MenuItems, FileExplorerState } from '../types'
import { customAction } from '@remixproject/plugin-api/lib/file-system/file-panel'
import { contextMenuActions } from '../utils'

import '../css/file-explorer.css'
import { checkSpecialChars, extractNameFromKey, extractParentFromKey, joinPath } from '@remix-ui/helper'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FileRender } from './file-render'

export const FileExplorer = (props: FileExplorerProps) => {
  const { name, contextMenuItems, removedContextMenuItems, files } = props
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
    mouseOverElement: null,
    showContextMenu: false,
    reservedKeywords: [name, 'gist-'],
    copyElement: []
  })
  const [canPaste, setCanPaste] = useState(false)
  const treeRef = useRef<HTMLDivElement>(null)

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
    if (props.focusEdit) {
      setState(prevState => {
        return { ...prevState, focusEdit: { element: props.focusEdit, type: 'file', isNew: true, lastEdit: null } }
      })
    }
  }, [props.focusEdit])

  useEffect(() => {
    if (treeRef.current) {
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
      const targetDocument = treeRef.current
  
      targetDocument.addEventListener('keydown', keyPressHandler)
      targetDocument.addEventListener('keyup', keyUpHandler)
      return () => {
        targetDocument.removeEventListener('keydown', keyPressHandler)
        targetDocument.removeEventListener('keyup', keyUpHandler)
      }
    }
  }, [treeRef.current])

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

  const hasReservedKeyword = (content: string): boolean => {
    if (state.reservedKeywords.findIndex(value => content.startsWith(value)) !== -1) return true
    else return false
  }

  const getFocusedFolder = () => {
    if (props.focusElement[0]) {
      if (props.focusElement[0].type === 'folder' && props.focusElement[0].key) return props.focusElement[0].key
      else if (props.focusElement[0].type === 'gist' && props.focusElement[0].key) return props.focusElement[0].key
      else if (props.focusElement[0].type === 'file' && props.focusElement[0].key) return extractParentFromKey(props.focusElement[0].key) ? extractParentFromKey(props.focusElement[0].key) : name
      else return name
    }
  }

  const createNewFile = async (newFilePath: string) => {
    try {
      props.dispatchCreateNewFile(newFilePath, props.name)
    } catch (error) {
      return props.modal('File Creation Failed', typeof error === 'string' ? error : error.message, 'Close', async () => {})
    }
  }

  const createNewFolder = async (newFolderPath: string) => {
    try {
      props.dispatchCreateNewFolder(newFolderPath, props.name)
    } catch (e) {
      return props.modal('Folder Creation Failed', typeof e === 'string' ? e : e.message, 'Close', async () => {})
    }
  }

  const deletePath = async (path: string[]) => {
    if (props.readonly) return props.toast('cannot delete file. ' + name + ' is a read only explorer')
    if (!Array.isArray(path)) path = [path]

    props.modal(`Delete ${path.length > 1 ? 'items' : 'item'}`, deleteMessage(path), 'OK', () => { props.dispatchDeletePath(path) }, 'Cancel', () => {})
  }

  const renamePath = async (oldPath: string, newPath: string) => {
    try {
      props.dispatchRenamePath(oldPath, newPath)
    } catch (error) {
      props.modal('Rename File Failed', 'Unexpected error while renaming: ' + typeof error === 'string' ? error : error.message, 'Close', async () => {})
    }
  }

  const uploadFile = (target) => {
    let parentFolder = getFocusedFolder()
    const expandPath = [...new Set([...props.expandPath, parentFolder])]

    parentFolder = parentFolder === name ? '/' : parentFolder
    props.dispatchHandleExpandPath(expandPath)
    props.dispatchUploadFile(target, parentFolder)
  }

  const copyFile = (src: string, dest: string) => {
    try {
      props.dispatchCopyFile(src, dest)
    } catch (error) {
      props.modal('Copy File Failed', 'Unexpected error while copying file: ' + src, 'Close', async () => {})
    }
  }

  const copyFolder = (src: string, dest: string) => {
    try {
      props.dispatchCopyFolder(src, dest)
    } catch (error) {
      props.modal('Copy Folder Failed', 'Unexpected error while copying folder: ' + src, 'Close', async () => {})
    }
  }

  const publishToGist = (path?: string, type?: string) => {
    props.modal('Create a public gist', `Are you sure you want to anonymously publish all your files in the ${name} workspace as a public gist on github.com?`, 'OK', () => toGist(path, type), 'Cancel', () => {})
  }

  const pushChangesToGist = (path?: string, type?: string) => {
    props.modal('Create a public gist', 'Are you sure you want to push changes to remote gist file on github.com?', 'OK', () => toGist(path, type), 'Cancel', () => {})
  }

  const publishFolderToGist = (path?: string, type?: string) => {
    props.modal('Create a public gist', `Are you sure you want to anonymously publish all your files in the ${path} folder as a public gist on github.com?`, 'OK', () => toGist(path, type), 'Cancel', () => {})
  }

  const publishFileToGist = (path?: string, type?: string) => {
    props.modal('Create a public gist', `Are you sure you want to anonymously publish ${path} file as a public gist on github.com?`, 'OK', () => toGist(path, type), 'Cancel', () => {})
  }

  const toGist = (path?: string, type?: string) => {
    props.dispatchPublishToGist(path, type)
  }

  const runScript = async (path: string) => {
    try {
      props.dispatchRunScript(path)
    } catch (error) {
      props.toast('Run script failed')
    }
  }

  const emitContextMenuEvent = (cmd: customAction) => {
    try {
      props.dispatchEmitContextMenuEvent(cmd)
    } catch (error) {
      props.toast(error)
    }
  }

  const handleClickFile = (path: string, type: 'folder' | 'file' | 'gist') => {
    path = path.indexOf(props.name + '/') === 0 ? path.replace(props.name + '/', '') : path
    if (!state.ctrlKey) {
      props.dispatchHandleClickFile(path, type)
    } else {
      if (props.focusElement.findIndex(item => item.key === path) !== -1) {
        const focusElement = props.focusElement.filter(item => item.key !== path)

        props.dispatchSetFocusElement(focusElement)
      } else {
        const nonRootFocus = props.focusElement.filter((el) => { return !(el.key === '' && el.type === 'folder') })

        nonRootFocus.push({ key: path, type })
        props.dispatchSetFocusElement(nonRootFocus)
      }
    }
  }

  const handleClickFolder = async (path: string, type: 'folder' | 'file' | 'gist') => {
    if (state.ctrlKey) {
      if (props.focusElement.findIndex(item => item.key === path) !== -1) {
        const focusElement = props.focusElement.filter(item => item.key !== path)

        props.dispatchSetFocusElement(focusElement)
      } else {
        const nonRootFocus = props.focusElement.filter((el) => { return !(el.key === '' && el.type === 'folder') })

        nonRootFocus.push({ key: path, type })
        props.dispatchSetFocusElement(nonRootFocus)
      }
    } else {
      let expandPath = []

      if (!props.expandPath.includes(path)) {
        expandPath = [...new Set([...props.expandPath, path])]
        props.dispatchFetchDirectory(path)
      } else {
        expandPath = [...new Set(props.expandPath.filter(key => key && (typeof key === 'string') && !key.startsWith(path)))]
      }

      props.dispatchSetFocusElement([{ key: path, type }])
      props.dispatchHandleExpandPath(expandPath)
    }
  }

  const handleContextMenu = (pageX: number, pageY: number, path: string, content: string, type: string) => {
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

  const editModeOn = (path: string, type: string, isNew = false) => {
    if (props.readonly) return props.toast('Cannot write/modify file system in read only mode.')
    setState(prevState => {
      return { ...prevState, focusEdit: { ...prevState.focusEdit, element: path, isNew, type } }
    })
  }

  const editModeOff = async (content: string) => {
    if (typeof content === 'string') content = content.trim()
    const parentFolder = extractParentFromKey(state.focusEdit.element)

    if (!content || (content.trim() === '')) {
      if (state.focusEdit.isNew) {
        props.dispatchRemoveInputField(parentFolder)
        setState(prevState => {
          return { ...prevState, focusEdit: { element: null, isNew: false, type: '', lastEdit: '' } }
        })
      } else {
        setState(prevState => {
          return { ...prevState, focusEdit: { element: null, isNew: false, type: '', lastEdit: '' } }
        })
      }
    } else {
      if (state.focusEdit.lastEdit === content) {
        return setState(prevState => {
          return { ...prevState, focusEdit: { element: null, isNew: false, type: '', lastEdit: '' } }
        })
      }
      if (checkSpecialChars(content)) {
        props.modal('Validation Error', 'Special characters are not allowed', 'OK', () => {})
      } else {
        if (state.focusEdit.isNew) {
          if (hasReservedKeyword(content)) {
            props.dispatchRemoveInputField(parentFolder)
            props.modal('Reserved Keyword', `File name contains Remix reserved keywords. '${content}'`, 'Close', () => {})
          } else {
            state.focusEdit.type === 'file' ? createNewFile(joinPath(parentFolder, content)) : createNewFolder(joinPath(parentFolder, content))
            props.dispatchRemoveInputField(parentFolder)
          }
        } else {
          if (hasReservedKeyword(content)) {
            props.modal('Reserved Keyword', `File name contains Remix reserved keywords. '${content}'`, 'Close', () => {})
          } else {
            if (state.focusEdit.element) {
              const oldPath: string = state.focusEdit.element
              const oldName = extractNameFromKey(oldPath)
              const newPath = oldPath.replace(oldName, content)

              renamePath(oldPath, newPath)
            }
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
    const expandPath = [...new Set([...props.expandPath, parentFolder])]

    await props.dispatchAddInputField(parentFolder, 'file')
    props.dispatchHandleExpandPath(expandPath)
    editModeOn(parentFolder + '/blank', 'file', true)
  }

  const handleNewFolderInput = async (parentFolder?: string) => {
    if (!parentFolder) parentFolder = getFocusedFolder()
    else if ((parentFolder.indexOf('.sol') !== -1) || (parentFolder.indexOf('.js') !== -1)) parentFolder = extractParentFromKey(parentFolder)
    const expandPath = [...new Set([...props.expandPath, parentFolder])]

    await props.dispatchAddInputField(parentFolder, 'folder')
    props.dispatchHandleExpandPath(expandPath)
    editModeOn(parentFolder + '/blank', 'folder', true)
  }

  const handleCopyClick = (path: string, type: 'folder' | 'gist' | 'file') => {
    setState(prevState => {
      return { ...prevState, copyElement: [{ key: path, type }] }
    })
    setCanPaste(true)
    props.toast(`Copied to clipboard ${path}`)
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

  const handleFileExplorerMenuClick = (e: SyntheticEvent) => {
    e.stopPropagation()
    if (e && (e.target as any).getAttribute('data-id') === 'fileExplorerUploadFileuploadFile') return // we don't want to let propagate the input of type file
    if (e && (e.target as any).getAttribute('data-id') === 'fileExplorerFileUpload') return // we don't want to let propagate the input of type file
    let expandPath = []

    if (!props.expandPath.includes(props.name)) {
      expandPath = [props.name, ...new Set([...props.expandPath])]
    } else {
      expandPath = [...new Set(props.expandPath.filter(key => key && (typeof key === 'string') && !key.startsWith(props.name)))]
    }
    props.dispatchHandleExpandPath(expandPath)
  }

  return (
    <div ref={treeRef} tabIndex={0} style={{ outline: "none" }}>
      <TreeView id='treeView'>
        <TreeViewItem id="treeViewItem"
          controlBehaviour={true}
          label={
            <div onClick={handleFileExplorerMenuClick}>
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
                files[props.name] && Object.keys(files[props.name]).map((key, index) => <FileRender
                  file={files[props.name][key]}
                  index={index}
                  focusContext={state.focusContext}
                  focusEdit={state.focusEdit}
                  focusElement={props.focusElement}
                  ctrlKey={state.ctrlKey}
                  expandPath={props.expandPath}
                  editModeOff={editModeOff}
                  handleClickFile={handleClickFile}
                  handleClickFolder={handleClickFolder}
                  handleContextMenu={handleContextMenu}
                  key={index}
                />)
              }
            </TreeView>
          </div>
        </TreeViewItem>
      </TreeView>
      { state.showContextMenu &&
        <FileExplorerContextMenu
          actions={props.focusElement.length > 1 ? state.actions.filter(item => item.multiselect) : state.actions.filter(item => !item.multiselect)}
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
          focus={props.focusElement}
          pushChangesToGist={pushChangesToGist}
          publishFolderToGist={publishFolderToGist}
          publishFileToGist={publishFileToGist}
        />
      }
    </div>
  )
}

export default FileExplorer
