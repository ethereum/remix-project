import React, { useRef, useEffect } from 'react' // eslint-disable-line
import { FileExplorerContextMenuProps } from './types'

import './css/file-explorer-context-menu.css'

export const FileExplorerContextMenu = (props: FileExplorerContextMenuProps) => {
  const { actions, createNewFile, createNewFolder, deletePath, renamePath, hideContextMenu, pageX, pageY, path, ...otherProps } = props
  const contextMenuRef = useRef(null)

  useEffect(() => {
    contextMenuRef.current.focus()
  }, [])

  useEffect(() => {
    const menuItemsContainer = contextMenuRef.current
    const boundary = menuItemsContainer.getBoundingClientRect()

    if (boundary.bottom > (window.innerHeight || document.documentElement.clientHeight)) {
      menuItemsContainer.style.position = 'absolute'
      menuItemsContainer.style.bottom = '10px'
      menuItemsContainer.style.top = null
    }
  }, [pageX, pageY])

  const menu = () => {
    return actions.map((item, index) => {
      return <li
        id={`menuitem${item.name.toLowerCase()}`}
        key={index}
        className='remixui_liitem'
        onClick={() => {
          switch (item.name) {
            case 'New File':
              createNewFile(path)
              break
            case 'New Folder':
              createNewFolder(path)
              break
            case 'Rename':
              renamePath(path)
              break
            case 'Delete':
              deletePath(path)
              break
            default:
              break
          }
          hideContextMenu()
        }}>{item.name}</li>
    })
  }

  return (
    <div
      id="menuItemsContainer"
      className="p-1 remixui_contextContainer bg-light shadow border"
      style={{ left: pageX, top: pageY }}
      ref={contextMenuRef}
      onBlur={hideContextMenu}
      tabIndex={500}
      {...otherProps}
    >
      <ul id='remixui_menuitems'>{menu()}</ul>
    </div>
  )
}

export default FileExplorerContextMenu
