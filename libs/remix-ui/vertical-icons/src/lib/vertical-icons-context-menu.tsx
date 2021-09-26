import React, { Fragment, PointerEvent, SyntheticEvent, useEffect, useRef } from 'react'
import { defaultModuleProfile, VerticalIcons } from '../../types/vertical-icons'

export interface VerticalIconsContextMenuProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  // actions: action[]
  pageX: number
  pageY: number
  profileName: string
  links: { Documentation: string, CanDeactivate: boolean }
  canBeDeactivated: boolean
  verticalIconPlugin: VerticalIcons
  hideContextMenu: (evt: any) => void
}

interface MenuLinksProps {
  listItems: { Documentation: string, CanDeactivate: boolean }
  hide: (someEvent: any, value: boolean) => void
  profileName: string
  canBeDeactivated: boolean
  verticalIconPlugin: VerticalIcons
  ref?: React.MutableRefObject<any>
}

interface MenuProps {
  verticalIconsPlugin: VerticalIcons
  profileName: string
  listItems: { Documentation: string, CanDeactivate: boolean }
  hide: (someEvent: any, value: boolean) => void
}

function VerticalIconsContextMenu(props: VerticalIconsContextMenuProps) {
  const menuRef = useRef(null)
  useEffect(() => {
    document.addEventListener("click", props.hideContextMenu)
    return () => document.removeEventListener("click", props.hideContextMenu)
  }, [])
  useEffect(() => {
    menuRef.current.focus()
  }, [])
  
  return (
    <div
      id="menuItemsContainer"
      className="p-1 remixui_verticalIconContextcontainer bg-light shadow border"
      onBlur={props.hideContextMenu}
      style={{
        left: props.pageX,
        top: props.pageY,
        display: 'block',

      }}
      ref={menuRef}
    >
      <ul id="menuitems">
        <MenuForLinks
          hide={props.hideContextMenu}
          listItems={props.links}
          profileName={props.profileName}
          canBeDeactivated={props.canBeDeactivated}
          verticalIconPlugin={props.verticalIconPlugin}
          toggle={props.verticalIconPlugin.toggle}
          contextMenuAction={props.contextMenuAction}
        />
      </ul>
    </div>
  )
}

function MenuForLinks({
  listItems,
  hide,
  profileName,
  verticalIconPlugin
}: MenuLinksProps) {
  console.log('linkitems ', listItems)
  return (
    <Fragment>
      <Menu
        hide={hide}
        profileName={profileName}
        listItems={listItems}
        verticalIconsPlugin={verticalIconPlugin}
      />
      {listItems && Object.keys(listItems).length > 0
        ? Object.keys(listItems).map((item, idx) => (
            <li
              id="menuitemdocumentation"
              className="remixui_liitem"
            >
              <a
                onClick={(evt) => hide(evt, true)}
                onBlur={(evt) => hide(evt, true)}
                href={listItems[item]}
                target="_blank"
              >
                Documentation
              </a>
            </li>
          ))
        : null}
    </Fragment>
  )
}

export default VerticalIconsContextMenu
