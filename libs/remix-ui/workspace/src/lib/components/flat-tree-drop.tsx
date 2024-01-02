import React, { SyntheticEvent, startTransition, useEffect, useRef, useState } from 'react'
import { FileType } from '../types'
import { getEventTarget } from '../utils/getEventTarget'
import { extractParentFromKey } from '@remix-ui/helper'
interface FlatTreeDropProps {
  moveFile: (dest: string, src: string) => void
  moveFolder: (dest: string, src: string) => void
  getFlatTreeItem: (path: string) => FileType
  handleClickFolder: (path: string, type: string) => void
  dragSource: FileType
  children: React.ReactNode
  expandPath: string[]
}
export const FlatTreeDrop = (props: FlatTreeDropProps) => {

  const { getFlatTreeItem, dragSource, moveFile, moveFolder, handleClickFolder, expandPath } = props
  // delay timer
  const [timer, setTimer] = useState<NodeJS.Timeout>()
  // folder to open
  const [folderToOpen, setFolderToOpen] = useState<string>()


  const onDragOver = async (e: SyntheticEvent) => {
    e.preventDefault()
    const target = await getEventTarget(e)

    if (!target || !target.path) {
      clearTimeout(timer)
      setFolderToOpen(null)
      return
    }

    const dragDestination = getFlatTreeItem(target.path)
    if (dragDestination && !dragDestination.isDirectory) {
      clearTimeout(timer)
      setFolderToOpen(null)
    }
    if (dragDestination && dragDestination.isDirectory && !expandPath.includes(dragDestination.path) && folderToOpen !== dragDestination.path && props.handleClickFolder) {
      
      setFolderToOpen(dragDestination.path)
      timer && clearTimeout(timer)
      setTimer(
        setTimeout(() => {
          handleClickFolder(dragDestination.path, dragDestination.type)
          setFolderToOpen(null)
        }, 600)
      )
    }
  }

  const onDrop = async (event: SyntheticEvent) => {
    event.preventDefault()

    const target = await getEventTarget(event)
    let dragDestination: any
    if (!target || !target.path) {
      dragDestination = {
        path: '/',
        isDirectory: true
      }
    } else {
      dragDestination = getFlatTreeItem(target.path)
    }

    if (dragDestination.isDirectory) {
      if (dragSource.isDirectory) {
        moveFolder(dragDestination.path, dragSource.path)
      } else {
        moveFile(dragDestination.path, dragSource.path)
      }
    } else {
      const path = extractParentFromKey(dragDestination.path) || '/'

      if (dragSource.isDirectory) {
        moveFolder(path, dragSource.path)
      } else {
        moveFile(path, dragSource.path)
      }
    }
  }


  return (<div
    onDrop={onDrop} onDragOver={onDragOver}
  >{props.children}</div>)
}