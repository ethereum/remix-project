import React from 'react'
import { Dropdown } from 'react-bootstrap'
import { HamburgerMenuItem } from './workspace-hamburger-item'

export interface HamburgerMenuProps {
  createWorkspace: () => void,
  renameCurrentWorkspace: () => void,
  downloadCurrentWorkspace: () => void,
  deleteCurrentWorkspace: () => void,
  deleteAllWorkspaces: () => void,
  cloneGitRepository: () => void,
  downloadWorkspaces: () => void,
  restoreBackup: () => void,
  hideIconsMenu: (showMenu: boolean) => void,
  addGithubAction: () => void,
  addTsSolTestGithubAction: () => void,
  addSlitherGithubAction: () => void,
  showIconsMenu: boolean,
  hideWorkspaceOptions: boolean,
  hideLocalhostOptions: boolean
}

export function HamburgerMenu (props: HamburgerMenuProps) {
  const { showIconsMenu, hideWorkspaceOptions, hideLocalhostOptions } = props
    return (
      <>
        <HamburgerMenuItem kind='create' fa='far fa-plus' hideOption={hideWorkspaceOptions} actionOnClick={() => {
          props.createWorkspace()
          props.hideIconsMenu(!showIconsMenu)
        }}></HamburgerMenuItem>
        <HamburgerMenuItem kind='clone' fa='fab fa-github' hideOption={hideWorkspaceOptions} actionOnClick={() => {
          props.cloneGitRepository()
          props.hideIconsMenu(!showIconsMenu)
        }}></HamburgerMenuItem>
        <HamburgerMenuItem kind='rename' fa='far fa-edit' hideOption={hideWorkspaceOptions || hideLocalhostOptions} actionOnClick={() => {
          props.renameCurrentWorkspace()
          props.hideIconsMenu(!showIconsMenu)
        }}></HamburgerMenuItem>
        <HamburgerMenuItem kind='download' fa='far fa-arrow-alt-down' hideOption={hideWorkspaceOptions || hideLocalhostOptions} actionOnClick={() => {
          props.downloadCurrentWorkspace()
          props.hideIconsMenu(!showIconsMenu)
        }}></HamburgerMenuItem>
        <HamburgerMenuItem kind='delete' fa='far fa-trash' hideOption={hideWorkspaceOptions || hideLocalhostOptions} actionOnClick={() => {
          props.deleteCurrentWorkspace()
          props.hideIconsMenu(!showIconsMenu)
        }}></HamburgerMenuItem>
        <Dropdown.Divider className="border mb-0 mt-0 remixui_menuhr" style={{ pointerEvents: 'none' }} />
        <HamburgerMenuItem kind='deleteAll' fa='far fa-trash-alt' hideOption={hideWorkspaceOptions || hideLocalhostOptions} actionOnClick={() => {
          props.deleteAllWorkspaces()
          props.hideIconsMenu(!showIconsMenu)
        }}></HamburgerMenuItem>
        <HamburgerMenuItem kind='backup' fa='far fa-download' hideOption={hideWorkspaceOptions || hideLocalhostOptions} actionOnClick={() => {
          props.downloadWorkspaces()
          props.hideIconsMenu(!showIconsMenu)
        }}></HamburgerMenuItem>
        <HamburgerMenuItem kind='restore' fa='far fa-upload' hideOption={hideWorkspaceOptions} actionOnClick={() => {
          props.restoreBackup()
          props.hideIconsMenu(!showIconsMenu)
        }}></HamburgerMenuItem>
        <Dropdown.Divider className="border mt-0 mb-0 remixui_menuhr" style={{ pointerEvents: 'none' }}/>
        <HamburgerMenuItem kind='solghaction' fa='fak fa-solidity-mono' hideOption={hideWorkspaceOptions} actionOnClick={() => {
          props.addGithubAction()
          props.hideIconsMenu(!showIconsMenu)
        }}></HamburgerMenuItem>
        <HamburgerMenuItem kind='tssoltestghaction' fa='fab fa-js' hideOption={hideWorkspaceOptions} actionOnClick={() => {
          props.addTsSolTestGithubAction()
          props.hideIconsMenu(!showIconsMenu)
        }}></HamburgerMenuItem>
        <HamburgerMenuItem kind='slitherghaction' fa='far fa-shield' hideOption={hideWorkspaceOptions} actionOnClick={() => {
          props.addSlitherGithubAction()
          props.hideIconsMenu(!showIconsMenu)
        }}></HamburgerMenuItem>
      </>
    )
  }