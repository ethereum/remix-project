import React, { SyntheticEvent, useEffect, useRef, useState } from 'react'
import { Popover } from 'react-bootstrap'
import { FileType, WorkspaceElement } from '../types'
import { ROOT_PATH } from '../utils/constants'
import { RecursiveTreeItem } from './file-recursive-tree-item'

interface RecursiveTreeProps {
  files: { [x: string]: Record<string, FileType> },
  expandPath: string[],
  handleContextMenu: (pageX: number, pageY: number, path: string, content: string, type: string) => void
  focusEdit: {element: string; type: string; isNew: boolean; lastEdit: string}
  focusElement: {key: string; type: WorkspaceElement}[]
  focusContext: {element: string; x: number; y: number; type: string}
  editModeOff: (content: string) => void
}

let mouseTimer: any = {
  path: null,
  timer: null
}


export const RecursiveTree = (props: RecursiveTreeProps) => {
  const { files, expandPath, editModeOff } = props
  const ref = useRef(null)
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

  useEffect(() => {
    console.log('focus edit', props.focusEdit)
  },[props.focusEdit])

  useEffect(() => {
    console.log('STATE', props.focusContext, props.focusElement, props.focusEdit, expandPath)
    //files[ROOT_PATH] && Object.keys(files[ROOT_PATH]).map((key, index) => {
    //  console.log('recursive tree', files[ROOT_PATH][key])
    //})
  }, [props.focusContext, props.focusElement, props.focusEdit, expandPath])

  const getEventTarget = async (e: any, useLabel: boolean = false) => {
    let target = e.target as HTMLElement
    while (target && target.getAttribute && !target.getAttribute(useLabel? 'data-label-path' : 'data-path')) {
      target = target.parentElement
    }
    if (target && target.getAttribute) {
      const path = target.getAttribute(useLabel? 'data-label-path' : 'data-path')
      const type = target.getAttribute(useLabel? 'data-label-type' : 'data-type')
      let position = target.getBoundingClientRect()
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
    console.log('show mouse over target', showMouseOverTarget)
  }, [showMouseOverTarget])


  return (

    <div onMouseLeave={onMouseLeave} onMouseMove={onMouseMove} onDrop={onDrop} onDragOver={onDragOver} onContextMenu={handleContextMenu}>

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

      <ul className="ul_tv ml-0 pl-1" >{files[ROOT_PATH] &&
        Object.keys(files[ROOT_PATH]).map((key, index) => {
          //console.log('recursive tree', files[ROOT_PATH][key])
          return (<RecursiveTreeItem
            editModeOff={editModeOff}
            focusEdit={props.focusEdit}
            focusElement={props.focusElement}
            focusContext={props.focusContext}
            expandPath={expandPath}
            key={index}
            file={files[ROOT_PATH][key]}
          />)
        })}
      </ul>
    </div>

  )
}





