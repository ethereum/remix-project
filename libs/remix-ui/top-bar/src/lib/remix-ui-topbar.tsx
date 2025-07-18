/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import React, { useContext, useState } from 'react'
import BasicLogo from '../components/BasicLogo'
import '../css/topbar.css'
import { Dropdown } from 'react-bootstrap'
import { CustomMenu, CustomToggle } from 'libs/remix-ui/helper/src/lib/components/custom-dropdown'
import { WorkspaceMetadata } from 'libs/remix-ui/workspace/src/lib/types'
import { platformContext } from 'libs/remix-ui/app/src/lib/remix-app/context/context'
import { useIntl } from 'react-intl'
import { Topbar } from 'apps/remix-ide/src/app/components/top-bar'
import { TopbarContext } from '../context/topbarContext'

export interface RemixUiTopbarProps {
  plugin: Topbar
}

const _paq = window._paq || []

export function RemixUiTopbar ({ plugin }: RemixUiTopbarProps) {
  const intl = useIntl()
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceMetadata>(null)
  const platform = useContext(platformContext)
  const global = useContext(TopbarContext)
  const LOCALHOST = ' - connect to localhost - '
  const NO_WORKSPACE = ' - none - '
  const [currentWorkspace, setCurrentWorkspace] = useState<string>(NO_WORKSPACE)
  const [togglerText, setTogglerText] = useState<'Connecting' | 'Connected to Local FileSystem'>('Connecting')

  const toggleDropdown = (isOpen: boolean) => {
    setShowDropdown(isOpen)
  }
  const formatNameForReadonly = (name: string) => {
    return global.fs.readonly ? name + ` (${intl.formatMessage({ id: 'filePanel.readOnly' })})` : name
  }

  const IsGitRepoDropDownMenuItem = (props: { isGitRepo: boolean, mName: string}) => {
    return (
      <>
        {props.isGitRepo ? (
          <div className="d-flex justify-content-between">
            <span>{currentWorkspace === props.mName ? <span>&#10003; {props.mName} </span> : <span className="pl-3">{props.mName}</span>}</span>
            <i className="fas fa-code-branch pt-1"></i>
          </div>
        ) : (
          <span>{currentWorkspace === props.mName ? <span>&#10003; {props.mName} </span> : <span className="pl-3">{props.mName}</span>}</span>
        )}
      </>
    )
  }

  const switchWorkspace = async (name: string) => {
    try {
      await global.dispatchSwitchToWorkspace(name)
      global.dispatchHandleExpandPath([])
      _paq.push(['trackEvent', 'Workspace', 'switchWorkspace', name])
    } catch (e) {
      global.modal(
        intl.formatMessage({ id: 'filePanel.workspace.switch' }),
        e.message,
        intl.formatMessage({ id: 'filePanel.ok' }),
        () => {},
        intl.formatMessage({ id: 'filePanel.cancel' })
      )
      console.error(e)
    }
  }

  const ShowAllMenuItems = () => {
    return (
      <>
        { global.fs.browser.workspaces.map(({ name, isGitRepo }, index) => (
          <Dropdown.Item
            key={index}
            onClick={() => { switchWorkspace(name) }}
            data-id={`dropdown-item-${name}`}
          >
            <IsGitRepoDropDownMenuItem isGitRepo={isGitRepo} mName={name} />
          </Dropdown.Item>
        ))}
      </>
    )
  }

  const ShowNonLocalHostMenuItems = () => {
    const cachedFilter = global.fs.browser.workspaces.filter(x => !x.name.includes('localhost'))
    return (
      <>
        {
          currentWorkspace === LOCALHOST && cachedFilter.length > 0 ? cachedFilter.map(({ name, isGitRepo }, index) => (
            <Dropdown.Item
              key={index}
              onClick={() => {
                switchWorkspace(name)
              }}
              data-id={`dropdown-item-${name}`}
            >
              <IsGitRepoDropDownMenuItem isGitRepo={isGitRepo} mName={name} />
            </Dropdown.Item>
          )) : <ShowAllMenuItems />
        }
        <h1>ShowNonLocalHostMenuItems</h1>
      </>
    )
  }

  console.log('what do we have here in topbar', global.fs)

  return (
    <section className="h-100 p-2 d-flex flex-row align-items-center justify-content-between bg-light border">
      <div className="d-flex flex-row align-items-center justify-content-between w-100 ">
        <div className="d-flex flex-row align-items-center justify-content-between">
          <span className="d-flex align-items-center justify-content-between mr-3">
            <span style={{ width: '35px', height: '35px' }} className="remixui_homeIcon"><BasicLogo /></span>
            <span className="text-primary ml-2 font-weight-light text-uppercase" style={{ fontSize: '1.2rem' }}>Remix</span>
          </span>
          <span className="btn btn-sm border border-secondary text-secondary">v0.57.0</span>
        </div>
        <div>
          <Dropdown id="workspacesSelect" data-id="workspacesSelect" onToggle={toggleDropdown} show={showDropdown}>
            <Dropdown.Toggle
              as={CustomToggle}
              id="dropdown-custom-components"
              className="btn btn-light btn-block w-100 d-inline-block border border-dark form-control"
              icon={selectedWorkspace && selectedWorkspace.isGitRepo && !(currentWorkspace === LOCALHOST) ? 'far fa-code-branch' : null}
            >
              {selectedWorkspace ? selectedWorkspace.name === LOCALHOST ? togglerText : selectedWorkspace.name : currentWorkspace === LOCALHOST ? formatNameForReadonly('localhost') : NO_WORKSPACE}
            </Dropdown.Toggle>
            <Dropdown.Menu as={CustomMenu} className="w-100 custom-dropdown-items" data-id="custom-dropdown-items">
              {!global.fs.initializingFS && (
                <>
                  <ShowNonLocalHostMenuItems />
                  {(global.fs.browser.workspaces.length <= 0 || currentWorkspace === NO_WORKSPACE) && (
                    <Dropdown.Item
                      onClick={() => {
                        switchWorkspace(NO_WORKSPACE)
                      }}
                    >
                      {<span className="pl-3">NO_WORKSPACE</span>}
                    </Dropdown.Item>
                  )}
                </>
              )}
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div className="d-flex flex-row align-items-center justify-content-between">
          <span className="btn btn-topbar btn-sm mr-3">
            <i className="fab fa-github mr-2"></i>
          Connect to Github
          </span>
          <span className="btn border btn-topbar btn-sm mr-3">
          Theme
          </span>
          <span style={{ fontSize: '1.5rem' }}>
            <i className="fa fa-cog"></i>
          </span>
        </div>
      </div>
    </section>
  )
}
