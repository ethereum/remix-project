import React, {useEffect, useState, useRef, SyntheticEvent} from 'react' // eslint-disable-line
import {useIntl} from 'react-intl'
import {TreeView} from '@remix-ui/tree-view' // eslint-disable-line
import {FileExplorerMenu} from './file-explorer-menu' // eslint-disable-line
import {FileExplorerContextMenu} from './file-explorer-context-menu' // eslint-disable-line
import {FileExplorerProps, FileType, WorkSpaceState} from '../types'

import '../css/file-explorer.css'
import {checkSpecialChars, extractNameFromKey, extractParentFromKey, joinPath} from '@remix-ui/helper'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {FileRender} from './file-render'
import {Drag, Draggable} from '@remix-ui/drag-n-drop'
import {ROOT_PATH} from '../utils/constants'
import { fileKeySort } from '../utils'
import { moveFileIsAllowed, moveFolderIsAllowed } from '../actions'

export const FileExplorer = (props: FileExplorerProps) => {
  const intl = useIntl()
  const {
    name,
    contextMenuItems,
    removedContextMenuItems,
    files,
    workspaceState,
    toGist,
    addMenuItems,
    removeMenuItems,
    handleContextMenu,
    handleNewFileInput,
    handleNewFolderInput,
    uploadFile,
    uploadFolder,
    fileState
  } = props
  const [state, setState] = useState<WorkSpaceState>(workspaceState)
  const treeRef = useRef<HTMLDivElement>(null)
  const [childrenKeys, setChildrenKeys] = useState<string[]>([])

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
      setState((prevState) => {
        return {
          ...prevState,
          focusEdit: {
            element: props.focusEdit,
            type: 'file',
            isNew: true,
            lastEdit: null
          }
        }
      })
    }
  }, [props.focusEdit])

  useEffect(() => {
    setState(workspaceState)
  }, [workspaceState])

  useEffect(() => {
    if (treeRef.current) {
      const keyPressHandler = (e: KeyboardEvent) => {
        if (e.shiftKey) {
          setState((prevState) => {
            return {...prevState, ctrlKey: true}
          })
        }
      }

      const keyUpHandler = (e: KeyboardEvent) => {
        if (!e.shiftKey) {
          setState((prevState) => {
            return {...prevState, ctrlKey: false}
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

  const hasReservedKeyword = (content: string): boolean => {
    if (state.reservedKeywords.findIndex((value) => content.startsWith(value)) !== -1) return true
    else return false
  }

  const createNewFile = async (newFilePath: string) => {
    try {
      props.dispatchCreateNewFile(newFilePath, ROOT_PATH)
    } catch (error) {
      return props.modal(
        intl.formatMessage({id: 'filePanel.fileCreationFailed'}),
        typeof error === 'string' ? error : error.message,
        intl.formatMessage({id: 'filePanel.close'}),
        async () => {}
      )
    }
  }

  const createNewFolder = async (newFolderPath: string) => {
    try {
      props.dispatchCreateNewFolder(newFolderPath, ROOT_PATH)
    } catch (e) {
      return props.modal(
        intl.formatMessage({id: 'filePanel.folderCreationFailed'}),
        typeof e === 'string' ? e : e.message,
        intl.formatMessage({id: 'filePanel.close'}),
        async () => {}
      )
    }
  }

  const renamePath = async (oldPath: string, newPath: string) => {
    try {
      props.dispatchRenamePath(oldPath, newPath)
    } catch (error) {
      props.modal(
        intl.formatMessage({id: 'filePanel.renameFileFailed'}),
        intl.formatMessage({id: 'filePanel.renameFileFailedMsg'}, {error: typeof error === 'string' ? error : error.message}),
        intl.formatMessage({id: 'filePanel.close'}),
        async () => {}
      )
    }
  }

  const publishToGist = (path?: string, type?: string) => {
    props.modal(
      intl.formatMessage({id: 'filePanel.createPublicGist'}),
      intl.formatMessage({id: 'filePanel.createPublicGistMsg4'}, {name}),
      intl.formatMessage({id: 'filePanel.ok'}),
      () => toGist(path, type),
      intl.formatMessage({id: 'filePanel.cancel'}),
      () => {}
    )
  }

  const handleClickFile = (path: string, type: 'folder' | 'file' | 'gist') => {
    if (!state.ctrlKey) {
      props.dispatchHandleClickFile(path, type)
    } else {
      if (props.focusElement.findIndex((item) => item.key === path) !== -1) {
        const focusElement = props.focusElement.filter((item) => item.key !== path)

        props.dispatchSetFocusElement(focusElement)
      } else {
        const nonRootFocus = props.focusElement.filter((el) => {
          return !(el.key === '' && el.type === 'folder')
        })

        nonRootFocus.push({key: path, type})
        props.dispatchSetFocusElement(nonRootFocus)
      }
    }
  }

  const handleClickFolder = async (path: string, type: 'folder' | 'file' | 'gist') => {
    if (state.ctrlKey) {
      if (props.focusElement.findIndex((item) => item.key === path) !== -1) {
        const focusElement = props.focusElement.filter((item) => item.key !== path)

        props.dispatchSetFocusElement(focusElement)
      } else {
        const nonRootFocus = props.focusElement.filter((el) => {
          return !(el.key === '' && el.type === 'folder')
        })

        nonRootFocus.push({key: path, type})
        props.dispatchSetFocusElement(nonRootFocus)
      }
    } else {
      let expandPath = []

      if (!props.expandPath.includes(path)) {
        expandPath = [...new Set([...props.expandPath, path])]
        props.dispatchFetchDirectory(path)
      } else {
        expandPath = [...new Set(props.expandPath.filter((key) => key && typeof key === 'string' && !key.startsWith(path)))]
      }

      props.dispatchSetFocusElement([{key: path, type}])
      props.dispatchHandleExpandPath(expandPath)
    }
  }

  const editModeOff = async (content: string) => {
    if (typeof content === 'string') content = content.trim()
    const parentFolder = extractParentFromKey(state.focusEdit.element)

    if (!content || content.trim() === '') {
      if (state.focusEdit.isNew) {
        props.dispatchRemoveInputField(parentFolder)
        setState((prevState) => {
          return {
            ...prevState,
            focusEdit: {element: null, isNew: false, type: '', lastEdit: ''}
          }
        })
      } else {
        setState((prevState) => {
          return {
            ...prevState,
            focusEdit: {element: null, isNew: false, type: '', lastEdit: ''}
          }
        })
      }
    } else {
      if (state.focusEdit.lastEdit === content) {
        return setState((prevState) => {
          return {
            ...prevState,
            focusEdit: {element: null, isNew: false, type: '', lastEdit: ''}
          }
        })
      }
      if (checkSpecialChars(content)) {
        props.modal(
          intl.formatMessage({id: 'filePanel.validationError'}),
          intl.formatMessage({id: 'filePanel.validationErrorMsg'}),
          intl.formatMessage({id: 'filePanel.ok'}),
          () => {}
        )
      } else {
        if (state.focusEdit.isNew) {
          if (hasReservedKeyword(content)) {
            props.dispatchRemoveInputField(parentFolder)
            props.modal(
              intl.formatMessage({id: 'filePanel.reservedKeyword'}),
              intl.formatMessage({id: 'filePanel.reservedKeywordMsg'}, {content}),
              intl.formatMessage({id: 'filePanel.close'}),
              () => {}
            )
          } else {
            state.focusEdit.type === 'file' ? createNewFile(joinPath(parentFolder, content)) : createNewFolder(joinPath(parentFolder, content))
            props.dispatchRemoveInputField(parentFolder)
          }
        } else {
          if (hasReservedKeyword(content)) {
            props.modal(
              intl.formatMessage({id: 'filePanel.reservedKeyword'}),
              intl.formatMessage({id: 'filePanel.reservedKeywordMsg'}, {content}),
              intl.formatMessage({id: 'filePanel.close'}),
              () => {}
            )
          } else {
            if (state.focusEdit.element) {
              const oldPath: string = state.focusEdit.element
              const oldName = extractNameFromKey(oldPath)
              const newPath = oldPath.replace(oldName, content)

              renamePath(oldPath, newPath)
            }
          }
        }
        setState((prevState) => {
          return {
            ...prevState,
            focusEdit: {element: null, isNew: false, type: '', lastEdit: ''}
          }
        })
      }
    }
  }

  const handleFileExplorerMenuClick = (e: SyntheticEvent) => {
    e.stopPropagation()
    if (e && (e.target as any).getAttribute('data-id') === 'fileExplorerUploadFileuploadFile') return // we don't want to let propagate the input of type file
    if (e && (e.target as any).getAttribute('data-id') === 'fileExplorerFileUpload') return // we don't want to let propagate the input of type file
    let expandPath = []

    if (!props.expandPath.includes(ROOT_PATH)) {
      expandPath = [ROOT_PATH, ...new Set([...props.expandPath])]
    } else {
      expandPath = [...new Set(props.expandPath.filter((key) => key && typeof key === 'string'))]
    }
    props.dispatchHandleExpandPath(expandPath)
  }

  const handleFileMove = async (dest: string, src: string) => {
    if(await moveFileIsAllowed(src, dest) === false) return
    try {
      props.modal(
        intl.formatMessage({ id: 'filePanel.moveFile' }),
        intl.formatMessage({ id: 'filePanel.moveFileMsg1' }, { src, dest }),
        intl.formatMessage({ id: 'filePanel.yes' }),
        () => props.dispatchMoveFile(src, dest),
        intl.formatMessage({ id: 'filePanel.cancel' }),
        () => {}
      )
    } catch (error) {
      props.modal(
        intl.formatMessage({ id: 'filePanel.movingFileFailed' }),
        intl.formatMessage({ id: 'filePanel.movingFileFailedMsg' }, { src }),
        intl.formatMessage({ id: 'filePanel.close' }),
        async () => {}
      )
    }
  }

  const handleFolderMove = async (dest: string, src: string) => {
    if(await moveFolderIsAllowed(src, dest) === false) return
    try {
      props.modal(
        intl.formatMessage({ id: 'filePanel.moveFile' }),
        intl.formatMessage({ id: 'filePanel.moveFileMsg1' }, { src, dest }),
        intl.formatMessage({ id: 'filePanel.yes' }),
        () => props.dispatchMoveFolder(src, dest),
        intl.formatMessage({ id: 'filePanel.cancel' }),
        () => {}
      )
    } catch (error) {
      props.modal(
        intl.formatMessage({ id: 'filePanel.movingFolderFailed' }),
        intl.formatMessage({ id: 'filePanel.movingFolderFailedMsg' }, { src }),
        intl.formatMessage({ id: 'filePanel.close' }),
        async () => {}
      )
    }
  }

  useEffect(() => {
    if (files[ROOT_PATH]){
      try {
        const children: FileType[] = files[ROOT_PATH] as any
        setChildrenKeys(fileKeySort(children))
      } catch (error) {
        setChildrenKeys(Object.keys(files[ROOT_PATH]))
      }
    } else{
      setChildrenKeys([])
    }
  }, [props])


  return (
    <Drag onFileMoved={handleFileMove} onFolderMoved={handleFolderMove}>
      <div ref={treeRef} tabIndex={0} style={{outline: 'none'}}>
        <TreeView id="treeView">
          <li key={`treeViewLiMenu`} data-id={`treeViewLiMenu`} className="li_tv">
            <div
              key={`treeViewDivMenu`}
              data-id={`treeViewDivMenu`}
              className={`d-flex flex-row align-items-center`}
            >
              <span className="w-100 pl-2 mt-1">
                <div onClick={handleFileExplorerMenuClick}>
                  <FileExplorerMenu
                    title={''}
                    menuItems={props.menuItems}
                    createNewFile={handleNewFileInput}
                    createNewFolder={handleNewFolderInput}
                    publishToGist={publishToGist}
                    uploadFile={uploadFile}
                    uploadFolder={uploadFolder}
                  />
                </div>
              </span>
            </div>
          </li>
          <div>
            <TreeView id="treeViewMenu">
              {files[ROOT_PATH] &&
                childrenKeys.map((key, index) => (
                  <FileRender
                    file={files[ROOT_PATH][key]}
                    fileDecorations={fileState}
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
                    showIconsMenu={props.showIconsMenu}
                    hideIconsMenu={props.hideIconsMenu}
                  />
                ))
              }
            </TreeView>
          </div>
          <Draggable isDraggable={false} file={{ name: '/', path: '/', type: 'folder', isDirectory: true }} expandedPath={props.expandPath} handleClickFolder={null}>
            <div className='d-block w-100 pb-4 mb-4'></div>
          </Draggable>
        </TreeView>
      </div>
    </Drag>
  )
}

export default FileExplorer
