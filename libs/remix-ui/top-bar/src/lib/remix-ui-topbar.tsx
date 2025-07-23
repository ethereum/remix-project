/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import React, { useContext, useEffect, useReducer, useState } from 'react'
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

export interface RemixUiTopbarProps {
  plugin: Topbar
  reducerState: any
  dispatch: any

}

const _paq = window._paq || []

export function RemixUiTopbar ({ plugin, reducerState, dispatch }: RemixUiTopbarProps) {
  const intl = useIntl()
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceMetadata>(null)
  const platform = useContext(platformContext)
  const global = useContext(TopbarContext)
  const LOCALHOST = ' - connect to localhost - '
  const NO_WORKSPACE = ' - none - '
  const [currentWorkspace, setCurrentWorkspace] = useState<string>(NO_WORKSPACE)
  const [togglerText, setTogglerText] = useState<'Connecting' | 'Connected to Local FileSystem'>('Connecting')
  const [latestReleaseNotesUrl, setLatestReleaseNotesUrl] = useState<string>('')
  const [currentReleaseVersion, setCurrentReleaseVersion] = useState<string>('')
  const toggleDropdown = (isOpen: boolean) => {
    setShowDropdown(isOpen)
  }
  const formatNameForReadonly = (name: string) => {
    return global.fs.readonly ? name + ` (${intl.formatMessage({ id: 'filePanel.readOnly' })})` : name
  }

  useEffect(() => {
    console.log('plugin.workspaces', plugin.workspaces)
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
            <i className="fas fa-ellipsis-vertical pt-1 top-bar-dropdownItem"></i>
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

    return () => {
      console.log('I ran the run function and I am unmounting')
    }
  }, [])

  const [currentTheme, setCurrentTheme] = useState<any>(null)

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
          <WorkspaceDropdown
            toggleDropdown={toggleDropdown}
            showDropdown={showDropdown}
            selectedWorkspace={selectedWorkspace}
            currentWorkspace={currentWorkspace}
            togglerText={togglerText}
            formatNameForReadonly={formatNameForReadonly}
            NO_WORKSPACE={NO_WORKSPACE}
            LOCALHOST={LOCALHOST}
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
