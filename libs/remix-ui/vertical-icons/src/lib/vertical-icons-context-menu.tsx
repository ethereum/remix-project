import React, { Fragment, PointerEvent, SyntheticEvent } from 'react'
import { defaultModuleProfile, VerticalIcons } from '../../types/vertical-icons'

export interface VerticalIconsContextMenuProps {
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
}

interface MenuProps {
  verticalIconsPlugin: VerticalIcons
  profileName: string
  listItems: { Documentation: string, CanDeactivate: boolean }
  hide: (someEvent: any, value: boolean) => void
}

function VerticalIconsContextMenu(props: VerticalIconsContextMenuProps) {
  return (
    <div
      id="menuItemsContainer"
      className="p-1 remixui_verticalIconContextcontainer bg-light shadow border"
      onBlur={() => props.hideContextMenu}
      style={{
        left: props.pageX,
        top: props.pageY,
        display: 'block',

      }}
    >
      <ul id="menuitems">
        <MenuForLinks
          hide={props.hideContextMenu}
          listItems={props.links}
          profileName={props.profileName}
          canBeDeactivated={props.canBeDeactivated}
          verticalIconPlugin={props.verticalIconPlugin}
        />
      </ul>
    </div>
  )
}

function MenuForLinks({
  listItems,
  hide,
  profileName,
  canBeDeactivated,
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
              id="menuitem${item.toLowerCase()}"
              className="remixui_liitem"
              key={item}
            >
              <a
                onClick={(evt) => hide(evt, true)}
                onBlur={(evt) => hide(evt, true)}
                href={listItems[item]}
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

function Menu(props: MenuProps) {
  console.log('props contains ', props)
  return (
    <Fragment>
      { props.listItems.CanDeactivate ? (
        <li
          id="menuitemdeactivate"
          onClick={(evt) => {
            props.verticalIconsPlugin
            .itemContextMenu(evt, props.profileName ,props.listItems.Documentation)
            props.hide(evt, true)
          }}
          onBlur={(evt) => props.hide(evt, true)}
          className="remixui_liitem"
        >
          Deactivate
        </li>
      ) : null}
    </Fragment>
  )
}

export default VerticalIconsContextMenu
