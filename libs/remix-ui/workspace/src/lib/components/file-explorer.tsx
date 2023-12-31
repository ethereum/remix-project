import React, { useEffect, useState, useRef, SyntheticEvent, useTransition } from 'react' // eslint-disable-line
import { useIntl } from 'react-intl'
import { TreeView } from '@remix-ui/tree-view' // eslint-disable-line
import { FileExplorerMenu } from './file-explorer-menu' // eslint-disable-line
import { FileExplorerContextMenu } from './file-explorer-context-menu' // eslint-disable-line
import { FileExplorerProps, FileType, WorkSpaceState, WorkspaceElement } from '../types'

import '../css/file-explorer.css'
import { checkSpecialChars, extractNameFromKey, extractParentFromKey, getPathIcon, joinPath } from '@remix-ui/helper'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ROOT_PATH } from '../utils/constants'
import { moveFileIsAllowed, moveFolderIsAllowed } from '../actions'
import { FlatTree } from './flat-tree'

export const FileExplorer = (props: FileExplorerProps) => {
  const intl = useIntl()
  const {
    name,
    contextMenuItems,
    removedContextMenuItems,
    files,
    flatTree,
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
  const [isPending, startTransition] = useTransition();
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
            return { ...prevState, ctrlKey: true }
          })
        }
      }

      const keyUpHandler = (e: KeyboardEvent) => {
        if (!e.shiftKey) {
          setState((prevState) => {
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

  const hasReservedKeyword = (content: string): boolean => {
    if (state.reservedKeywords.findIndex((value) => content.startsWith(value)) !== -1) return true
    else return false
  }

  const createNewFile = async (newFilePath: string) => {
    try {
      props.dispatchCreateNewFile(newFilePath, ROOT_PATH)
    } catch (error) {
      return props.modal(
        intl.formatMessage({ id: 'filePanel.fileCreationFailed' }),
        typeof error === 'string' ? error : error.message,
        intl.formatMessage({ id: 'filePanel.close' }),
        async () => { }
      )
    }
  }

  const createNewFolder = async (newFolderPath: string) => {
    try {
      props.dispatchCreateNewFolder(newFolderPath, ROOT_PATH)
    } catch (e) {
      return props.modal(
        intl.formatMessage({ id: 'filePanel.folderCreationFailed' }),
        typeof e === 'string' ? e : e.message,
        intl.formatMessage({ id: 'filePanel.close' }),
        async () => { }
      )
    }
  }

  const renamePath = async (oldPath: string, newPath: string) => {
    try {
      props.dispatchRenamePath(oldPath, newPath)
    } catch (error) {
      props.modal(
        intl.formatMessage({ id: 'filePanel.renameFileFailed' }),
        intl.formatMessage({ id: 'filePanel.renameFileFailedMsg' }, { error: typeof error === 'string' ? error : error.message }),
        intl.formatMessage({ id: 'filePanel.close' }),
        async () => { }
      )
    }
  }

  const publishToGist = (path?: string, type?: string) => {
    props.modal(
      intl.formatMessage({ id: 'filePanel.createPublicGist' }),
      intl.formatMessage({ id: 'filePanel.createPublicGistMsg4' }, { name }),
      intl.formatMessage({ id: 'filePanel.ok' }),
      () => toGist(path, type),
      intl.formatMessage({ id: 'filePanel.cancel' }),
      () => { }
    )
  }

  const handleClickFile = (path: string, type: WorkspaceElement) => {
    console.log('handleClickFile', path, type)
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

        nonRootFocus.push({ key: path, type })
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

        nonRootFocus.push({ key: path, type })
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
      console.log('handleClickFolder', path, type)
      props.dispatchSetFocusElement([{ key: path, type }])
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
            focusEdit: { element: null, isNew: false, type: '', lastEdit: '' }
          }
        })
      } else {
        setState((prevState) => {
          return {
            ...prevState,
            focusEdit: { element: null, isNew: false, type: '', lastEdit: '' }
          }
        })
      }
    } else {
      if (state.focusEdit.lastEdit === content) {
        return setState((prevState) => {
          return {
            ...prevState,
            focusEdit: { element: null, isNew: false, type: '', lastEdit: '' }
          }
        })
      }
      if (checkSpecialChars(content)) {
        props.modal(
          intl.formatMessage({ id: 'filePanel.validationError' }),
          intl.formatMessage({ id: 'filePanel.validationErrorMsg' }),
          intl.formatMessage({ id: 'filePanel.ok' }),
          () => { }
        )
      } else {
        if (state.focusEdit.isNew) {
          if (hasReservedKeyword(content)) {
            props.dispatchRemoveInputField(parentFolder)
            props.modal(
              intl.formatMessage({ id: 'filePanel.reservedKeyword' }),
              intl.formatMessage({ id: 'filePanel.reservedKeywordMsg' }, { content }),
              intl.formatMessage({ id: 'filePanel.close' }),
              () => { }
            )
          } else {
            state.focusEdit.type === 'file' ? createNewFile(joinPath(parentFolder, content)) : createNewFolder(joinPath(parentFolder, content))
            props.dispatchRemoveInputField(parentFolder)
          }
        } else {
          if (hasReservedKeyword(content)) {
            props.modal(
              intl.formatMessage({ id: 'filePanel.reservedKeyword' }),
              intl.formatMessage({ id: 'filePanel.reservedKeywordMsg' }, { content }),
              intl.formatMessage({ id: 'filePanel.close' }),
              () => { }
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
            focusEdit: { element: null, isNew: false, type: '', lastEdit: '' }
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
    if (await moveFileIsAllowed(src, dest) === false) return
    try {
      props.modal(
        intl.formatMessage({ id: 'filePanel.moveFile' }),
        intl.formatMessage({ id: 'filePanel.moveFileMsg1' }, { src, dest }),
        intl.formatMessage({ id: 'filePanel.yes' }),
        () => props.dispatchMoveFile(src, dest),
        intl.formatMessage({ id: 'filePanel.cancel' }),
        () => { }
      )
    } catch (error) {
      props.modal(
        intl.formatMessage({ id: 'filePanel.movingFileFailed' }),
        intl.formatMessage({ id: 'filePanel.movingFileFailedMsg' }, { src }),
        intl.formatMessage({ id: 'filePanel.close' }),
        async () => { }
      )
    }
  }

  const handleFolderMove = async (dest: string, src: string) => {
    if (await moveFolderIsAllowed(src, dest) === false) return
    try {
      props.modal(
        intl.formatMessage({ id: 'filePanel.moveFile' }),
        intl.formatMessage({ id: 'filePanel.moveFileMsg1' }, { src, dest }),
        intl.formatMessage({ id: 'filePanel.yes' }),
        () => props.dispatchMoveFolder(src, dest),
        intl.formatMessage({ id: 'filePanel.cancel' }),
        () => { }
      )
    } catch (error) {
      props.modal(
        intl.formatMessage({ id: 'filePanel.movingFolderFailed' }),
        intl.formatMessage({ id: 'filePanel.movingFolderFailedMsg' }, { src }),
        intl.formatMessage({ id: 'filePanel.close' }),
        async () => { }
      )
    }
  }

  useEffect(() => {
    console.log('fe files changed', ROOT_PATH, files, flatTree)

  }, [flatTree, files])
  
  useEffect(() => {
    console.log('FE RENDER', ROOT_PATH)
  }, [])

  const handleTreeClick = (event: SyntheticEvent) => {
    event.stopPropagation()
    //console.log('tree click', event.target)


    let target = event.target as HTMLElement
    while (target && target.getAttribute && !target.getAttribute('data-path')) {
      target = target.parentElement
    }
    if (target && target.getAttribute) {
      const path = target.getAttribute('data-path')
      const type = target.getAttribute('data-type')
      if (path && type === 'file') {
        console.log('tree click', path)

        if (state.focusEdit.element !== path) handleClickFile(path, type)
       
      } else if (path && type === 'folder') {
        console.log('tree click', path)
        if (state.focusEdit.element !== path) handleClickFolder(path, type)
        
      }
      if (props.showIconsMenu === true) props.hideIconsMenu(!props.showIconsMenu)
    }

  }



  return (

    <div ref={treeRef} tabIndex={0} style={{ outline: 'none',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
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
        <div style={{flexGrow: 2}}>
          <div>
            <FlatTree
              treeRef={treeRef}
              handleTreeClick={handleTreeClick}
              focusEdit={state.focusEdit}
              focusElement={props.focusElement}
              focusContext={state.focusContext}
              editModeOff={editModeOff}
              files={files}
              flatTree={flatTree}
              fileState={fileState}
              expandPath={props.expandPath}
              handleContextMenu={handleContextMenu}
              moveFile={handleFileMove}
              moveFolder={handleFolderMove}
            />
          </div>
        </div>
          
        <div className='d-block w-100 pb-4 mb-4'></div>
      </TreeView>
    </div>

  )
}

export default FileExplorer
