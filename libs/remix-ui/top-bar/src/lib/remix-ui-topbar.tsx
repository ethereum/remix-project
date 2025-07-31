/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import React, { MutableRefObject, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import BasicLogo from '../components/BasicLogo'
import '../css/topbar.css'
import { Button, ButtonGroup, Dropdown } from 'react-bootstrap'
import { CustomMenu, CustomToggle, CustomTopbarMenu } from 'libs/remix-ui/helper/src/lib/components/custom-dropdown'
import { WorkspaceMetadata } from 'libs/remix-ui/workspace/src/lib/types'
import { appPlatformTypes, platformContext } from 'libs/remix-ui/app/src/lib/remix-app/context/context'
import { FormattedMessage, useIntl } from 'react-intl'
import { TopbarContext } from '../context/topbarContext'
import { WorkspacesDropdown } from '../components/WorkspaceDropdown'
import { useOnClickOutside } from 'libs/remix-ui/remix-ai-assistant/src/components/onClickOutsideHook'
import { cloneRepository, deleteWorkspace, fetchWorkspaceDirectory, getWorkspaces, handleDownloadFiles, handleDownloadWorkspace, handleExpandPath, publishToGist, renameWorkspace, restoreBackupZip, switchToWorkspace } from 'libs/remix-ui/workspace/src/lib/actions'
import { gitUIPanels } from 'libs/remix-ui/git/src/types'
import { loginWithGitHub, setPlugin } from 'libs/remix-ui/git/src/lib/pluginActions'
import { GitHubUser } from 'libs/remix-api/src/lib/types/git'
import { GitHubCallback } from '../topbarUtils/gitOauthHandler'
import { GitHubLogin } from '../components/gitLogin'
import GithubLoginSuccess from '../components/githubLoginSuccess'

const _paq = window._paq || []

export function RemixUiTopbar () {
  const intl = useIntl()
  const [showDropdown, setShowDropdown] = useState(false)
  const platform = useContext(platformContext)
  const global = useContext(TopbarContext)
  const plugin = global.plugin as any
  const LOCALHOST = ' - connect to localhost - '
  const NO_WORKSPACE = ' - none - '
  const ROOT_PATH = '/'
  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceMetadata>(null)
  const [currentWorkspace, setCurrentWorkspace] = useState<string>(NO_WORKSPACE)
  const [currentMenuItemName, setCurrentMenuItemName] = useState<string>(null)
  const [currentTheme, setCurrentTheme] = useState<any>(null)
  const [latestReleaseNotesUrl, setLatestReleaseNotesUrl] = useState<string>('')
  const [currentReleaseVersion, setCurrentReleaseVersion] = useState<string>('')
  const [menuItems, setMenuItems] = useState<any[]>([])
  const subMenuIconRef = useRef<any>(null)
  const [showSubMenuFlyOut, setShowSubMenuFlyOut] = useState<boolean>(false)
  useOnClickOutside([subMenuIconRef], () => setShowSubMenuFlyOut(false))
  const workspaceRenameInput = useRef()
  const cloneUrlRef = useRef<HTMLInputElement>()

  const [user, setUser] = useState<GitHubUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if we're on the callback page
  if (window.location.pathname === '/auth/github/callback') {
    return <GitHubCallback />;
  }

  const handleLoginSuccess = (user: GitHubUser, token: string) => {
    setUser(user);
    setError(null);
    console.log('Login successful:', user);
  };

  const handleLoginError = (error: string) => {
    setError(error);
    console.error('Login failed:', error);
  };

  const handleLogout = () => {
    localStorage.removeItem('github_token');
    setUser(null);
  };

  const toggleDropdown = (isOpen: boolean) => {
    setShowDropdown(isOpen)
    if (isOpen) {
      updateMenuItems()
    }
  }

  useEffect(() => {
    const current = localStorage.getItem('currentWorkspace')
    const workspace = plugin.workspaces.find((workspace) => workspace.name === current)
    setSelectedWorkspace(workspace)
    setCurrentWorkspace(current)
  }, [plugin.workspaces])

  useEffect(() => {
    const run = async () => {
      const [url, currentReleaseVersion] = await plugin.getLatestReleaseNotesUrl()
      setLatestReleaseNotesUrl(url)
      setCurrentReleaseVersion(currentReleaseVersion)
    }
    run()
  }, [])

  useEffect(() => {
    if (global.fs.mode === 'browser') {
      if (global.fs.browser.currentWorkspace) {
        setCurrentWorkspace(global.fs.browser.currentWorkspace)
        fetchWorkspaceDirectory(ROOT_PATH)
      } else {
        setCurrentWorkspace(NO_WORKSPACE)
      }
    } else if (global.fs.mode === 'localhost') {
      fetchWorkspaceDirectory(ROOT_PATH)
      setCurrentWorkspace(LOCALHOST)
    }
  }, [global.fs.browser.currentWorkspace, global.fs.localhost.sharedFolder, global.fs.mode, showDropdown])

  useEffect(() => {
    if (global.fs.browser.currentWorkspace && !global.fs.browser.workspaces.find(({ name }) => name === global.fs.browser.currentWorkspace)) {
      if (global.fs.browser.workspaces.length > 0) {
        switchWorkspace(global.fs.browser.workspaces[global.fs.browser.workspaces.length - 1].name)
      } else {
        switchWorkspace(NO_WORKSPACE)
      }
    }
  }, [global.fs.browser.workspaces, global.fs.browser.workspaces.length])

  const subItems = useMemo(() => {
    return [
      { label: 'Rename', onClick: renameCurrentWorkspace, icon: 'far fa-edit' },
      { label: 'Duplicate', onClick: downloadCurrentWorkspace, icon: 'fas fa-copy' },
      { label: 'Download', onClick: downloadCurrentWorkspace, icon: 'fas fa-download' },
      { label: 'Delete', onClick: deleteCurrentWorkspace, icon: 'fas fa-trash' }
    ]
  }, [])

  const updateMenuItems = (workspaces?: WorkspaceMetadata[]) => {
    const menuItems = (workspaces || plugin.getWorkspaces()).map((workspace) => ({
      name: workspace.name,
      isGitRepo: workspace.isGitRepo,
      isGist: workspace.isGist,
      branches: workspace.branches,
      currentBranch: workspace.currentBranch,
      hasGitSubmodules: workspace.hasGitSubmodules,
      submenu: subItems
    }))
    setMenuItems(menuItems)
  }

  const onFinishDeleteAllWorkspaces = async () => {
    try {
      await deleteAllWorkspaces()
    } catch (e) {
      global.modal(
        intl.formatMessage({ id: 'filePanel.workspace.deleteAll' }),
        e.message,
        intl.formatMessage({ id: 'filePanel.ok' }),
        () => {},
        intl.formatMessage({ id: 'filePanel.cancel' })
      )
      console.error(e)
    }
  }

  const onFinishRenameWorkspace = async (currMenuName?: string) => {
    if (workspaceRenameInput.current === undefined) return
    // @ts-ignore: Object is possibly 'null'.
    const workspaceName = workspaceRenameInput.current.value
    try {
      await renameWorkspace(currMenuName, workspaceName)
    } catch (e) {
      global.modal(
        intl.formatMessage({ id: 'filePanel.workspace.rename' }),
        e.message,
        intl.formatMessage({ id: 'filePanel.ok' }),
        () => {},
        intl.formatMessage({ id: 'filePanel.cancel' })
      )
      console.error(e)
    }
  }

  const onFinishDownloadWorkspace = async () => {
    try {
      await handleDownloadWorkspace()
    } catch (e) {
      global.modal(
        intl.formatMessage({ id: 'filePanel.workspace.download' }),
        e.message,
        intl.formatMessage({ id: 'filePanel.ok' }),
        () => {},
        intl.formatMessage({ id: 'filePanel.cancel' })
      )
      console.error(e)
    }
  }
  const onFinishDeleteWorkspace = async (workspaceName?: string) => {
    try {
      await deleteWorkspace(workspaceName)
    } catch (e) {
      global.modal(
        intl.formatMessage({ id: 'filePanel.workspace.delete' }),
        e.message,
        intl.formatMessage({ id: 'filePanel.ok' }),
        () => {},
        intl.formatMessage({ id: 'filePanel.cancel' })
      )
      console.error(e)
    }
  }

  const deleteCurrentWorkspace = (workspaceName?: string) => {
    global.modal(
      intl.formatMessage({ id: 'filePanel.workspace.delete' }),
      intl.formatMessage({ id: 'filePanel.workspace.deleteConfirm' }),
      intl.formatMessage({ id: 'filePanel.ok' }),
      () => onFinishDeleteWorkspace(workspaceName),
      intl.formatMessage({ id: 'filePanel.cancel' })
    )
  }

  const restoreBackup = async () => {
    try {
      await restoreBackupZip()
    } catch (e) {
      console.error(e)
    }
  }

  const downloadWorkspaces = async () => {
    try {
      await handleDownloadFiles()
    } catch (e) {
      console.error(e)
    }
  }

  const deleteAllWorkspaces = () => {
    global.modal(
      intl.formatMessage({ id: 'filePanel.workspace.deleteAll' }),
      <>
        <div className="d-flex flex-column">
          <span className="pb-1">{intl.formatMessage({ id: 'filePanel.workspace.deleteAllConfirm1' })}</span>
          <span>{intl.formatMessage({ id: 'filePanel.workspace.deleteAllConfirm2' })}</span>
        </div>
      </>,
      intl.formatMessage({ id: 'filePanel.ok' }),
      onFinishDeleteAllWorkspaces,
      intl.formatMessage({ id: 'filePanel.cancel' })
    )
  }

  const cloneModalMessage = () => {
    return (
      <>
        <input
          type="text"
          data-id="modalDialogCustomPromptTextClone"
          placeholder={intl.formatMessage({
            id: 'filePanel.workspace.enterGitUrl'
          })}
          ref={cloneUrlRef}
          className="form-control"
        />
      </>
    )
  }

  const logOutOfGithub = async () => {
    await global.plugin.call('menuicons', 'select', 'dgit');
    await global.plugin.call('dgit', 'open', gitUIPanels.GITHUB)
    _paq.push(['trackEvent', 'Workspace', 'GIT', 'logout'])
  }

  const handleTypingUrl = () => {
    const url = cloneUrlRef.current.value

    if (url) {
      cloneRepository(url)
    } else {
      global.modal(
        intl.formatMessage({ id: 'filePanel.workspace.clone' }),
        intl.formatMessage({ id: 'filePanel.workspace.cloneMessage' }),
        intl.formatMessage({ id: (platform !== appPlatformTypes.desktop)? 'filePanel.ok':'filePanel.selectFolder' }),
        () => {},
        intl.formatMessage({ id: 'filePanel.cancel' })
      )
    }
  }

  const cloneGitRepository = () => {
    global.modal(
      intl.formatMessage({ id: 'filePanel.workspace.clone' }),
      cloneModalMessage(),
      intl.formatMessage({ id:  (platform !== appPlatformTypes.desktop)? 'filePanel.ok':'filePanel.selectFolder' }),
      handleTypingUrl,
      intl.formatMessage({ id: 'filePanel.cancel' })
    )
  }

  const getCurrentTheme = async () => {
    const theme = await plugin.call('theme', 'currentTheme')
    return theme
  }
  const renameModalMessage = (workspaceName?: string) => {
    return (
      <div className='d-flex flex-column'>
        <label><FormattedMessage id="filePanel.name" /></label>
        <input type="text" data-id="modalDialogCustomPromptTextRename" defaultValue={workspaceName || currentMenuItemName} ref={workspaceRenameInput} className="form-control" />
      </div>
    )
  }

  const downloadCurrentWorkspace = () => {
    global.modal(
      intl.formatMessage({ id: 'filePanel.workspace.download' }),
      intl.formatMessage({ id: 'filePanel.workspace.downloadConfirm' }),
      intl.formatMessage({ id: 'filePanel.ok' }),
      onFinishDownloadWorkspace,
      intl.formatMessage({ id: 'filePanel.cancel' })
    )
  }

  const createWorkspace = async () => {
    await plugin.call('manager', 'activatePlugin', 'templateSelection')
    await plugin.call('tabs', 'focus', 'templateSelection')
  }

  const renameCurrentWorkspace = (workspaceName?: string) => {
    global.modal(
      intl.formatMessage({ id: 'filePanel.workspace.rename' }),
      renameModalMessage(workspaceName),
      intl.formatMessage({ id: 'filePanel.save' }),
      () => onFinishRenameWorkspace(workspaceName),
      intl.formatMessage({ id: 'filePanel.cancel' })
    )
  }

  const checkIfLightTheme = (themeName: string) =>
    themeName.includes('dark') || themeName.includes('black') || themeName.includes('hackerOwl') ? false : true

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
      await switchToWorkspace(name)
      handleExpandPath([])
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
              className="fas fa-ellipsis-vertical pt-1 pr-2 top-bar-dropdownItem"
              onClick={() => {
                setShowSubMenuFlyOut(!showSubMenuFlyOut)
              }}
            ></i>
          </div>
        ))}
      </>
    )
  }

  const ShowNonLocalHostMenuItems = () => {
    const cachedFilter = global.fs.browser.workspaces.filter(x => !x.name.includes('localhost'))
    return (
      <div className="">
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

  return (
    <section
      className="h-100 d-flex flex-row align-items-center justify-content-between bg-light border flex-nowrap"
    >
      <div className="d-flex flex-row align-items-center justify-content-between w-100 py-2 px-3">
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
          <WorkspacesDropdown
            menuItems={menuItems}
            toggleDropdown={toggleDropdown}
            showDropdown={showDropdown}
            selectedWorkspace={selectedWorkspace}
            currentWorkspace={currentWorkspace}
            NO_WORKSPACE={NO_WORKSPACE}
            switchWorkspace={switchWorkspace}
            ShowNonLocalHostMenuItems={ShowNonLocalHostMenuItems}
            CustomToggle={CustomToggle}
            showSubMenuFlyOut={showSubMenuFlyOut}
            setShowSubMenuFlyOut={setShowSubMenuFlyOut}
            createWorkspace={createWorkspace}
            renameCurrentWorkspace={renameCurrentWorkspace}
            downloadCurrentWorkspace={downloadCurrentWorkspace}
            deleteCurrentWorkspace={deleteCurrentWorkspace}
            downloadWorkspaces={downloadWorkspaces}
            restoreBackup={restoreBackup}
            deleteAllWorkspaces={deleteAllWorkspaces}
            setCurrentMenuItemName={setCurrentMenuItemName}
            setMenuItems={setMenuItems}
          />
        </div>
        <div
          className="d-flex flex-row align-items-center justify-content-end flex-nowrap"
          style={{ minWidth: '33%' }}
        >
          <>
            {user ? (
              <GithubLoginSuccess
                user={user}
                handleLogout={handleLogout}
                cloneGitRepository={cloneGitRepository}
                publishToGist={publishToGist}
                logOutOfGithub={logOutOfGithub}
              />
            ) : (
              <GitHubLogin
                onLoginSuccess={handleLoginSuccess}
                onLoginError={handleLoginError}
                cloneGitRepository={cloneGitRepository}
                logOutOfGithub={logOutOfGithub}
              />
            )}
          </>
          <Dropdown className="ml-5" data-id="topbar-themeIcon">
            <Dropdown.Toggle
              as={Button}
              variant="outline-secondary"
              className="btn-topbar btn-sm mr-5"
              data-id="topbar-themeIcon-toggle"
              style={{
                padding: '0.35rem 0.5rem',
                fontSize: '0.8rem'
              }}
            >
              <i className="fas fa-sun-bright mr-2"></i>
              Theme
            </Dropdown.Toggle>
            <Dropdown.Menu
              as={CustomTopbarMenu}
              className="custom-dropdown-items text-decoration-none"
              data-id="topbar-thememenu-body"
              style={{
                minWidth: '95px'
              }}
            >
              <Dropdown.Item
                onClick={() => {
                  plugin.call('theme', 'switchTheme', 'Flatly')
                }}
                data-id="topbar-themeIcon-light"
              >
                <i className="fas fa-sun-bright mr-2"></i>
                Light
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => {
                  plugin.call('theme', 'switchTheme', 'Dark')
                }}
                data-id="topbar-themeIcon-dark"
              >
                <i className="fas fa-moon mr-2"></i>
                Dark
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <span
            style={{ fontSize: '1.5rem', cursor: 'pointer' }}
            className=""
            onClick={async () => {
              plugin.call('menuicons', 'select', 'settings')
              plugin.call('tabs', 'focus', 'settings')
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
