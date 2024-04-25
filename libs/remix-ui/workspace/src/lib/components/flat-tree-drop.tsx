import React, { SyntheticEvent, useContext, useEffect, useRef, useState } from 'react'
import { DragStructure, FileType, FlatTreeDropProps } from '../types'
import { getEventTarget } from '../utils/getEventTarget'
import { extractParentFromKey } from '@remix-ui/helper'
import { FileSystemContext } from '../contexts'



export const FlatTreeDrop = (props: FlatTreeDropProps) => {

  const { getFlatTreeItem, dragSource, moveFile, moveFolder, handleClickFolder, expandPath } = props
  // delay timer
  const [timer, setTimer] = useState<NodeJS.Timeout>()
  // folder to open
  const [folderToOpen, setFolderToOpen] = useState<string>()
  const globalFEContext = useContext(FileSystemContext)
  const [selectedItems, setSelectedItems] = useState<DragStructure[]>([])

<<<<<<< HEAD
=======
  useEffect(() => {

  }, [globalFEContext.fs.focusElement.length])

>>>>>>> consume function to move files silently
  const onDragOver = async (e: SyntheticEvent) => {
    e.preventDefault()

    const target = await getEventTarget(e)
    buildMultiSelectedItemProfiles(target)
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
    const items = buildMultiSelectedItemProfiles(target)
    console.log('onDrop', { items, target })
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
        await moveFoldersSilently(items, dragDestination.path)
      } else {
        moveFile(dragDestination.path, dragSource.path)
        await moveFilesSilently(items, dragDestination.path)
      }
    } else {
      const path = extractParentFromKey(dragDestination.path) || '/'

      if (dragSource.isDirectory) {
        moveFolder(path, dragSource.path)
        await moveFoldersSilently(items, dragDestination.path)
      } else {
        moveFile(path, dragSource.path)
        await moveFilesSilently(items, dragDestination.path)
      }
    }
  }

  /**
   *  When multiple files are selected in FileExplorer,
   *  and these files are dragged to a target folder,
   *  this function will build the profile of each selected item
   *  in FileExplorer so they can be moved when dropped
   * @param target - Initial target item in FileExplorer
   * @returns - {DragStructure} Array of selected items
   */
  const buildMultiSelectedItemProfiles = (target: {
  path: string
  type: string
  content: string
  position: {
      top: number
      left: number
  }
  }) => {
    const selectItems = []
    document.querySelectorAll('li.bg-secondary.li_tv').forEach(item => {

      const dragTarget = {
        position: { top: target?.position.top || 0, left: target?.position.left || 0 },
        path: item.getAttribute('data-path') || item.getAttribute('data-label-path') || '',
        type: item.getAttribute('data-type') || item.getAttribute('data-label-type') || '',
        content: item.textContent || ''
      }
      selectItems.push(dragTarget)
    })
    // console.log('selectItem', { selectItems, target })
    return selectItems
  }

  /**
   * Moves items silently without showing a confirmation dialog.
   * @param items MultiSelected items built into a DragStructure profile
   * @param dragSource source FileExplorer item being dragged.
   * @returns Promise<void>
   */
  const moveFilesSilently = async (items: DragStructure[], targetPath: string) => {
    console.log('moveItemsSilently', { items, targetPath })
    const promises = items.filter(item => item.path !== targetPath)
      .map(async (item) => {
        if (item.type === 'file') {
          await props.moveFileSilently(item.path, targetPath)
        }
      })
    await Promise.all(promises)
  }

  /**
   * Moves items silently without showing a confirmation dialog.
   * @param items MultiSelected items built into a DragStructure profile
   * @param dragSource source FileExplorer item being dragged.
   * @returns Promise<void>
   */
  const moveFoldersSilently = async (items: DragStructure[], targetPath: string) => {
    console.log('moveItemsSilently', { items, targetPath })
    const promises = items.filter(item => item.path !== targetPath)
      .map(async (item) => {
        if (item.type === 'folder') {
          await props.moveFolderSilently(item.path, targetPath)
        }
      })
    await Promise.all(promises)
  }


  return (<div
    onDrop={onDrop} onDragOver={onDragOver}
    className="d-flex h-100"
  >{props.children}</div>)
}
