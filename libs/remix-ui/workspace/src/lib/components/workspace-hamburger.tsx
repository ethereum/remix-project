import React from 'react'
import { CustomTooltip } from '@remix-ui/helper'
import { Dropdown } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'

const _paq = window._paq = window._paq || []

export interface HamburgerMenuProps {
  createWorkspace: () => void,
  deleteCurrentWorkspace: () => void,
  renameCurrentWorkspace: () => void,
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
          <Dropdown.Item>
            <CustomTooltip
              placement="right"
              tooltipId="createWorkspaceTooltip"
              tooltipClasses="text-nowrap"
              tooltipText={<FormattedMessage id='filePanel.workspace.create' />}
            >
              <div
                data-id='workspaceCreate'
                onClick={() => {
                  props.createWorkspace()
                  _paq.push(['trackEvent', 'fileExplorer', 'workspaceMenu', 'workspaceCreate'])
                  props.hideIconsMenu(!showIconsMenu)
                }}
                key={`workspacesCreate-fe-ws`}
              >
                <span
                  hidden={hideWorkspaceOptions}
                  id='workspaceCreate'
                  data-id='workspaceCreate'
                  onClick={() => {
                    props.createWorkspace()
                    _paq.push(['trackEvent', 'fileExplorer', 'workspaceMenu', 'workspaceCreate'])
                    props.hideIconsMenu(!showIconsMenu)
                  }}
                  className='far fa-plus pl-2'
                >
                </span>
                <span className="pl-3"><FormattedMessage id='filePanel.create' /></span>
              </div>
            </CustomTooltip>
          </Dropdown.Item>
          <Dropdown.Item>
            <CustomTooltip
              placement="right-start"
              tooltipId="createWorkspaceTooltip"
              tooltipClasses="text-nowrap"
              tooltipText={<FormattedMessage id='filePanel.workspace.delete' />}
            >
              <div
                data-id='workspaceDelete'
                onClick={() => {
                  props.deleteCurrentWorkspace()
                  _paq.push(['trackEvent', 'fileExplorer', 'workspaceMenu', 'workspaceDelete'])
                  props.hideIconsMenu(!showIconsMenu)
                }}
                key={`workspacesDelete-fe-ws`}
              >
                <span
                  hidden={ hideWorkspaceOptions || hideLocalhostOptions }
                  id='workspaceDelete'
                  data-id='workspaceDelete'
                  onClick={() => {
                    props.deleteCurrentWorkspace()
                    _paq.push(['trackEvent', 'fileExplorer', 'workspaceMenu', 'workspaceDelete'])
                    props.hideIconsMenu(!showIconsMenu)
                  }}
                  className='far fa-trash pl-2'
                >
                </span>
                <span className="pl-3"><FormattedMessage id='filePanel.delete' /></span>
              </div>
            </CustomTooltip>
          </Dropdown.Item>
          <Dropdown.Item>
            <CustomTooltip
              placement='right-start'
              tooltipClasses="text-nowrap"
              tooltipId="workspaceRenametooltip"
              tooltipText={<FormattedMessage id='filePanel.workspace.rename' />}
            >
              <div onClick={() => {
                  props.renameCurrentWorkspace()
                  _paq.push(['trackEvent', 'fileExplorer', 'workspaceMenu', 'workspaceRename'])
                  props.hideIconsMenu(!showIconsMenu)
                }}
                data-id='workspaceRename'
                key={`workspacesRename-fe-ws`}
              >
                <span
                  hidden={ hideWorkspaceOptions || hideLocalhostOptions }
                  id='workspaceRename'
                  data-id='workspaceRename'
                  onClick={() => {
                    props.renameCurrentWorkspace()
                    _paq.push(['trackEvent', 'fileExplorer', 'workspaceMenu', 'workspaceRename'])
                    props.hideIconsMenu(!showIconsMenu)
                  }}
                  className='far fa-edit pl-2'>
                </span>
                <span className="pl-3"><FormattedMessage id='filePanel.rename' /></span>
              </div>
            </CustomTooltip>
          </Dropdown.Item>
          <Dropdown.Item><Dropdown.Divider className="border mb-0 mt-0" /></Dropdown.Item>
          <Dropdown.Item>
            <CustomTooltip
              placement="right-start"
              tooltipId="cloneWorkspaceTooltip"
              tooltipClasses="text-nowrap"
              tooltipText={<FormattedMessage id='filePanel.workspace.clone' />}
            >
              <div
                data-id='cloneGitRepository'
                onClick={() => {
                  props.cloneGitRepository()
                  _paq.push(['trackEvent', 'fileExplorer', 'workspaceMenu', 'cloneGitRepository'])
                  props.hideIconsMenu(!showIconsMenu)
                }}
                key={`cloneGitRepository-fe-ws`}
              >
                <span
                  hidden={ hideWorkspaceOptions }
                  id='cloneGitRepository'
                  data-id='cloneGitRepository'
                  onClick={() => {
                    props.cloneGitRepository()
                    _paq.push(['trackEvent', 'fileExplorer', 'workspaceMenu', 'cloneGitRepository'])
                    props.hideIconsMenu(!showIconsMenu)
                  }}
                  className='fab fa-github pl-2'
                >
                </span>
                <span className="pl-3"><FormattedMessage id='filePanel.clone' /></span>
              </div>
            </CustomTooltip>
          </Dropdown.Item>
          <Dropdown.Item><Dropdown.Divider className="border mt-0 mb-0 remixui_menuhr" style={{ pointerEvents: 'none' }}/></Dropdown.Item>
          <Dropdown.Item>
            <CustomTooltip
              placement="right-start"
              tooltipId="createWorkspaceTooltip"
              tooltipClasses="text-nowrap"
              tooltipText={<FormattedMessage id='filePanel.workspace.download' />}
            >
              <div
                data-id='workspacesDownload'
                onClick={() => {
                  props.downloadWorkspaces()
                  _paq.push(['trackEvent', 'fileExplorer', 'workspaceMenu', 'workspacesDownload'])
                  props.hideIconsMenu(!showIconsMenu)
                }}
                key={`workspacesDownload-fe-ws`}
              >
                <span
                  hidden={ hideWorkspaceOptions || hideLocalhostOptions }
                  id='workspacesDownload'
                  data-id='workspacesDownload'
                  onClick={() => {
                    props.downloadWorkspaces()
                    _paq.push(['trackEvent', 'fileExplorer', 'workspaceMenu', 'workspacesDownload'])
                    props.hideIconsMenu(!showIconsMenu)
                  }}
                  className='far fa-download pl-2 '
                >
                </span>
                <span className="pl-3"><FormattedMessage id='filePanel.download' /></span>
              </div>
            </CustomTooltip>
          </Dropdown.Item>
          <Dropdown.Item>
            <CustomTooltip
              placement="right-start"
              tooltipId="createWorkspaceTooltip"
              tooltipClasses="text-nowrap"
              tooltipText={<FormattedMessage id='filePanel.workspace.restore' />}
            >
              <div
                data-id='workspacesRestore'
                onClick={() => {
                  props.restoreBackup()
                  _paq.push(['trackEvent', 'fileExplorer', 'workspaceMenu', 'workspacesRestore'])
                  props.hideIconsMenu(!showIconsMenu)
                }}
                key={`workspacesRestore-fe-ws`}
              >
                <span
                  hidden={ hideWorkspaceOptions }
                  id='workspacesRestore'
                  data-id='workspacesRestore'
                  onClick={() => {
                    props.restoreBackup()
                    _paq.push(['trackEvent', 'fileExplorer', 'workspaceMenu', 'workspacesRestore'])
                    props.hideIconsMenu(!showIconsMenu)
                  }}
                  className='far fa-upload pl-2'
                >
                </span>
                <span className="pl-3"><FormattedMessage id='filePanel.restore' /></span>
              </div>
            </CustomTooltip>
          </Dropdown.Item>
          <Dropdown.Item><Dropdown.Divider className="border mt-0 mb-0 remixui_menuhr" style={{ pointerEvents: 'none' }}/></Dropdown.Item>
          <Dropdown.Item>
            <CustomTooltip
              placement="right-start"
              tooltipId="createSolGHActionTooltip"
              tooltipClasses="text-nowrap"
              tooltipText={<FormattedMessage id='filePanel.workspace.solghaction' />}
            >
              <div
                data-id='soliditygithubaction'
                onClick={(e) => {
                  e.stopPropagation()
                  props.addGithubAction()
                  _paq.push(['trackEvent', 'fileExplorer', 'workspaceMenu', 'addSolidityTesting'])
                  props.hideIconsMenu(!showIconsMenu)
                }}
              >
                <span
                  hidden={ hideWorkspaceOptions }
                  id='soliditygithubaction'
                  data-id='soliditygithubaction'
                  onClick={(e) => {
                    e.stopPropagation()
                    props.addGithubAction()
                    _paq.push(['trackEvent', 'fileExplorer', 'workspaceMenu', 'addSolidityTesting'])
                    props.hideIconsMenu(!showIconsMenu)
                  }}
                  className='fak fa-solidity-mono pl-2'
                >
                </span>
                <span className="pl-3">{<FormattedMessage id='filePanel.solghaction' />}</span>
              </div>
            </CustomTooltip>
          </Dropdown.Item>
          <Dropdown.Item>
            <CustomTooltip
              placement="right-start"
              tooltipId="createTsSolTestGHActionTooltip"
              tooltipClasses="text-nowrap"
              tooltipText={<FormattedMessage id='filePanel.workspace.tssoltestghaction' />}
            >
              <div
                data-id='typescriptsoliditygithubtestaction'
                onClick={(e) => {
                  e.stopPropagation()
                  props.addTsSolTestGithubAction()
                  _paq.push(['trackEvent', 'fileExplorer', 'workspaceMenu', 'addTsSolTestingAction'])
                  props.hideIconsMenu(!showIconsMenu)
                }}
              >
                  <span
                    hidden={ hideWorkspaceOptions }
                    id='tssoliditygithubaction'
                    data-id='tssoliditygithubaction'
                    onClick={(e) => {
                      e.stopPropagation()
                      props.addTsSolTestGithubAction()
                      _paq.push(['trackEvent', 'fileExplorer', 'workspaceMenu', 'addTsSolTestingAction'])
                      props.hideIconsMenu(!showIconsMenu)
                    }}
                    className='fab fa-js pl-2'
                  >
                  </span>
                  <span className="pl-3">{<FormattedMessage id='filePanel.tssoltestghaction' />}</span>
                </div>
              </CustomTooltip>
            </Dropdown.Item>
            <Dropdown.Item>
              <CustomTooltip
                placement="right-start"
                tooltipId="createSlitherGHActionTooltip"
                tooltipClasses="text-nowrap"
                tooltipText={<FormattedMessage id='filePanel.workspace.slitherghaction' />}
              >
                <div
                  data-id='slithergithubtestaction'
                  onClick={(e) => {
                    e.stopPropagation()
                    props.addSlitherGithubAction()
                    _paq.push(['trackEvent', 'fileExplorer', 'workspaceMenu', 'addSlitherAction'])
                    props.hideIconsMenu(!showIconsMenu)
                  }}
                >
                  <span
                    hidden={ hideWorkspaceOptions }
                    id='slithergithubaction'
                    data-id='slithergithubaction'
                    onClick={(e) => {
                      e.stopPropagation()
                      props.addSlitherGithubAction()
                      _paq.push(['trackEvent', 'fileExplorer', 'workspaceMenu', 'addSlitherAction'])
                      props.hideIconsMenu(!showIconsMenu)
                    }}
                    className='far fa-shield pl-2'
                  >
                  </span>
                  <span className="pl-3">{<FormattedMessage id='filePanel.slitherghaction' />}</span>
                </div>
              </CustomTooltip>
            </Dropdown.Item>
        </>
      )
    }
