import React, { SyntheticEvent, startTransition, useEffect, useRef, useState } from 'react'
import { FileType } from '../types'
import { getEventTarget } from '../utils/getEventTarget'
import { extractParentFromKey } from '@remix-ui/helper'
interface FlatTreeDropProps {
    moveFile: (dest: string, src: string) => void
    moveFolder: (dest: string, src: string) => void
    getFlatTreeItem: (path: string) => FileType
    dragSource: FileType
    children: React.ReactNode
}
export const FlatTreeDrop = (props: FlatTreeDropProps) => {
  
  const { getFlatTreeItem, dragSource, moveFile, moveFolder } = props
  const onDragOver = async (e: SyntheticEvent) => {
    //setShowMouseOverTarget(false)
    e.preventDefault()
    const target = await getEventTarget(e)
  }

  const onDrop = async (event: SyntheticEvent) => {
    event.preventDefault()
    console.log('drop', event)
    const target = await getEventTarget(event)
    const dragDestination = getFlatTreeItem(target.path)
    console.log(getFlatTreeItem)
    console.log('drop', target, dragDestination, dragSource)

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