/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import React, { MutableRefObject, useContext, useEffect, useReducer, useRef, useState } from 'react'
import BasicLogo from '../components/BasicLogo'
import '../css/topbar.css'
import { Dropdown } from 'react-bootstrap'
import { CustomToggle } from 'libs/remix-ui/helper/src/lib/components/custom-dropdown'
import { WorkspaceMetadata } from 'libs/remix-ui/workspace/src/lib/types'
import { platformContext } from 'libs/remix-ui/app/src/lib/remix-app/context/context'
import { useIntl } from 'react-intl'
import { Topbar } from 'apps/remix-ide/src/app/components/top-bar'
import { TopbarContext } from '../context/topbarContext'
import { WorkspaceDropdown } from '../components/WorkspaceDropdown'
import { WorkspaceDropdownSubMenu } from '../components/WorkspaceDropdownSubMenu'
import { useOnClickOutside } from 'libs/remix-ui/remix-ai-assistant/src/components/onClickOutsideHook'

export interface RemixUiTopbarProps {
  plugin: Topbar
  reducerState: any
  dispatch: any

}

const _paq = window._paq || []

export function RemixUiTopbar ({ plugin, reducerState, dispatch }: RemixUiTopbarProps) {
  const intl = useIntl()
  const [showDropdown, setShowDropdown] = useState(false)
  const platform = useContext(platformContext)
  const global = useContext(TopbarContext)
  const LOCALHOST = ' - connect to localhost - '
  const NO_WORKSPACE = ' - none - '
  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceMetadata>(null)
  const [currentWorkspace, setCurrentWorkspace] = useState<string>(NO_WORKSPACE)
  const [currentTheme, setCurrentTheme] = useState<any>(null)
  const [latestReleaseNotesUrl, setLatestReleaseNotesUrl] = useState<string>('')
  const [currentReleaseVersion, setCurrentReleaseVersion] = useState<string>('')
  const subMenuIconRef = useRef<HTMLElement>(null)
  const [showSubMenuFlyOut, setShowSubMenuFlyOut] = useState<boolean>(false)
  useOnClickOutside([subMenuIconRef], () => setShowSubMenuFlyOut(false))

  const getBoundingRect = (ref: MutableRefObject<any>) => ref.current?.getBoundingClientRect()
  const calcAndConvertToDvh = (coordValue: number) => (coordValue / window.innerHeight) * 100
  const calcAndConvertToDvw = (coordValue: number) => (coordValue / window.innerWidth) * 100

  const toggleDropdown = (isOpen: boolean) => {
    setShowDropdown(isOpen)
  }

  useEffect(() => {
    const current = localStorage.getItem('currentWorkspace')
    const workspace = plugin.workspaces.find((workspace) => workspace.name === current)
    setSelectedWorkspace(workspace)
    setCurrentWorkspace(current)
  }, [plugin.workspaces])

  const IsGitRepoDropDownMenuItem = (props: { isGitRepo: boolean, mName: string}) => {
    return (
      <>
        {props.isGitRepo ? (
          <div
            className="d-flex flex-row-reverse justify-content-end"
          >
            <span
            >
              {currentWorkspace === props.mName ? <span>&#10003; {props.mName} </span> : <span className="pl-1">{props.mName}</span>}</span>
            <i className="fas fa-code-branch pt-1"></i>
          </div>
        ) : (
          <div
            className="d-flex justify-content-between"
          >
            <span>{currentWorkspace === props.mName ? <span>&#10003; {props.mName} </span> : <span className="pl-3">{props.mName}</span>}</span>
          </div>
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
        { global.plugin.workspaces.map(({ name, isGitRepo }, index) => (
          <div
            key={index}
            className="d-flex justify-content-between w-100"
          >
            <Dropdown.Item
              key={index}
              onClick={() => { switchWorkspace(name) }}
              data-id={`dropdown-item-${name}`}
              className="text-truncate"
              style={{ width: '90%' }}
            >
              <IsGitRepoDropDownMenuItem isGitRepo={isGitRepo} mName={name} />
            </Dropdown.Item>
            <i
              ref={subMenuIconRef}
              className="fas fa-ellipsis-vertical pt-1 top-bar-dropdownItem"
              onClick={() => {
                setShowSubMenuFlyOut(true)
              }}
            ></i>
          </div>
        ))}
      </>
    )
  }

  const ShowNonLocalHostMenuItems = () => {
    const cachedFilter = global.plugin.workspaces.filter(x => !x.name.includes('localhost'))
    return (
      <div className="" style={{ maxHeight: '140px', overflowY: 'scroll' }}>
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
      </div>
    )
  }

  useEffect(() => {
    const run = async () => {
      const [url, currentReleaseVersion] = await plugin.getLatestReleaseNotesUrl()
      setLatestReleaseNotesUrl(url)
      setCurrentReleaseVersion(currentReleaseVersion)
    }
    run()
  }, [])

  useEffect(() => {
    const run = async () => {
      await plugin.getWorkspaces()
      await plugin.getCurrentWorkspaceMetadata()
    }
    run()
  }, [showDropdown])

  useEffect(() => {
    plugin.on('theme', 'themeChanged', async (theme) => {
      const currentTheme = await getCurrentTheme()
      setCurrentTheme(currentTheme)
    })
  }, [])

  const getCurrentTheme = async () => {
    const theme = await plugin.call('theme', 'currentTheme')
    return theme
  }

  const checkIfLightTheme = (themeName: string) =>
    themeName.includes('dark') || themeName.includes('black') || themeName.includes('hackerOwl') ? false : true

  const items = [
    { label: 'Rename', onClick: () => {}, icon: 'fas fa-pencil-alt' },
    { label: 'Copy', onClick: () => {}, icon: 'fas fa-copy' },
    { label: 'Download', onClick: () => {}, icon: 'fas fa-download' },
    { label: 'Delete', onClick: () => {}, icon: 'fas fa-trash' }
  ]

  const flyOutRef = useRef<HTMLElement>(null)

  return (
    <section className="h-100 p-2 d-flex flex-row align-items-center justify-content-between bg-light border">
      <div className="d-flex flex-row align-items-center justify-content-between w-100 ">
        <div
          className="d-flex flex-row align-items-center justify-content-evenly"
          style={{ minWidth: '33%' }}
        >
          <span
            className="d-flex align-items-center justify-content-between mr-3 cursor-pointer"
            onClick={async () => {
              await plugin.call('tabs', 'focus', 'home')
              _paq.push(['trackEvent', 'topbar', 'header', 'Home'])
            }}
          >
            <span style={{ width: '35px', height: '35px' }} className="remixui_homeIcon"><BasicLogo /></span>
            <span className="text-primary ml-2 font-weight-light text-uppercase cursor-pointer" style={{ fontSize: '1.2rem' }}>Remix</span>
          </span>
          <span
            className="btn btn-sm border border-secondary text-decoration-none font-weight-light"
            onClick={() => {
              window.open(latestReleaseNotesUrl, '_blank')
            }}
            style={{
              padding: '0.25rem 0.5rem',
              color: currentTheme && !checkIfLightTheme(currentTheme.name) ? 'var(--white)' : 'var(--text)'
            }}
          >
            {currentReleaseVersion}
          </span>
        </div>
        <div className="" style={{ minWidth: '33%' }}>
          {showSubMenuFlyOut && <WorkspaceDropdownSubMenu
            ref={flyOutRef} menuItems={items}
            style={{ borderRadius: '8px', left: `${calcAndConvertToDvw(getBoundingRect(subMenuIconRef).left)}dvw`, right: '0px', bottom: '75px', height: '235px', width: '300px', }}
          />}
          <WorkspaceDropdown
            toggleDropdown={toggleDropdown}
            showDropdown={showDropdown}
            selectedWorkspace={selectedWorkspace}
            currentWorkspace={currentWorkspace}
            NO_WORKSPACE={NO_WORKSPACE}
            switchWorkspace={switchWorkspace}
            ShowNonLocalHostMenuItems={ShowNonLocalHostMenuItems}
            CustomToggle={CustomToggle}
            global={global}
          />
        </div>
        <div
          className="d-flex flex-row align-items-center justify-content-sm-end px-2"
          style={{ minWidth: '33%' }}
        >
          <span
            className="btn btn-topbar mr-3"
            style={{ fontSize: '0.8rem' }}
            onClick={async () => {
              await plugin.logInGithub()
              _paq.push(['trackEvent', 'topbar', 'GIT', 'login'])
            }}
          >
            <i className="fab fa-github mr-2"></i>
            Connect to Github
          </span>
          <span
            className="btn border btn-topbar mr-3"
            style={{ fontSize: '0.8rem' }}
            onClick={async () => {
              global.plugin.call('menuicons', 'select', 'theme')
              _paq.push(['trackEvent', 'topbar', 'header', 'Theme'])
            }}
            data-id="topbar-themeIcon"
          >
            Theme
            <i className="fas fa-caret-down ml-2"></i>
          </span>
          <span
            style={{ fontSize: '1.5rem', cursor: 'pointer' }}
            className=""
            onClick={async () => {
              global.plugin.call('menuicons', 'select', 'settings')
              global.plugin.call('tabs', 'focus', 'settings')
              _paq.push(['trackEvent', 'topbar', 'header', 'Settings'])
            }}
            data-id="topbar-settingsIcon"
          >
            <i className="fa fa-cog"></i>
          </span>
        </div>
      </div>
    </section>
  )
}
