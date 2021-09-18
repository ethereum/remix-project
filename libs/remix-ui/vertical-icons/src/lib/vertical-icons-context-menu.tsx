import React, { Fragment, PointerEvent, SyntheticEvent } from 'react'

export type action = {
  name: string
  type: string[]
  path: string[]
  extension: string[]
  pattern: string[]
  id: string
  multiselect: boolean
  label: string
}

export type MenuItems = action[]

export interface VerticalIconsContextMenuProps {
  actions: action[]
  hideContextMenu: () => void
  runScript?: (path: string) => void
  emit?: (cmd: customAction) => void
  contextEvent: SyntheticEvent & PointerEvent
  path: string
  type: string
  focus: { key: string; type: string }[]
  onMouseOver?: (...args) => void
}

export interface customAction {
  id: string
  name: string
  type: customActionType[]
  path: string[]
  extension: string[]
  pattern: string[]
  sticky?: boolean
}
export declare type customActionType = 'file' | 'folder'

interface MenuLinksProps {
  linkItems?: any
  hide?: (some: null | any, value: boolean) => void
}


function VerticalIconsContextMenu(props: VerticalIconsContextMenuProps) {
    // const hide = (event: SyntheticEvent, force) => {
    //     if (container &&
    //     container.parentElement &&
    //     (force || event.target !== container)
    //     ) {
    //     container.parentElement.removeChild(container)
    //     }
    //     window.removeEventListener('click', hide)
    // }
    const MenuForLinks = ({ linkItems, hide }: MenuLinksProps) => {
      const Menu = (props: any) => {
        return (
          <Fragment>
            {
              Object.keys(props.items).map((item, index) => (
                <li id={`menuitem${item.toLowerCase()}`} onClick={() => {
                    hide(null, true)
                    props.items[item]()
                  }}
                  className="remixui_liitem">
                  {item}
                </li>
              ))
            }
          </Fragment>
        )
      }
    return (
      <Fragment>
        <Menu />
        {linkItems && Object.keys(linkItems).length > 0
          ? Object.keys(linkItems).map((item, idx) => (
              <li id="menuitem${item.toLowerCase()}" className="remixui_liitem">
                <a
                  onClick={() => hide(null, true)}
                  href={linkItems[item]}
                  target="_blank"
                >
                  {item}
                </a>
              </li>
            ))
          : null}
      </Fragment>
    )
  }
  return (
    <div
      id="menuItemsContainer"
      className="p-1 remixui_container bg-light shadow border"
      style={{ 
        left: props.contextEvent.pageX,
        right: props.contextEvent.pageY,
        display: 'block'
      }}
    >
      <ul id="menuitems">
        <MenuForLinks />
      </ul>
    </div>
  )
}

export default VerticalIconsContextMenu
