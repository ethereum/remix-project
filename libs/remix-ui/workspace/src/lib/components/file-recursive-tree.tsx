import { CustomTooltip, getPathIcon } from '@remix-ui/helper'
import e from 'express'
import React, { SyntheticEvent, useEffect, useRef, useState } from 'react'
import { Overlay, OverlayTrigger, Popover, Tooltip } from 'react-bootstrap'
import { FileType } from '../types'
import { ROOT_PATH } from '../utils/constants'


interface RecursiveTreeProps {
  files: { [x: string]: Record<string, FileType> },
  expandPath: string[],
  handleContextMenu: (pageX: number, pageY: number, path: string, content: string, type: string) => void
}

let mouseTimer: any = {
  path: null,
  timer: null
}


export const RecursiveTree = (props: RecursiveTreeProps) => {
  const { files, expandPath } = props
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
    console.log('EXPAND', expandPath)
    //files[ROOT_PATH] && Object.keys(files[ROOT_PATH]).map((key, index) => {
    //  console.log('recursive tree', files[ROOT_PATH][key])
    //})
  }, [expandPath])

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
    console.log('context menu', e)
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
          className='text-wrap bg-secondary'
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
          <Popover.Body>
            {mouseOverTarget && mouseOverTarget.path}
          </Popover.Body>
        </Popover>
      }

      <ul className="ul_tv ml-0 pl-1" >{files[ROOT_PATH] &&
        Object.keys(files[ROOT_PATH]).map((key, index) => {
          return (<RecursiveTreeItem
            expandPath={expandPath}
            key={index}
            file={files[ROOT_PATH][key]}
          />)
        })}
      </ul>
    </div>

  )
}
interface RecursiveTreeItemProps {
  file: FileType
  expandPath?: string[]
}

export const RecursiveTreeItem = (props: RecursiveTreeItemProps) => {

  const [hover, setHover] = useState<boolean>(false)
  const { file, expandPath } = props

  const labelClass =
   hover
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
          <span draggable="true" className="ml-1 pl-2" data-label-type={file.isDirectory ? 'folder' : 'file'} data-label-path={`${file.path}`}>{file.name}</span>
        </div>
        <ul className="ul_tv ml-0 pl-1" >
          {
            expandPath && expandPath.includes(file.path) &&
            file.child && Object.keys(file.child).map((key, index) => {
              return (<RecursiveTreeItem
                expandPath={expandPath} key={index} file={file.child[key]} />)
            })
          }
        </ul>
      </li>
    </>)
}