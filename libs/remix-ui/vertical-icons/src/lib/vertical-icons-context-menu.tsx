import React, { Fragment, PointerEvent, SyntheticEvent } from 'react'
import { defaultModuleProfile, VerticalIcons } from '../../types/vertical-icons'

export interface VerticalIconsContextMenuProps {
  // actions: action[]
  pageX: number
  pageY: number
  profileName: string
  links: { Documentation: string }
  canBeDeactivated: boolean
  verticalIconPlugin: VerticalIcons
  hideContextMenu: (evt: SyntheticEvent<Element, Event> & PointerEvent) => void
}

interface MenuLinksProps {
  linkItems?: any
  hide?: (some: null | any, value: boolean) => void
  profileName: string
  canBeDeactivated: boolean
}

interface MenuProps {
  verticalIconsPlugin: VerticalIcons
  profileName: string
  evt: SyntheticEvent & PointerEvent & MouseEvent
  canBeDeactivated: boolean
}

function VerticalIconsContextMenu(props: VerticalIconsContextMenuProps) {
  return (
    <div
      id="menuItemsContainer"
      className="p-1 remixui_verticalIconContextcontainer bg-light shadow border"
      style={{
        left: props.pageX,
        right: props.pageY,
        display: 'block'
      }}
    >
      <ul id="menuitems">
        <MenuForLinks
          hide={props.hideContextMenu}
          linkItems={props.links}
          profileName={props.profileName}
          canBeDeactivated={props.canBeDeactivated}
          verticalIconPlugin={props.verticalIconPlugin}
        />
      </ul>
    </div>
  )
}

function MenuForLinks({
  linkItems,
  hide,
  profileName,
  canBeDeactivated,
  verticalIconPlugin
}) {
  console.log('linkitems ', linkItems)
  return (
    <Fragment>
      <Menu
        linkItems={linkItems}
        hide={hide}
        profileName={profileName}
        canBeDeactivated={canBeDeactivated}
        verticalIconPlugin={verticalIconPlugin}
      />
      {linkItems && Object.keys(linkItems).length > 0
        ? Object.keys(linkItems).map((item, idx) => (
            <li
              id="menuitem${item.toLowerCase()}"
              className="remixui_liitem"
              key={item}
            >
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

function Menu(props: any) {
  console.log('props contains ', props)
  return (
    <Fragment>
      {Object.keys(props.linkItems).map((item, index) => (
        <li
          id={`menuitem${item.toLowerCase()}`}
          onClick={() => {
            props.hide(null, true)
            if (props.canDeactivate)
              props.verticalIconPlugin.appManager.deactivate(props.profileName)
          }}
          className="remixui_liitem"
          key={item}
        >
          {item}
        </li>
      ))}
    </Fragment>
  )
}

export default VerticalIconsContextMenu
