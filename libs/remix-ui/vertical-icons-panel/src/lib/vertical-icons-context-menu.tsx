/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-use-before-define */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { Fragment, useEffect, useRef } from 'react'
import { VerticalIcons } from '../../types/vertical-icons-panel'

export interface VerticalIconsContextMenuProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  pageX: number
  pageY: number
  profileName: string
  links: { Documentation: string, CanDeactivate: boolean }
  canBeDeactivated: boolean
  verticalIconPlugin: VerticalIcons
  hideContextMenu: () => void
  contextMenuAction: (evt: any, profileName: string, documentation: string) => void
}

interface MenuLinksProps {
  listItems: { Documentation: string, CanDeactivate: boolean }
  hide: () => void
  profileName: string
  canBeDeactivated: boolean
  verticalIconPlugin: VerticalIcons
  ref?: React.MutableRefObject<any>
  toggle: (name: string) => void
  contextMenuAction: (evt: any, profileName: string, documentation: string) => void
}

interface MenuProps {
  verticalIconsPlugin: VerticalIcons
  profileName: string
  listItems: { Documentation: string, CanDeactivate: boolean }
  hide: () => void
}

const requiredModules = [
  'manager', 'compilerArtefacts', 'compilerMetadata', 'contextualListener', 'editor', 'offsetToLineColumnConverter', 'network', 'theme',
  'fileManager', 'contentImport', 'blockchain', 'web3Provider', 'scriptRunner', 'fetchAndCompile', 'mainPanel', 'hiddenPanel', 'sidePanel', 'menuicons',
  'filePanel', 'terminal', 'settings', 'pluginManager', 'tabs', 'udapp', 'dGitProvider', 'solidity-logic']
const nativePlugins = ['vyper', 'workshops', 'debugger', 'remixd', 'menuicons', 'solidity', 'hardhat-provider']

function VerticalIconsContextMenu (props: VerticalIconsContextMenuProps) {
  const menuRef = useRef(null)
  useEffect(() => {
    document.addEventListener('click', props.hideContextMenu)
    return () => document.removeEventListener('click', props.hideContextMenu)
  }, [])
  useEffect(() => {
    // @ts-ignore
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function MenuForLinks ({
  listItems,
  hide,
  profileName,
  contextMenuAction
}: MenuLinksProps) {
  return (
    <Fragment>
      {listItems.CanDeactivate && !requiredModules.includes(profileName)
        ? <li
          id="menuitemdeactivate"
          onClick={(evt) => {
            contextMenuAction(evt, profileName, listItems.Documentation)
            hide()
          }}
          className="remixui_liitem"
        >
          Deactivate
        </li>
        : null
      }
      {(listItems.Documentation && listItems.Documentation.length > 0) &&
            <li
              id="menuitemdocumentation"
              className="remixui_liitem"
            >
              <a
                onClick={hide}
                href={listItems.Documentation}
                target="_blank"
              >
                Documentation
              </a>
            </li>}
    </Fragment>
  )
}

export default VerticalIconsContextMenu
