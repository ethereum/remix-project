import { Plugin } from '@remixproject/engine'
import React, { Fragment, useEffect, useRef } from 'react'
import { FormattedMessage } from 'react-intl'

export interface VerticalIconsContextMenuProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  pageX: number
  pageY: number
  profileName: string
  links: {Documentation: string; CanDeactivate: boolean; CloseOthers: boolean}
  canBeDeactivated: boolean
  verticalIconPlugin: any
  hideContextMenu: () => void
  contextMenuAction: (evt: any, profileName: string, documentation: string) => void
}

interface MenuLinksProps {
  listItems: {Documentation: string; CanDeactivate: boolean; CloseOthers: boolean}
  hide: () => void
  profileName: string
  canBeDeactivated: boolean
  verticalIconPlugin: any
  ref?: React.MutableRefObject<any>
  toggle: (name: string) => void
  contextMenuAction: (evt: any, profileName: string, documentation: string) => void
}

interface MenuProps {
  verticalIconsPlugin: Plugin
  profileName: string
  listItems: {Documentation: string; CanDeactivate: boolean; CloseOthers: boolean}
  hide: () => void
}

const VerticalIconsContextMenu = (props: VerticalIconsContextMenuProps) => {
  const menuRef = useRef(null)
  ClickOutside(menuRef, props.hideContextMenu)
  useEffect(() => {
    // @ts-ignore
    menuRef.current.focus()
  }, [])
  return (
    <div
      id="menuItemsContainer"
      className="p-1 remixui_verticalIconContextcontainer bg-light shadow border"
      style={{
        left: props.pageX,
        top: props.pageY,
        display: 'block'
      }}
      ref={menuRef}
      tabIndex={1}
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

const MenuForLinks = ({ listItems, hide, profileName, contextMenuAction, verticalIconPlugin, toggle }: MenuLinksProps) => {
  return (
    <Fragment>
      {listItems.CloseOthers && (
        <li
          id="menuitemcloseothers"
          onClick={() => {
            closeOtherPlugins(profileName, verticalIconPlugin)
            hide()
          }}
          className="remixui_liitem"
          key="menuitemcloseothers"
        >
          <FormattedMessage id="pluginManager.closeOthers" defaultMessage="Close Others" />
        </li>
      )}
      {listItems.CanDeactivate ? (
        <li
          id="menuitemdeactivate"
          onClick={(evt) => {
            contextMenuAction(evt, profileName, listItems.Documentation)
            hide()
          }}
          className="remixui_liitem"
          key="menuitemdeactivate"
        >
          <FormattedMessage id="pluginManager.deactivate" />
        </li>
      ) : null}
      {listItems.Documentation && listItems.Documentation.length > 0 && (
        <li id="menuitemdocumentation" className="remixui_liitem" key="menuitemdocumentation">
          <a onClick={hide} href={listItems.Documentation} target="_blank">
            <FormattedMessage id="home.documentation" />
          </a>
        </li>
      )}
    </Fragment>
  )
}

function closeOtherPlugins(exceptName: string, verticalIconPlugin: any) {
  // Get all active plugins from the verticalIconPlugin
  const icons = verticalIconPlugin.verticalIconsPlugin?.icons || {}
  Object.keys(icons).forEach((iconName) => {
    const icon = icons[iconName]
    if (iconName !== exceptName && icon.active) {
      verticalIconPlugin.call('manager', 'togglePlugin', iconName)
    }
  })
}

function ClickOutside(ref: React.MutableRefObject<HTMLElement>, hideFn: () => void) {
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (ref.current && !ref.current.contains(event.target)) {
        hideFn()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [ref])
}

export default VerticalIconsContextMenu
