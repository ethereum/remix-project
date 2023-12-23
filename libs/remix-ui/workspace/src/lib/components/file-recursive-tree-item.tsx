import { getPathIcon } from "@remix-ui/helper";
import React, { useEffect, useState } from "react";
import { FileType, WorkspaceElement } from "../types";
import { RecursiveItemInput } from "./file-recursive-item-input";

interface RecursiveTreeItemProps {
  file: FileType
  expandPath?: string[]
  focusEdit: {element: string; type: string; isNew: boolean; lastEdit: string}
  editModeOff: (content: string) => void
  focusElement: {key: string; type: WorkspaceElement}[]
  focusContext: {element: string; x: number; y: number; type: string}
}

export const RecursiveTreeItem = (props: RecursiveTreeItemProps) => {

  const [hover, setHover] = useState<boolean>(false)
  const { file, expandPath, focusEdit, editModeOff } = props

  useEffect(() => {
    console.log('item render')
  },[])

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

  return (
    <>
      <li ref={null} key={`treeViewLi${file.path}`} data-type={file.isDirectory ? 'folder' : 'file'} data-path={`${file.path}`} data-id={`treeViewLi${file.path}`} className="li_tv">
        <div
          key={`treeViewDiv${file.path}`}
          data-id={`treeViewDiv${file.path}`}
          className={`d-flex flex-row align-items-center ${labelClass}`}
          onMouseOver={() => setHover(true)}
          onMouseOut={() => setHover(false)}
        >
          <div className={`pr-2 pl-2 ${file.isDirectory ? expandPath && expandPath.includes(file.path) ? 'fa fa-folder-open' : 'fa fa-folder' : getPathIcon(file.path)} caret caret_tv`}></div>
          {focusEdit && file.path && focusEdit.element === file.path ? 
          <RecursiveItemInput editModeOff={editModeOff} file={file}/>:
          <span draggable="true" className="ml-1 pl-2" data-label-type={file.isDirectory ? 'folder' : 'file'} data-label-path={`${file.path}`}>{file.name}</span>}
        </div>
        <ul className="ul_tv ml-0 pl-1" >
          {
            expandPath && expandPath.includes(file.path) &&
            file.child && Object.keys(file.child).map((key, index) => {
              //console.log('recursive tree', file.child[key])
              return (<RecursiveTreeItem
                editModeOff={editModeOff}
                focusElement={props.focusElement}
                focusContext={props.focusContext}
                focusEdit={props.focusEdit}
                expandPath={expandPath} key={index} file={file.child[key]} />)
            })
          }
        </ul>
      </li>
    </>)
}