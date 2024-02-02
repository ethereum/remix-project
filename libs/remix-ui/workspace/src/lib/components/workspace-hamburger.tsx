import { appPlatformTypes } from '@remix-ui/app'
import React from 'react'
import {Dropdown} from 'react-bootstrap'
import {HamburgerMenuItem, HamburgerSubMenuItem} from './workspace-hamburger-item'

export interface HamburgerMenuProps {
  createWorkspace: () => void
  renameCurrentWorkspace: () => void
  downloadCurrentWorkspace: () => void
  deleteCurrentWorkspace: () => void
  deleteAllWorkspaces: () => void
  cloneGitRepository: () => void
  downloadWorkspaces: () => void
  restoreBackup: () => void
  hideIconsMenu: (showMenu: boolean) => void
  addGithubAction: () => void
  addTsSolTestGithubAction: () => void
  addSlitherGithubAction: () => void
  addHelperScripts: (script: string) => void
  showIconsMenu: boolean
  hideWorkspaceOptions: boolean
  hideLocalhostOptions: boolean
  hideFileOperations: boolean
}

export function HamburgerMenu(props: HamburgerMenuProps) {
  const {showIconsMenu, hideWorkspaceOptions, hideLocalhostOptions, hideFileOperations} = props
  return (
    <>
      <HamburgerMenuItem
        kind="create"
        fa="far fa-plus"
        hideOption={hideWorkspaceOptions}
        actionOnClick={() => {
          props.createWorkspace()
          props.hideIconsMenu(!showIconsMenu)
        }}
        platforms={[appPlatformTypes.web]}
      ></HamburgerMenuItem>
      <HamburgerMenuItem
        kind="create.desktop"
        fa="far fa-plus"
        hideOption={hideWorkspaceOptions}
        actionOnClick={() => {
          props.createWorkspace()
          props.hideIconsMenu(!showIconsMenu)
        }}
        platforms={[appPlatformTypes.desktop]}
      ></HamburgerMenuItem>
      <HamburgerMenuItem
        kind="clone"
        fa="fab fa-github"
        hideOption={hideWorkspaceOptions}
        actionOnClick={() => {
          props.cloneGitRepository()
          props.hideIconsMenu(!showIconsMenu)
        }}
        platforms={[appPlatformTypes.web, appPlatformTypes.desktop]}
      ></HamburgerMenuItem>
      <HamburgerMenuItem
        kind="rename"
        fa="far fa-edit"
        hideOption={hideWorkspaceOptions || hideLocalhostOptions}
        actionOnClick={() => {
          props.renameCurrentWorkspace()
          props.hideIconsMenu(!showIconsMenu)
        }}
        platforms={[appPlatformTypes.web]}
      ></HamburgerMenuItem>
      <HamburgerMenuItem
        kind="download"
        fa="far fa-arrow-alt-down"
        hideOption={hideWorkspaceOptions || hideLocalhostOptions}
        actionOnClick={() => {
          props.downloadCurrentWorkspace()
          props.hideIconsMenu(!showIconsMenu)
        }}
        platforms={[appPlatformTypes.web]}
      ></HamburgerMenuItem>
      <HamburgerMenuItem
        kind="delete"
        fa="far fa-trash"
        hideOption={hideWorkspaceOptions || hideLocalhostOptions}
        actionOnClick={() => {
          props.deleteCurrentWorkspace()
          props.hideIconsMenu(!showIconsMenu)
        }}
        platforms={[appPlatformTypes.web]}
      ></HamburgerMenuItem>
      <Dropdown.Divider className="border mb-0 mt-0 remixui_menuhr" style={{pointerEvents: 'none'}} />
      <HamburgerMenuItem
        kind="deleteAll"
        fa="far fa-trash-alt"
        hideOption={hideWorkspaceOptions || hideLocalhostOptions}
        actionOnClick={() => {
          props.deleteAllWorkspaces()
          props.hideIconsMenu(!showIconsMenu)
        }}
        platforms={[appPlatformTypes.web]}
      ></HamburgerMenuItem>
      <HamburgerMenuItem
        kind="backup"
        fa="far fa-download"
        hideOption={hideWorkspaceOptions || hideLocalhostOptions}
        actionOnClick={() => {
          props.downloadWorkspaces()
          props.hideIconsMenu(!showIconsMenu)
        }}
        platforms={[appPlatformTypes.web]}
      ></HamburgerMenuItem>
      <HamburgerMenuItem
        kind="restore"
        fa="far fa-upload"
        hideOption={hideWorkspaceOptions}
        actionOnClick={() => {
          props.restoreBackup()
          props.hideIconsMenu(!showIconsMenu)
        }}
        platforms={[appPlatformTypes.web]}
      ></HamburgerMenuItem>
      <Dropdown.Divider className="border mt-0 mb-0 remixui_menuhr" style={{pointerEvents: 'none'}} />
      <HamburgerMenuItem
        kind="solghaction"
        fa="fa-kit fa-solidity-mono"
        hideOption={hideWorkspaceOptions || hideFileOperations}
        actionOnClick={() => {
          props.addGithubAction()
          props.hideIconsMenu(!showIconsMenu)
        }}
        platforms={[appPlatformTypes.web, appPlatformTypes.desktop]}
      ></HamburgerMenuItem>
      <HamburgerMenuItem
        kind="tssoltestghaction"
        fa="fab fa-js"
        hideOption={hideWorkspaceOptions || hideFileOperations}
        actionOnClick={() => {
          props.addTsSolTestGithubAction()
          props.hideIconsMenu(!showIconsMenu)
        }}
        platforms={[appPlatformTypes.web, appPlatformTypes.desktop]}
      ></HamburgerMenuItem>
      <HamburgerMenuItem
        kind="slitherghaction"
        fa="far fa-shield"
        hideOption={hideWorkspaceOptions || hideFileOperations}
        actionOnClick={() => {
          props.addSlitherGithubAction()
          props.hideIconsMenu(!showIconsMenu)
        }}
        platforms={[appPlatformTypes.web, appPlatformTypes.desktop]}
      ></HamburgerMenuItem>
      <Dropdown.Divider className="border mb-0 mt-0 remixui_menuhr" style={{pointerEvents: 'none'}} />
      <HamburgerMenuItem
        kind="addscriptetherscan"
        fa="fa-kit fa-ts-logo"
        hideOption={hideWorkspaceOptions || hideFileOperations}
        actionOnClick={() => {
          props.addHelperScripts('etherscanScripts')
          props.hideIconsMenu(!showIconsMenu)
        }}
        platforms={[appPlatformTypes.web, appPlatformTypes.desktop]}
      ></HamburgerMenuItem>
      <HamburgerMenuItem
        kind="addscriptdeployer"
        fa="fa-kit fa-ts-logo"
        hideOption={hideWorkspaceOptions || hideFileOperations}
        actionOnClick={() => {
          props.addHelperScripts('contractDeployerScripts')
          props.hideIconsMenu(!showIconsMenu)
        }}
        platforms={[appPlatformTypes.web, appPlatformTypes.desktop]}
      ></HamburgerMenuItem>
      <HamburgerMenuItem
        kind="addscriptsindri"
        fa="fa-kit fa-ts-logo"
        hideOption={hideWorkspaceOptions || hideFileOperations}
        actionOnClick={() => {
          props.addHelperScripts('sindriScripts')
          props.hideIconsMenu(!showIconsMenu)
        }}
        platforms={[appPlatformTypes.web, appPlatformTypes.desktop]}
      ></HamburgerMenuItem>
    </>
  )
}

// keep for later use
/*<HamburgerSubMenuItem
          id="web3-script-menu"
          title="Web3 Scripts"
          subMenus={[
            {
              kind:'etherscan-script',
              fa: 'fa-kit fa-ts-logo',
              hideOption: hideWorkspaceOptions,
              actionOnClick: () => {
                alert('etherscan')
                props.addHelperScripts()
                props.hideIconsMenu(!showIconsMenu)
              }
            },
            {
              kind:'contract-deployer-factory-script',
              fa: 'fa-kit fa-ts-logo',
              hideOption: hideWorkspaceOptions,
              actionOnClick: () => {
                alert('deloyer')
                props.addHelperScripts()
                props.hideIconsMenu(!showIconsMenu)
              }
            }
          ]}
        ></HamburgerSubMenuItem>
        */
