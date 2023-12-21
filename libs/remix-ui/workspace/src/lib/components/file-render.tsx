// eslint-disable-next-line no-use-before-define
import React, {SyntheticEvent, useEffect, useState} from 'react'
import {FileType, WorkspaceElement} from '../types'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {TreeView, TreeViewItem} from '@remix-ui/tree-view'
import {getPathIcon} from '@remix-ui/helper'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {FileLabel} from './file-label'
import {fileDecoration, FileDecorationIcons} from '@remix-ui/file-decorators'
import {Draggable} from '@remix-ui/drag-n-drop'
import { fileKeySort } from '../utils'

export interface RenderFileProps {
  file: FileType
  index: number
  focusEdit: {element: string; type: string; isNew: boolean; lastEdit: string}
  focusElement: {key: string; type: WorkspaceElement}[]
  focusContext: {element: string; x: number; y: number; type: string}
  ctrlKey: boolean
  expandPath: string[]
  hideIconsMenu?: React.Dispatch<React.SetStateAction<boolean>>
  showIconsMenu?: boolean
  editModeOff: (content: string) => void
  handleClickFolder: (path: string, type: string) => void
  handleClickFile: (path: string, type: string) => void
  handleContextMenu: (pageX: number, pageY: number, path: string, content: string, type: string) => void
  editModeOn: any
  handleFolderInput: any
  handleFileInput: any
  deletePath: any
  fileDecorations: fileDecoration[]
  dragStatus: boolean
}

export const FileRender = (props: RenderFileProps) => {
  const [file, setFile] = useState<FileType>({} as FileType)
  const [hover, setHover] = useState<boolean>(false)
  const [icon, setIcon] = useState<string>('')
  const [childrenKeys, setChildrenKeys] = useState<string[]>([])

  useEffect(() => {
    if (props.file && props.file.path && props.file.type) {
      setFile(props.file)
      setIcon(getPathIcon(props.file.path))
    }
  }, [props.file])

  useEffect(() => {
    if (file.child) {
      try {
        const children: FileType[] = file.child as any
        setChildrenKeys(fileKeySort(children))
      } catch (e) {
        setChildrenKeys(Object.keys(file.child))
      }
    } else {
      setChildrenKeys([])
    }
  }, [file.child, props.expandPath, props.file])

  const labelClass =
    props.focusEdit.element === file.path
      ? 'bg-light'
      : props.focusElement.findIndex((item) => item.key === file.path) !== -1
        ? 'bg-secondary'
        : hover
          ? 'bg-light border-no-shift'
          : props.focusContext.element === file.path && props.focusEdit.element !== file.path
            ? 'bg-light border-no-shift'
            : ''

  const spreadProps = {
    onClick: (e) => e.stopPropagation()
  }

  const handleFolderClick = (event: SyntheticEvent) => {
    event.stopPropagation()
    if (props.focusEdit.element !== file.path) props.handleClickFolder(file.path, file.type)
    if (props.showIconsMenu === true) props.hideIconsMenu(!props.showIconsMenu)
  }

  const handleFileClick = (event: SyntheticEvent) => {
    event.stopPropagation()
    if (props.focusEdit.element !== file.path) props.handleClickFile(file.path, file.type)
    if (props.showIconsMenu === true) props.hideIconsMenu(!props.showIconsMenu)
  }

  const handleContextMenu = (event: PointerEvent) => {
    event.preventDefault()
    event.stopPropagation()
    props.handleContextMenu(event.pageX, event.pageY, file.path, (event.target as HTMLElement).textContent, file.type)
  }

  const handleMouseOut = (event: SyntheticEvent) => {
    event.stopPropagation()
    setHover(false)
  }

  const handleMouseOver = (event: SyntheticEvent) => {
    event.stopPropagation()
    setHover(true)
  }

  if (file.isDirectory) {
    return (
      <TreeViewItem
        id={`treeViewItem${file.path}`}
        iconX="mr-2 fa fa-folder"
        iconY={props.expandPath.includes(file.path) ? 'fa fa-folder-open' : 'fa fa-folder'}
        key={`${file.path + props.index}`}
        label={
          <>
            <Draggable isDraggable={props.focusEdit.element !== null} file={file} expandedPath={props.expandPath} handleClickFolder={props.handleClickFolder}>
              <div className="d-flex flex-row">
                <FileLabel
                  fileDecorations={props.fileDecorations}
                  file={file} focusEdit={props.focusEdit}
                  editModeOff={props.editModeOff}
                  dragStatus={props.dragStatus}
                  hover={hover}
                  handleNewFolderCreation={props.handleFolderInput}
                  handleNewFileCreation={props.handleFileInput}
                  editModeOn={props.editModeOn}
                  deletePath={props.deletePath}
                />
                <FileDecorationIcons file={file} fileDecorations={props.fileDecorations} />
              </div>
            </Draggable>
          </>
        }
        onClick={handleFolderClick}
        onContextMenu={handleContextMenu}
        labelClass={labelClass}
        controlBehaviour={props.ctrlKey}
        expand={props.expandPath.includes(file.path)}
        onMouseEnter={handleMouseOver}
        onMouseLeave={handleMouseOut}
      >
        {file.child ? (
          <TreeView id={`treeView${file.path}`} key={`treeView${file.path}`} {...spreadProps}>
            {childrenKeys.map((key, index) => (
              <FileRender
                file={file.child[key]}
                fileDecorations={props.fileDecorations}
                index={index}
                focusContext={props.focusContext}
                focusEdit={props.focusEdit}
                focusElement={props.focusElement}
                ctrlKey={props.ctrlKey}
                editModeOff={props.editModeOff}
                handleClickFile={props.handleClickFile}
                handleClickFolder={props.handleClickFolder}
                handleContextMenu={props.handleContextMenu}
                expandPath={props.expandPath}
                key={index}
                dragStatus={props.dragStatus}
                handleFolderInput={props.handleFolderInput}
                handleFileInput={props.handleFileInput}
                editModeOn={props.editModeOn}
                deletePath={props.deletePath}
              />
            ))}
          </TreeView>
        ) : (
          <TreeView id={`treeView${file.path}`} key={`treeView${file.path}`} {...spreadProps} />
        )}
      </TreeViewItem>
    )
  } else {
    return (
      <TreeViewItem
        id={`treeViewItem${file.path}`}
        key={`treeView${file.path}`}
        label={
          <>
            <Draggable isDraggable={props.focusEdit.element !== null} file={file} expandedPath={props.expandPath} handleClickFolder={props.handleClickFolder}>
              <div className="d-flex flex-row">
                <FileLabel
                  fileDecorations={props.fileDecorations}
                  file={file}
                  focusEdit={props.focusEdit}
                  editModeOff={props.editModeOff}
                  dragStatus={props.dragStatus}
                  hover={hover}
                  handleNewFolderCreation={props.handleFolderInput}
                  handleNewFileCreation={props.handleFileInput}
                  editModeOn={props.editModeOn}
                  deletePath={props.deletePath}
                />
                <FileDecorationIcons file={file} fileDecorations={props.fileDecorations} />
              </div>
            </Draggable>
          </>
        }
        onClick={handleFileClick}
        onContextMenu={handleContextMenu}
        icon={icon}
        labelClass={labelClass}
        onMouseEnter={handleMouseOver}
        onMouseLeave={handleMouseOut}
      />
    )
  }
}
