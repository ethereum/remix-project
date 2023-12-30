import React, { SyntheticEvent, startTransition, useEffect, useRef, useState } from 'react'
import { Popover } from 'react-bootstrap'
import { FileType, WorkspaceElement } from '../types'
import { ROOT_PATH } from '../utils/constants'
import { getPathIcon } from '@remix-ui/helper';
import { Virtuoso } from 'react-virtuoso'
import { RecursiveItemInput } from './file-recursive-item-input';
import { FlatTreeDrop } from './flat-tree-drop';
import { getEventTarget } from '../utils/getEventTarget';
import { fileDecoration } from '@remix-ui/file-decorators';
import { focusElement } from '../actions/payload';

interface FlatTreeProps {
  files: { [x: string]: Record<string, FileType> },
  flatTree: { [x: string]: FileType },
  expandPath: string[],
  focusEdit: { element: string; type: string; isNew: boolean; lastEdit: string }
  editModeOff: (content: string) => void
  focusElement: { key: string; type: WorkspaceElement }[]
  focusContext: { element: string; x: number; y: number; type: string }
  handleContextMenu: (pageX: number, pageY: number, path: string, content: string, type: string) => void
  handleTreeClick: (e: SyntheticEvent) => void
  treeRef: React.MutableRefObject<HTMLDivElement>
  moveFile: (dest: string, src: string) => void
  moveFolder: (dest: string, src: string) => void
  fileState: fileDecoration[]
}

let mouseTimer: any = {
  path: null,
  timer: null
}

export const FlatTree = (props: FlatTreeProps) => {
  const { files, flatTree, expandPath, focusEdit, editModeOff, handleTreeClick, moveFile, moveFolder, fileState, focusElement } = props
  //const [flatTree, setFlatTree] = useState<{ [x: string]: FileType }>({})
  const [hover, setHover] = useState<string>('')
  const [mouseOverTarget, setMouseOverTarget] = useState<{
    path: string,
    type: string,
    content: string,
    position: {
      top: number,
      left: number
    }
  }>(null)
  const [showMouseOverTarget, setShowMouseOverTarget] = useState<boolean>(false)
  const [dragSource, setDragSource] = useState<FileType>()
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const ref = useRef(null)
  const [size, setSize] = useState(0)
  
  
  const labelClass = (file: FileType) =>
    props.focusEdit.element === file.path
      ? 'bg-light'
      : props.focusElement.findIndex((item) => item.key === file.path) !== -1
        ? 'bg-secondary'
        : hover == file.path
          ? 'bg-light border-no-shift'
          : props.focusContext.element === file.path && props.focusEdit.element !== file.path
            ? 'bg-light border-no-shift'
            : ''

  useEffect(() => {
    console.log('PROP flat tree changed', props.flatTree)
  },[props.flatTree])

  useEffect(() => {
  }, [expandPath, focusEdit, focusElement])

  const getIndentLevelDiv = (path: string) => {
    // remove double slash
    path = path.replace(/\/\//g, '/')
    // remove leading slash
    path = path.replace(/^\//g, '')
    const pathArray = path.split('/')
    const level = pathArray.length - 1
    const indent = level * 4
    return (<div style={{ paddingLeft: `${indent}px` }}></div>)
  }

  const handleContextMenu = async (e: any) => {
    e.preventDefault()
    e.stopPropagation()
    const target = await getEventTarget(e)
    if (target) {
      props.handleContextMenu(e.pageX, e.pageY, target.path, target.content, target.type)
    }
  }

  const onDragStart = async (event: SyntheticEvent) => {
    console.log('drag start', event)
    const target = await getEventTarget(event)
    console.log(flatTree[target.path], target.path)
    setDragSource(flatTree[target.path])
    setIsDragging(true)
  }

  useEffect(() => {
    console.log('drag source', dragSource)
    if(isDragging) {
      mouseTimer = {
        path: null,
        timer: null
      }
    }
  },[isDragging])

  const onDragEnd = (event: SyntheticEvent) => {
    setIsDragging(false)
    console.log('drag end', event)
  }

  const getFlatTreeItem = (path: string) => {
    console.log('get flat tree item', path, flatTree[path])
    return flatTree[path]
  }

  const getFileStateClasses = (file: FileType) => {
    const state = fileState.find((state: fileDecoration) => {
      if (state.path === file.path) return true
      if (state.bubble && file.isDirectory && state.path.startsWith(file.path)) return true
    })
    if (state && state.fileStateLabelClass) {
      return state.fileStateLabelClass
    } 
  }

  const onMouseMove = async (e: any) => {
    ///console.log('mouse move', e)
    const target = await getEventTarget(e, true)
    if (target && target.path) {
      if (mouseTimer.path !== target.path) {
        //console.log('set timer', target)
        setShowMouseOverTarget(false)
        mouseTimer = {
          path: target.path,
          timer: setTimeout(() => {
            if (mouseTimer.path === target.path) {
              setShowMouseOverTarget(true)
              setMouseOverTarget(target)
            }
          }, 1000)
        }
      }
    } else {
      mouseTimer = {
        path: null,
        timer: null
      }
      setShowMouseOverTarget(false)
    }
  }

  const onMouseLeave = async (e: any) => {
    mouseTimer = {
      path: null,
      timer: null
    }
    setShowMouseOverTarget(false)
  }

  useEffect(() => {
    console.log('tree ref', props.treeRef.current)
    const boundingRect = props.treeRef.current.getBoundingClientRect()
    console.log('bounding rect', boundingRect)
    setSize(boundingRect.height - 100)
  },[props.treeRef.current])


  const Row = (index) => {
    const node = Object.keys(flatTree)[index]
    const file = flatTree[node]
    //console.log('node', node)
    return (<li
      className={`d-flex flex-row align-items-center ${labelClass(file)}`}
      onMouseOver={() => setHover(file.path)}
      onMouseOut={() => setHover(file.path)}
      data-type={file.isDirectory ? 'folder' : 'file'} 
      data-path={`${file.path}`} 
      data-id={`treeViewLitreeViewItem${file.path}`}
    >
      {getIndentLevelDiv(file.path)}
      
      <div className={`pr-2 pl-2 ${file.isDirectory ? expandPath && expandPath.includes(file.path) ? 'fa fa-folder-open' : 'fa fa-folder' : getPathIcon(file.path)} caret caret_tv`}></div>
      {focusEdit && file.path && focusEdit.element === file.path ? 
        <RecursiveItemInput editModeOff={editModeOff} file={file}/>:
        <div draggable={true} onDragStart={onDragStart} onDragEnd={onDragEnd} className={`ml-1 pl-2 text-nowrap remixui_leaf ${getFileStateClasses(file)}`} data-label-type={file.isDirectory ? 'folder' : 'file'} data-label-path={`${file.path}`} key={index}>{file.name}
        </div>}
    </li>)
  }

  return (<>
    <FlatTreeDrop
      dragSource={dragSource}
      getFlatTreeItem={getFlatTreeItem}
      moveFile={moveFile}
      moveFolder={moveFolder}
    >
      <div onClick={handleTreeClick} onMouseLeave={onMouseLeave} onMouseMove={onMouseMove} onContextMenu={handleContextMenu}>
        {showMouseOverTarget && mouseOverTarget && !isDragging &&
        <Popover id='popover-basic'
          placement='top'
          ref={ref}
          className='popover'
          style={
            {
              position: 'fixed',
              top: `${mouseOverTarget.position.top}px`,
              left: `${mouseOverTarget.position.left}px`,
              minWidth: 'fit-content'
            }
          }>
          <Popover.Content
            className='text-wrap p-1 px-2 bg-secondary w-100'
          >
            {mouseOverTarget && mouseOverTarget.path}
          </Popover.Content>
        </Popover>
        }
        <Virtuoso
          style={{ height: `${size}px` }}
          totalCount={Object.keys(flatTree).length}
          itemContent={index => Row(index)}
        />
      </div>
    </FlatTreeDrop>
  </>)

}