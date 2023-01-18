import React, { useState, useEffect, useRef, useContext, SyntheticEvent, ChangeEvent, KeyboardEvent } from 'react' // eslint-disable-line
import { FormattedMessage, useIntl } from 'react-intl'
import { Dropdown } from 'react-bootstrap'
import { CustomIconsToggle, CustomMenu, CustomToggle, CustomTooltip } from '@remix-ui/helper'
import { FileExplorer } from './components/file-explorer' // eslint-disable-line
import { FileSystemContext } from './contexts'
import './css/remix-ui-workspace.css'
import { ROOT_PATH } from './utils/constants'
import { HamburgerMenu } from './components/workspace-hamburger'
const _paq = window._paq = window._paq || []

const canUpload = window.File || window.FileReader || window.FileList || window.Blob

export function Workspace () {
  const LOCALHOST = ' - connect to localhost - '
  const NO_WORKSPACE = ' - none - '
  const [currentWorkspace, setCurrentWorkspace] = useState<string>(NO_WORKSPACE)
  const [selectedWorkspace, setSelectedWorkspace] = useState<{ name: string, isGitRepo: boolean, branches?: { remote: any; name: string; }[], currentBranch?: string }>(null)
  const [showDropdown, setShowDropdown] = useState<boolean>(false)
  const [showIconsMenu, hideIconsMenu] = useState<boolean>(false)
  const [showBranches, setShowBranches] = useState<boolean>(false)
  const [branchFilter, setBranchFilter] = useState<string>('')
  const displayOzCustomRef = useRef<HTMLDivElement>()
  const mintableCheckboxRef = useRef()
  const burnableCheckboxRef = useRef()
  const pausableCheckboxRef = useRef()
  const transparentRadioRef = useRef()
  const uupsRadioRef = useRef()
  const global = useContext(FileSystemContext)
  const workspaceRenameInput = useRef()
  const workspaceCreateInput = useRef()
  const workspaceCreateTemplateInput = useRef()
  const intl = useIntl()
  const cloneUrlRef = useRef<HTMLInputElement>()
  const initGitRepoRef = useRef<HTMLInputElement>()
  const filteredBranches = selectedWorkspace ? (selectedWorkspace.branches || []).filter(branch => branch.name.includes(branchFilter) && branch.name !== 'HEAD').slice(0, 20) : []
  const currentBranch = selectedWorkspace ? selectedWorkspace.currentBranch : null
  const plugin = global.plugin

  useEffect(() => {
    let workspaceName = localStorage.getItem('currentWorkspace')
    if (!workspaceName && global.fs.browser.workspaces.length) {
      workspaceName = global.fs.browser.workspaces[0].name
    }
    setCurrentWorkspace(workspaceName)
    resetFocus()
  }, [])

  useEffect(() => {
    if (global.fs.mode === 'browser') {
      if (global.fs.browser.currentWorkspace) setCurrentWorkspace(global.fs.browser.currentWorkspace)
      else setCurrentWorkspace(NO_WORKSPACE)
      global.dispatchFetchWorkspaceDirectory(ROOT_PATH)
    } else if (global.fs.mode === 'localhost') {
      global.dispatchFetchWorkspaceDirectory(ROOT_PATH)
      setCurrentWorkspace(LOCALHOST)
    }
  }, [global.fs.browser.currentWorkspace, global.fs.localhost.sharedFolder, global.fs.mode])

  useEffect(() => {
    if (global.fs.browser.currentWorkspace && !global.fs.browser.workspaces.find(({ name }) => name === global.fs.browser.currentWorkspace)) {
      if (global.fs.browser.workspaces.length > 0) {
        switchWorkspace(global.fs.browser.workspaces[global.fs.browser.workspaces.length - 1].name)
      } else {
        switchWorkspace(NO_WORKSPACE)
      }
    }
  }, [global.fs.browser.workspaces])

  useEffect(() => {
    const workspace = global.fs.browser.workspaces.find(workspace => workspace.name === currentWorkspace)

    setSelectedWorkspace(workspace)
  }, [currentWorkspace])

  const renameCurrentWorkspace = () => {
    global.modal(intl.formatMessage({ id: 'filePanel.workspace.rename' }), renameModalMessage(), 'OK', onFinishRenameWorkspace, '')
  }

  const createWorkspace = () => {
    global.modal(intl.formatMessage({ id: 'filePanel.workspace.create' }), createModalMessage(), 'OK', onFinishCreateWorkspace, '')
  }

  const deleteCurrentWorkspace = () => {
    global.modal(
      intl.formatMessage({ id: 'filePanel.workspace.delete' }),
      intl.formatMessage({ id: 'filePanel.workspace.deleteConfirm' }),
      'OK',
      onFinishDeleteWorkspace,
      ''
    )
  }

  const cloneGitRepository = () => {
    global.modal(
      intl.formatMessage({ id: 'filePanel.workspace.clone' }),
      cloneModalMessage(),
      'OK',
      handleTypingUrl,
      ''
    )
  }

  const addGithubAction = () => {
    global.dispatchCreateSolidityGithubAction()
  }

  const addTsSolTestGithubAction = () => {
    global.dispatchCreateTsSolGithubAction()
  }

  const addSlitherGithubAction = () => {
    global.dispatchCreateSlitherGithubAction()
  }

  const downloadWorkspaces = async () => {
    try {
      await global.dispatchHandleDownloadFiles()
    } catch (e) {
      console.error(e)
    }
  }

  const restoreBackup = async () => {
    try {
      await global.dispatchHandleRestoreBackup()
    } catch (e) {
      console.error(e)
    }
  }

  const onFinishRenameWorkspace = async () => {
    if (workspaceRenameInput.current === undefined) return
    // @ts-ignore: Object is possibly 'null'.
    const workspaceName = workspaceRenameInput.current.value

    try {
      await global.dispatchRenameWorkspace(currentWorkspace, workspaceName)
    } catch (e) {
      global.modal('Rename Workspace', e.message, 'OK', () => {}, '')
      console.error(e)
    }
  }

  const onFinishCreateWorkspace = async () => {
    if (workspaceCreateInput.current === undefined) return
    // @ts-ignore: Object is possibly 'null'.
    const workspaceName = workspaceCreateInput.current.value
    // @ts-ignore: Object is possibly 'null'.
    const workspaceTemplateName = workspaceCreateTemplateInput.current.value || 'remixDefault'
    const initGitRepo = initGitRepoRef.current.checked
    const opts = {
      // @ts-ignore: Object is possibly 'null'.
      mintable: mintableCheckboxRef.current.checked,
      // @ts-ignore: Object is possibly 'null'.
      burnable: burnableCheckboxRef.current.checked,
      // @ts-ignore: Object is possibly 'null'.
      pausable: pausableCheckboxRef.current.checked,
      // @ts-ignore: Object is possibly 'null'.
      upgradeable: transparentRadioRef.current.checked ? transparentRadioRef.current.value : ( uupsRadioRef.current.checked ? uupsRadioRef.current.value : false )
    }

    try {
      await global.dispatchCreateWorkspace(workspaceName, workspaceTemplateName, opts, initGitRepo)
    } catch (e) {
      global.modal('Create Workspace', e.message, 'OK', () => {}, '')
      console.error(e)
    }
  }

  const onFinishDeleteWorkspace = async () => {
    try {
      await global.dispatchDeleteWorkspace(global.fs.browser.currentWorkspace)
    } catch (e) {
      global.modal('Delete Workspace', e.message, 'OK', () => {}, '')
      console.error(e)
    }
  }
  /** ** ****/

  const resetFocus = () => {
    global.dispatchSetFocusElement([{ key: '', type: 'folder' }])
  }

  const switchWorkspace = async (name: string) => {
    try {
      await global.dispatchSwitchToWorkspace(name)
      global.dispatchHandleExpandPath([])
    } catch (e) {
      global.modal('Switch To Workspace', e.message, 'OK', () => {}, '')
      console.error(e)
    }
  }

  const updateWsName = () => {
    // @ts-ignore
    if (workspaceCreateTemplateInput.current.value.startsWith('oz') && displayOzCustomRef && displayOzCustomRef.current) {
      displayOzCustomRef.current.style.display = 'block'
      // @ts-ignore
      mintableCheckboxRef.current.checked = false
      // @ts-ignore
      burnableCheckboxRef.current.checked = false
      // @ts-ignore
      pausableCheckboxRef.current.checked = false
      // @ts-ignore
      transparentRadioRef.current.checked = false
      // @ts-ignore
      uupsRadioRef.current.checked = false
    } else displayOzCustomRef.current.style.display = 'none'

    // @ts-ignore
    workspaceCreateInput.current.value = `${workspaceCreateTemplateInput.current.value || 'remixDefault'}_${Date.now()}`
  }

  const handleTypingUrl = () => {
    const url = cloneUrlRef.current.value

    if (url) {
      global.dispatchCloneRepository(url)
    } else {
      global.modal('Clone Git Repository', 'Please provide a valid git repository url.', 'OK', () => {}, '')
    }
  }

  const toggleDropdown = (isOpen: boolean) => {
    setShowDropdown(isOpen)
  }

  const handleUpgradeability = () => {
    // @ts-ignore
    workspaceCreateInput.current.value = `${workspaceCreateTemplateInput.current.value + '_upgradeable'}_${Date.now()}`
  }

  const toggleBranches = (isOpen: boolean) => {
    setShowBranches(isOpen)
  }

  const handleBranchFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const branchFilter = e.target.value

    setBranchFilter(branchFilter)
  }

  const showAllBranches = () => {
    global.dispatchShowAllBranches()
  }

  const switchToBranch = async (branch: { remote: string, name: string }) => {
    try {
      if (branch.remote) {
        await global.dispatchCheckoutRemoteBranch(branch.name, branch.remote)
        _paq.push(['trackEvent', 'Workspace', 'GIT', 'checkout_remote_branch'])
      } else {
        await global.dispatchSwitchToBranch(branch.name)
        _paq.push(['trackEvent', 'Workspace', 'GIT', 'switch_to_exisiting_branch'])
      }
    } catch (e) {
      console.error(e)
      global.modal('Checkout Git Branch', e.message, 'OK', () => {})
    }
  }

  const switchToNewBranch = async () => {
    try {
      await global.dispatchCreateNewBranch(branchFilter)
      _paq.push(['trackEvent', 'Workspace', 'GIT', 'switch_to_new_branch'])
    } catch (e) {
      global.modal('Checkout Git Branch', e.message, 'OK', () => {})
    }
  }

  const createModalMessage = () => {
    return (
      <>
        <label id="selectWsTemplate" className="form-check-label" style={{fontWeight: "bolder"}}><FormattedMessage id='filePanel.workspace.chooseTemplate' /></label>
        <select name="wstemplate" className="mb-3 form-control custom-select" id="wstemplate" defaultValue='remixDefault' ref={workspaceCreateTemplateInput} onChange={updateWsName}>
          <optgroup style={{fontSize: "medium"}} label="General">
            <option style={{fontSize: "small"}} value='remixDefault'>Default</option>
            <option style={{fontSize: "small"}} value='blank'>Blank</option>
          </optgroup>
          <optgroup style={{fontSize: "medium"}} label="OpenZeppelin">
            <option style={{fontSize: "small"}} value='ozerc20'>ERC20</option>
            <option style={{fontSize: "small"}} value='ozerc721'>ERC721</option>
            <option style={{fontSize: "small"}} value='ozerc1155'>ERC1155</option>
          </optgroup>
          <optgroup style={{fontSize: "medium"}} label="0xProject">
            <option style={{fontSize: "small"}} value='zeroxErc20'>ERC20</option>
          </optgroup>
          <optgroup style={{fontSize: "medium"}} label="GnosisSafe">
            <option style={{fontSize: "small"}} value='gnosisSafeMultisig'>MultiSig Wallet</option>
          </optgroup>
        </select>

        <div id="ozcustomization" data-id="ozCustomization" ref={displayOzCustomRef} style={{display: 'none'}} className="mb-2">
          <label className="form-check-label d-block mb-2" style={{fontWeight: "bolder"}}>Customize template</label>

          <label id="wsName" className="form-check-label d-block mb-1">Features</label>
          <div className="mb-2">
            <div className="d-flex ml-2 custom-control custom-checkbox">
                <input className="custom-control-input" type="checkbox" name="feature" value="mintable" id="mintable" ref={mintableCheckboxRef} />
                <label className="form-check-label custom-control-label" htmlFor="mintable" data-id="featureTypeMintable" >Mintable</label>
            </div>
            <div className="d-flex ml-2 custom-control custom-checkbox">
                <input className="custom-control-input" type="checkbox" name="feature" value="burnable" id="burnable" ref={burnableCheckboxRef} />
                <label className="form-check-label custom-control-label" htmlFor="burnable" data-id="featureTypeBurnable" >Burnable</label>
            </div>
            <div className="d-flex ml-2 custom-control custom-checkbox">
                <input className="custom-control-input" type="checkbox" name="feature" value="pausable" id="pausable" ref={pausableCheckboxRef} />
                <label className="form-check-label custom-control-label" htmlFor="pausable" data-id="featureTypePausable" >Pausable</label>
            </div>
          </div>

          <label id="wsName" className="form-check-label d-block mb-1">Upgradeability</label>
          <div onChange={handleUpgradeability}>
            <div className="d-flex ml-2 custom-control custom-radio">
                <input className="custom-control-input" type="radio" name="upgradeability" value="transparent" id="transparent" ref={transparentRadioRef} />
                <label className="form-check-label custom-control-label" htmlFor="transparent" data-id="upgradeTypeTransparent" >Transparent</label>
            </div>
            <div className="d-flex ml-2 custom-control custom-radio">
                <input className="custom-control-input" type="radio" name="upgradeability" value="uups" id="uups" ref={uupsRadioRef} />
                <label className="form-check-label custom-control-label" htmlFor="uups" data-id="upgradeTypeUups" >UUPS</label>
            </div>
          </div>

        </div>

        <label id="wsName" className="form-check-label" style={{fontWeight: "bolder"}} >Workspace name</label>
        <input type="text" data-id="modalDialogCustomPromptTextCreate" defaultValue={`remixDefault_${Date.now()}`} ref={workspaceCreateInput} className="form-control" />

        <div className="d-flex py-2 align-items-center custom-control custom-checkbox">
          <input
            ref={initGitRepoRef}
            id="initGitRepository"
            data-id="initGitRepository"
            className="form-check-input custom-control-input"
            type="checkbox"
            disabled={!global.fs.gitConfig.username || !global.fs.gitConfig.email}
            onChange={() => {}}
          />
          <label
            htmlFor="initGitRepository"
            data-id="initGitRepositoryLabel"
            className="m-0 form-check-label custom-control-label udapp_checkboxAlign"
            title="Check option to initialize workspace as a new git repository"
          >
            Initialize workspace as a new git repository
          </label>
        </div>
        {!global.fs.gitConfig.username || !global.fs.gitConfig.email ?
          (
          <div className='text-warning'>Please add username and email to Remix GitHub Settings to use git features.</div>)
          :<></>
        }

      </>
    )
  }

  const renameModalMessage = () => {
    return (
      <>
        <input type="text" data-id="modalDialogCustomPromptTextRename" defaultValue={ currentWorkspace } ref={workspaceRenameInput} className="form-control" />
      </>
    )
  }

  const formatNameForReadonly = (name: string) => {
    return global.fs.readonly ? name + " (read-only)" : name
  }

  const cloneModalMessage = () => {
    return (
      <>
        <input
          type="text"
          data-id="modalDialogCustomPromptTextClone"
          placeholder={intl.formatMessage({ id: 'filePanel.workspace.enterGitUrl' })}
          ref={cloneUrlRef}
          className="form-control"
        />
      </>
    )
  }

  return (
    <div className='d-flex flex-column justify-content-between h-100'>
      <div className='remixui_container overflow-auto' style={{ maxHeight: selectedWorkspace && selectedWorkspace.isGitRepo ? '95%' : '100%' }}>
        <div className='d-flex flex-column w-100 mb-1 remixui_fileexplorer' data-id="remixUIWorkspaceExplorer" onClick={resetFocus}>
          <div>
            <header>
              <div className="mx-2 mb-2 d-flex flex-column">
                <div className="d-flex justify-content-between">
                  <span className="d-flex align-items-end">
                    <label className="pl-1 form-check-label" htmlFor="workspacesSelect" style={{wordBreak: 'keep-all'}}>
                      <FormattedMessage id='filePanel.workspace' />
                    </label>
                  </span>
                  {currentWorkspace !== LOCALHOST ? (<span className="remixui_menu remixui_topmenu d-flex justify-content-between align-items-end w-75">
                    <CustomTooltip
                      placement="top-end"
                      tooltipId="createWorkspaceTooltip"
                      tooltipClasses="text-nowrap"
                      tooltipText={<FormattedMessage id='filePanel.create' />}
                    >
                      <span
                        hidden={currentWorkspace === LOCALHOST}
                        id='workspaceCreate'
                        data-id='workspaceCreate'
                        onClick={(e) => {
                          e.stopPropagation()
                          createWorkspace()
                          _paq.push(['trackEvent', 'fileExplorer', 'workspaceMenu', 'workspaceCreate'])
                        }}
                        style={{ fontSize: 'large' }}
                        className='far fa-plus remixui_menuicon d-flex align-self-end'
                        >
                      </span>
                    </CustomTooltip>
                    <Dropdown id="workspacesMenuDropdown" data-id="workspacesMenuDropdown" onToggle={() => hideIconsMenu(!showIconsMenu)} show={showIconsMenu}>
                      <Dropdown.Toggle
                        as={CustomIconsToggle}
                        onClick={() => {
                          hideIconsMenu(!showIconsMenu)
                        }}
                        icon={'fas fa-bars'}
                      ></Dropdown.Toggle>
                      <Dropdown.Menu as={CustomMenu} data-id="wsdropdownMenu" className='custom-dropdown-items remixui_menuwidth' rootCloseEvent="click">
                        <HamburgerMenu
                          createWorkspace={createWorkspace}
                          deleteCurrentWorkspace={deleteCurrentWorkspace}
                          renameCurrentWorkspace={renameCurrentWorkspace}
                          cloneGitRepository={cloneGitRepository}
                          downloadWorkspaces={downloadWorkspaces}
                          restoreBackup={restoreBackup}
                          hideIconsMenu={hideIconsMenu}
                          addGithubAction={addGithubAction}
                          addSlitherGithubAction={addSlitherGithubAction}
                          addTsSolTestGithubAction={addTsSolTestGithubAction}
                          showIconsMenu={showIconsMenu}
                          hideWorkspaceOptions={ currentWorkspace === LOCALHOST }
                          hideLocalhostOptions={ currentWorkspace === NO_WORKSPACE }
                          />
                      </Dropdown.Menu>
                    </Dropdown>
                  </span>) : null}
                </div>

                <Dropdown id="workspacesSelect" data-id="workspacesSelect" onToggle={toggleDropdown} show={showDropdown}>
                  <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components" className="btn btn-light btn-block w-100 d-inline-block border border-dark form-control mt-1" icon={selectedWorkspace && selectedWorkspace.isGitRepo && !(currentWorkspace === LOCALHOST) ? 'far fa-code-branch' : null}>
                    { selectedWorkspace ? selectedWorkspace.name : currentWorkspace === LOCALHOST ? formatNameForReadonly("localhost") : NO_WORKSPACE }
                  </Dropdown.Toggle>

                  <Dropdown.Menu as={CustomMenu} className='w-100 custom-dropdown-items' data-id="custom-dropdown-items">
                    <Dropdown.Item
                      onClick={() => {
                        createWorkspace()
                      }}
                    >
                      {
                        <span className="pl-3"> - create a new workspace - </span>
                      }
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => { switchWorkspace(LOCALHOST) }}>{currentWorkspace === LOCALHOST ? <span>&#10003; localhost </span> : <span className="pl-3"> { LOCALHOST } </span>}</Dropdown.Item>
                    {
                      global.fs.browser.workspaces.map(({ name, isGitRepo }, index) => (
                        <Dropdown.Item
                          key={index}
                          onClick={() => {
                            switchWorkspace(name)
                          }}
                          data-id={`dropdown-item-${name}`}
                        >
                          { isGitRepo ?
                            <div className='d-flex justify-content-between'>
                              <span>{ currentWorkspace === name ? <span>&#10003; { name } </span> : <span className="pl-3">{ name }</span> }</span>
                              <i className='fas fa-code-branch pt-1'></i>
                            </div> :
                            <span>{ currentWorkspace === name ? <span>&#10003; { name } </span> : <span className="pl-3">{ name }</span> }</span>
                          }
                          </Dropdown.Item>
                        ))
                      }
                      { ((global.fs.browser.workspaces.length <= 0) || currentWorkspace === NO_WORKSPACE) && <Dropdown.Item onClick={() => { switchWorkspace(NO_WORKSPACE) }}>{ <span className="pl-3">NO_WORKSPACE</span> }</Dropdown.Item> }
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </header>
            </div>
            <div className='h-100 mb-4 pb-4 remixui_fileExplorerTree' onFocus={() => { toggleDropdown(false) }}>
            <div className='h-100'>
            { (global.fs.browser.isRequestingWorkspace || global.fs.browser.isRequestingCloning) && <div className="text-center py-5"><i className="fas fa-spinner fa-pulse fa-2x"></i></div>}
            { !(global.fs.browser.isRequestingWorkspace || global.fs.browser.isRequestingCloning) &&
              (global.fs.mode === 'browser') && (currentWorkspace !== NO_WORKSPACE) &&
              <div className='h-100 remixui_treeview' data-id='filePanelFileExplorerTree'>
                <FileExplorer
                  name={currentWorkspace}
                  menuItems={['createNewFile', 'createNewFolder', 'publishToGist', canUpload ? 'uploadFile' : '']}
                  contextMenuItems={global.fs.browser.contextMenu.registeredMenuItems}
                  removedContextMenuItems={global.fs.browser.contextMenu.removedMenuItems}
                  files={global.fs.browser.files}
                  fileState={global.fs.browser.fileState}
                  plugin={plugin}
                  expandPath={global.fs.browser.expandPath}
                  focusEdit={global.fs.focusEdit}
                  focusElement={global.fs.focusElement}
                  hideIconsMenu={hideIconsMenu}
                  showIconsMenu={showIconsMenu}
                  dispatchCreateNewFile={global.dispatchCreateNewFile}
                  modal={global.modal}
                  dispatchCreateNewFolder={global.dispatchCreateNewFolder}
                  readonly={global.fs.readonly}
                  toast={global.toast}
                  dispatchDeletePath={global.dispatchDeletePath}
                  dispatchRenamePath={global.dispatchRenamePath}
                  dispatchUploadFile={global.dispatchUploadFile}
                  dispatchCopyFile={global.dispatchCopyFile}
                  dispatchCopyFolder={global.dispatchCopyFolder}
                  dispatchPublishToGist={global.dispatchPublishToGist}
                  dispatchRunScript={global.dispatchRunScript}
                  dispatchEmitContextMenuEvent={global.dispatchEmitContextMenuEvent}
                  dispatchHandleClickFile={global.dispatchHandleClickFile}
                  dispatchSetFocusElement={global.dispatchSetFocusElement}
                  dispatchFetchDirectory={global.dispatchFetchDirectory}
                  dispatchRemoveInputField={global.dispatchRemoveInputField}
                  dispatchAddInputField={global.dispatchAddInputField}
                  dispatchHandleExpandPath={global.dispatchHandleExpandPath}
                  dispatchMoveFile={global.dispatchMoveFile}
                  dispatchMoveFolder={global.dispatchMoveFolder}
                  />
              </div>
            }
            { global.fs.localhost.isRequestingLocalhost && <div className="text-center py-5"><i className="fas fa-spinner fa-pulse fa-2x"></i></div> }
            { (global.fs.mode === 'localhost' && global.fs.localhost.isSuccessfulLocalhost) &&
              <div className='h-100 filesystemexplorer pb-4 mb-4  remixui_treeview'>
                <FileExplorer
                  name='localhost'
                  menuItems={['createNewFile', 'createNewFolder']}
                  contextMenuItems={global.fs.localhost.contextMenu.registeredMenuItems}
                  removedContextMenuItems={global.fs.localhost.contextMenu.removedMenuItems}
                  files={global.fs.localhost.files}
                  fileState={[]}
                  plugin={plugin}
                  expandPath={global.fs.localhost.expandPath}
                  focusEdit={global.fs.focusEdit}
                  focusElement={global.fs.focusElement}
                  hideIconsMenu={hideIconsMenu}
                  showIconsMenu={showIconsMenu}
                  dispatchCreateNewFile={global.dispatchCreateNewFile}
                  modal={global.modal}
                  dispatchCreateNewFolder={global.dispatchCreateNewFolder}
                  readonly={global.fs.readonly}
                  toast={global.toast}
                  dispatchDeletePath={global.dispatchDeletePath}
                  dispatchRenamePath={global.dispatchRenamePath}
                  dispatchUploadFile={global.dispatchUploadFile}
                  dispatchCopyFile={global.dispatchCopyFile}
                  dispatchCopyFolder={global.dispatchCopyFolder}
                  dispatchPublishToGist={global.dispatchPublishToGist}
                  dispatchRunScript={global.dispatchRunScript}
                  dispatchEmitContextMenuEvent={global.dispatchEmitContextMenuEvent}
                  dispatchHandleClickFile={global.dispatchHandleClickFile}
                  dispatchSetFocusElement={global.dispatchSetFocusElement}
                  dispatchFetchDirectory={global.dispatchFetchDirectory}
                  dispatchRemoveInputField={global.dispatchRemoveInputField}
                  dispatchAddInputField={global.dispatchAddInputField}
                  dispatchHandleExpandPath={global.dispatchHandleExpandPath}
                  dispatchMoveFile={global.dispatchMoveFile}
                  dispatchMoveFolder={global.dispatchMoveFolder}
                />
              </div>
            }
            </div>
          </div>
        </div>
        </div>
        {
          selectedWorkspace &&
          <div className={`bg-light border-top ${selectedWorkspace.isGitRepo && currentBranch ? 'd-block' : 'd-none'}`} data-id="workspaceGitPanel">
            <div className='d-flex justify-space-between p-1'>
              <div className="mr-auto text-uppercase text-dark pt-2 pl-2">GIT</div>
              <div className="pt-1 mr-1" data-id="workspaceGitBranchesDropdown">
                <Dropdown style={{ height: 30, minWidth: 80 }} onToggle={toggleBranches} show={showBranches} drop={'up'}>
                  <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components" className="btn btn-light btn-block w-100 d-inline-block border border-dark form-control h-100 p-0 pl-2 pr-2 text-dark" icon={null}>
                    { global.fs.browser.isRequestingCloning ? <i className="fad fa-spinner fa-spin"></i> : currentBranch || '-none-' }
                  </Dropdown.Toggle>

                  <Dropdown.Menu as={CustomMenu} className='custom-dropdown-items branches-dropdown'>
                    <div data-id="custom-dropdown-menu">
                      <div className='d-flex text-dark' style={{ fontSize: 14, fontWeight: 'bold' }}>
                        <span className='mt-2 ml-2 mr-auto'>Switch branches</span>
                        <div className='pt-2 pr-2' onClick={() => { toggleBranches(false) }}><i className='fa fa-close'></i>
                        </div>
                      </div>
                      <div className='border-top py-2'>
                        <input
                          className='form-control border checkout-input bg-light'
                          placeholder='Find or create a branch.'
                          style={{ minWidth: 225 }}
                          onChange={handleBranchFilterChange}
                          data-id='workspaceGitInput'
                        />
                      </div>
                      <div className='border-top' style={{ maxHeight: 120, overflowY: 'scroll' }} data-id="custom-dropdown-items">
                        {
                          filteredBranches.length > 0 ? filteredBranches.map((branch, index) => {
                            return (
                              <Dropdown.Item key={index} onClick={() => { switchToBranch(branch) }} title={branch.remote ? 'Checkout new branch from remote branch' : 'Checkout to local branch'}>
                                <div data-id={`workspaceGit-${ branch.remote ? `${branch.remote}/${branch.name}` : branch.name }`}>
                                  {
                                    (currentBranch === branch.name) && !branch.remote ?
                                    <span>&#10003; <i className='far fa-code-branch'></i><span className='pl-1'>{ branch.name }</span></span> :
                                    <span className='pl-3'><i className={`far ${ branch.remote ? 'fa-cloud' : 'fa-code-branch'}`}></i><span className='pl-1'>{ branch.remote ? `${branch.remote}/${branch.name}` : branch.name }</span></span>
                                  }
                                </div>
                              </Dropdown.Item>
                            )
                          }) :
                          <Dropdown.Item onClick={switchToNewBranch}>
                            <div className="pl-1 pr-1" data-id="workspaceGitCreateNewBranch">
                              <i className="fas fa-code-branch pr-2"></i><span>Create branch: { branchFilter } from '{currentBranch}'</span>
                            </div>
                          </Dropdown.Item>
                        }
                      </div>
                      {
                        (selectedWorkspace.branches || []).length > 4 && <div className='text-center border-top pt-2'><label style={{ fontSize: 12, cursor: 'pointer' }} onClick={showAllBranches}>View all branches</label></div>
                      }
                    </div>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
          </div>
        }
    </div>
  )
}

export default Workspace
