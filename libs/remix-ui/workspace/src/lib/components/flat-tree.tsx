import React, { SyntheticEvent, startTransition, useEffect, useRef, useState } from 'react'
import { Popover } from 'react-bootstrap'
import { FileType, WorkspaceElement } from '../types'
import { ROOT_PATH } from '../utils/constants'
import { getPathIcon } from '@remix-ui/helper';
import { Virtuoso } from 'react-virtuoso'
import { RecursiveItemInput } from './file-recursive-item-input';

interface FlatTreeProps {
  files: { [x: string]: Record<string, FileType> },
  expandPath: string[],
  focusEdit: { element: string; type: string; isNew: boolean; lastEdit: string }
  editModeOff: (content: string) => void
  focusElement: { key: string; type: WorkspaceElement }[]
  focusContext: { element: string; x: number; y: number; type: string }
  handleContextMenu: (pageX: number, pageY: number, path: string, content: string, type: string) => void
  handleTreeClick: (e: SyntheticEvent) => void
  treeRef: React.MutableRefObject<HTMLDivElement>
}

let mouseTimer: any = {
  path: null,
  timer: null
}

export const FlatTree = (props: FlatTreeProps) => {
  const { files, expandPath, focusEdit, editModeOff, handleTreeClick } = props
  const [flatTree, setFlatTree] = useState<{ [x: string]: FileType }>({})
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
    console.log('flat files changed', files, ROOT_PATH)
    const flatTree = {}
    const mapChild = (file: FileType) => {
      flatTree[file.path] = file
      expandPath && expandPath.includes(file.path) &&
        file.child && Object.keys(file.child).map((key) => {
        mapChild(file.child[key])
      })
    }
    files && files[ROOT_PATH] && Object.keys(files[ROOT_PATH]).map((key) => {
      mapChild(files[ROOT_PATH][key])
    })
    console.log('flat tree', flatTree)
    setFlatTree(flatTree)
  }, [props])




  const getIndentLevelDiv = (path: string) => {
    const pathArray = path.split('/')
    const level = pathArray.length - 1
    const indent = level * 10
    return (<div style={{ width: `${indent}px` }}></div>)
  }

  const getEventTarget = async (e: any, useLabel: boolean = false) => {
    let target = e.target as HTMLElement
    while (target && target.getAttribute && !target.getAttribute(useLabel? 'data-label-path' : 'data-path')) {
      target = target.parentElement
    }
    if (target && target.getAttribute) {
      const path = target.getAttribute(useLabel? 'data-label-path' : 'data-path')
      const type = target.getAttribute(useLabel? 'data-label-type' : 'data-type')
      const position = target.getBoundingClientRect()
      // get size of element

      const endPosition = {
        top: position.top - position.height * 2 + 4,
        left: position.left ,
      }

      const content = target.textContent
      return {
        path,
        type,
        content,
        position: endPosition
      }
    }
  }

  const handleContextMenu = async (e: any) => {
    e.preventDefault()
    e.stopPropagation()
    const target = await getEventTarget(e)
    if (target) {
      props.handleContextMenu(e.pageX, e.pageY, target.path, target.content, target.type)
    }
  }

  const onDragEnd = (event: SyntheticEvent) => {
    console.log('drag end', event)
  }

  const onDrop = async (event: SyntheticEvent) => {
    event.preventDefault()
    console.log('drop', event)
    const target = await getEventTarget(event)
    console.log('drop', target)
  }

  const onDragOver = async (e: SyntheticEvent) => {
    e.preventDefault()
    //console.log('drag over', e)
    const target = await getEventTarget(e)
    //console.log('drag over', target)
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
    return (<div
      className={`d-flex flex-row align-items-center ${labelClass(file)}`}
      onMouseOver={() => setHover(file.path)}
      onMouseOut={() => setHover(file.path)}
      data-type={file.isDirectory ? 'folder' : 'file'} data-path={`${file.path}`} data-id={`treeViewLi${file.path}`}
    >
      {getIndentLevelDiv(file.path)}
      
      <div className={`pr-2 pl-2 ${file.isDirectory ? expandPath && expandPath.includes(file.path) ? 'fa fa-folder-open' : 'fa fa-folder' : getPathIcon(file.path)} caret caret_tv`}></div>
      {focusEdit && file.path && focusEdit.element === file.path ? 
        <RecursiveItemInput editModeOff={editModeOff} file={file}/>:
        <div draggable={true} className="ml-1 pl-2" data-label-type={file.isDirectory ? 'folder' : 'file'} data-label-path={`${file.path}`} key={index}>{file.name}
        </div>}
    </div>)
  }

  return (<>
    <div onClick={handleTreeClick} onMouseLeave={onMouseLeave} onMouseMove={onMouseMove} onDrop={onDrop} onDragOver={onDragOver} onContextMenu={handleContextMenu}>
      {showMouseOverTarget && mouseOverTarget &&
        <Popover id='popover-basic'
          placement='top'
          ref={ref}
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
  </>)

}