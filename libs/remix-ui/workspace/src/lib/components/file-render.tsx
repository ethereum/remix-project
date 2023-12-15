// eslint-disable-next-line no-use-before-define
import React, { SyntheticEvent, useEffect, useState } from 'react'
import { FileType, WorkspaceElement } from '../types'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { TreeView, TreeViewItem } from '@remix-ui/tree-view'
import { getPathIcon } from '@remix-ui/helper'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FileLabel } from './file-label'
import { fileDecoration, FileDecorationIcons } from '@remix-ui/file-decorators'
import { Draggable } from '@remix-ui/drag-n-drop'
import { fileKeySort } from '../utils'

export interface RenderFileProps {
  file: FileType
  index: number
  focusEdit: { element: string; type: string; isNew: boolean; lastEdit: string }
  focusElement: { key: string; type: WorkspaceElement }[]
  focusContext: { element: string; x: number; y: number; type: string }
  ctrlKey: boolean
  expandPath: string[]
  hideIconsMenu?: React.Dispatch<React.SetStateAction<boolean>>
  showIconsMenu?: boolean
  editModeOff: (content: string) => void
  handleClickFolder: (path: string, type: string) => void
  handleClickFile: (path: string, type: string) => void
  handleContextMenu: (pageX: number, pageY: number, path: string, content: string, type: string) => void
  fileDecorations: fileDecoration[]
  dragStatus: boolean
}

export const FileRender = (props: RenderFileProps) => {
  const { file } = props
  const [hover, setHover] = useState<boolean>(false)
  //const [icon, setIcon] = useState<string>('')
  const [childrenKeys, setChildrenKeys] = useState<string[]>([])

  useEffect(() => {
    //if (props.file && props.file.path && props.file.type) {
    //  //consolelog('set icon', props.file.path)
    //  setIcon(getPathIcon(props.file.path))
    //}
  }, [props.file])

  useEffect(() => {
    //consolelog('file render', props.file.path)
  }, [])

  useEffect(() => {
    return
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
  //consolelog('eval file render', file.path)

  if (!file.path) return (<></>)

  ///return (<><div className='btn btn-primary'>file</div></>)

  if (file.isDirectory && false) {
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
                <FileLabel fileDecorations={props.fileDecorations} file={file} focusEdit={props.focusEdit} editModeOff={props.editModeOff} dragStatus={props.dragStatus} />
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
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
      >
        {file.child ? (
          <TreeView id={`treeView${file.path}`} key={`treeView${file.path}`} {...spreadProps}>
            {Object.keys(file.child).map((key, index) => (
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
              />
            ))}
          </TreeView>
        ) : (
          <TreeView id={`treeView${file.path}`} key={`treeView${file.path}`} {...spreadProps} />
        )}
      </TreeViewItem>
    )
  } else if (!file.isDirectory) {
    //consolelog('start do file render', file.path)
    return (
      <>
        <li ref={null} key={`treeViewLi${file.path}`} data-id={`treeViewLi${file.path}`} className="li_tv">
          <div
            key={`treeViewDiv${file.path}`}
            data-id={`treeViewDiv${file.path}`}
            className={`d-flex flex-row align-items-center ${labelClass}`}
            onClick={() => {}}
          >
            <div className={`pr-2 pl-2 ${getPathIcon(file.path)} caret caret_tv`}></div>
            <span className="w-100 ml-1 pl-2">{file.name}</span>
          </div>
        </li>
      </>
    )
  } else {
    return <></>
  }
}
