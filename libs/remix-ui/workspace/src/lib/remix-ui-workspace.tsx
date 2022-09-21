import React, { useState, useEffect, useRef, useContext } from 'react' // eslint-disable-line
import { Dropdown } from 'react-bootstrap'
import { CustomMenu, CustomToggle } from '@remix-ui/helper'
import { FileExplorer } from './components/file-explorer' // eslint-disable-line
import { FileSystemContext } from './contexts'
import './css/remix-ui-workspace.css'
import { ROOT_PATH } from './utils/constants'
const _paq = window._paq = window._paq || []

const canUpload = window.File || window.FileReader || window.FileList || window.Blob

export function Workspace () {
  const LOCALHOST = ' - connect to localhost - '
  const NO_WORKSPACE = ' - none - '
  const [currentWorkspace, setCurrentWorkspace] = useState<string>(NO_WORKSPACE)
  const [selectedWorkspace, setSelectedWorkspace] = useState<{ name: string, isGitRepo: boolean}>(null)
  const [showDropdown, setShowDropdown] = useState<boolean>(false)
  const displayOzCustomRef = useRef<HTMLDivElement>()
  const ozFeatures = useRef({mintable: false, burnable: false, pausable: false})
  const upgradeable = useRef()
  const global = useContext(FileSystemContext)
  const workspaceRenameInput = useRef()
  const workspaceCreateInput = useRef()
  const workspaceCreateTemplateInput = useRef()
  const cloneUrlRef = useRef<HTMLInputElement>()
  const initGitRepoRef = useRef<HTMLInputElement>()

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
    global.modal('Rename Current Workspace', renameModalMessage(), 'OK', onFinishRenameWorkspace, '')
  }

  const createWorkspace = () => {
    global.modal('Create Workspace', createModalMessage(), 'OK', onFinishCreateWorkspace, '')
  }

  const deleteCurrentWorkspace = () => {
    global.modal('Delete Current Workspace', 'Are you sure to delete the current workspace?', 'OK', onFinishDeleteWorkspace, '')
  }

  const cloneGitRepository = () => {
    global.modal('Clone Git Repository', cloneModalMessage(), 'OK', handleTypingUrl, '')
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
    const features = ozFeatures.current
    const opts = {
      upgradeable: upgradeable.current,
      features
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
      upgradeable.current = undefined
      ozFeatures.current = {mintable: false, burnable: false, pausable: false}
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

  const handleUpgradeability = (e) => {
    // @ts-ignore
    upgradeable.current = e.target.value
    // @ts-ignore
    workspaceCreateInput.current.value = `${workspaceCreateTemplateInput.current.value + '_upgradeable'}_${Date.now()}`
  }

  const handleFeatures = (e) => {
    // @ts-ignore
    ozFeatures.current[e.target.value] = e.target.checked
  }

  const createModalMessage = () => {
    return (
      <>
        <label id="selectWsTemplate" className="form-check-label" style={{fontWeight: "bolder"}}>Choose a template</label>
        <select name="wstemplate" className="mb-3 form-control custom-select" id="wstemplate" defaultValue='remixDefault' ref={workspaceCreateTemplateInput} onChange={updateWsName}>
          <optgroup style={{fontSize: "medium"}} label="General">
            <option style={{fontSize: "small"}} value='remixDefault'>Default</option>
            <option style={{fontSize: "small"}} value='blank'>Blank</option>
          </optgroup>
          <optgroup style={{fontSize: "medium"}} label="OpenZepplin">
            <option style={{fontSize: "small"}} value='ozerc20'>ERC20</option>
            <option style={{fontSize: "small"}} value='ozerc721'>ERC721</option>
            <option style={{fontSize: "small"}} value='ozerc1155'>ERC1155</option>
          </optgroup>
          <optgroup style={{fontSize: "medium"}} label="0xProject">
            <option style={{fontSize: "small"}} value='zeroxErc20'>ERC20</option>
          </optgroup>
        </select>

        <div id="ozcustomization" data-id="ozCustomization" ref={displayOzCustomRef} style={{display: 'none'}} className="mb-2">
          <label className="form-check-label d-block mb-2" style={{fontWeight: "bolder"}}>Customize template</label>

          <label id="wsName" className="form-check-label d-block mb-1">Features</label>
          <div className="mb-2" onChange={(e) => handleFeatures(e)}>
            <div className="d-flex ml-2 custom-control custom-checkbox">
                <input className="custom-control-input" type="checkbox" name="feature" value="mintable" id="mintable" />
                <label className="form-check-label custom-control-label" htmlFor="mintable" data-id="featureTypeMintable" >Mintable</label>
            </div>
            <div className="d-flex ml-2 custom-control custom-checkbox">
                <input className="custom-control-input" type="checkbox" name="feature" value="burnable" id="burnable" />
                <label className="form-check-label custom-control-label" htmlFor="burnable" data-id="featureTypeBurnable" >Burnable</label>
            </div>
            <div className="d-flex ml-2 custom-control custom-checkbox">
                <input className="custom-control-input" type="checkbox" name="feature" value="pausable" id="pausable" />
                <label className="form-check-label custom-control-label" htmlFor="pausable" data-id="featureTypePausable" >Pausable</label>
            </div>
          </div>

          <label id="wsName" className="form-check-label d-block mb-1">Upgradeability</label>
          <div onChange={(e) => handleUpgradeability(e)}>
            <div className="d-flex ml-2 custom-control custom-radio">
                <input className="custom-control-input" type="radio" name="upgradeability" value="transparent" id="transparent" />
                <label className="form-check-label custom-control-label" htmlFor="transparent" data-id="upgradeTypeTransparent" >Transparent</label>
            </div>
            <div className="d-flex ml-2 custom-control custom-radio">
                <input className="custom-control-input" type="radio" name="upgradeability" value="uups" id="uups" />
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

  const cloneModalMessage = () => {
    return (
      <>
        <input type="text" data-id="modalDialogCustomPromptTextClone" placeholder='Enter git repository url' ref={cloneUrlRef} className="form-control" />
      </>
    )
  }

  return (
    <div className='remixui_container'>
      <div className='d-flex flex-column w-100 remixui_fileexplorer' data-id="remixUIWorkspaceExplorer" onClick={resetFocus}>
        <div>
          <header>
            <div className="mx-2 mb-2">
              <label className="pl-1 form-check-label" htmlFor="workspacesSelect">
                Workspaces
              </label>
              <span className="remixui_menu">
                <span
                  hidden={currentWorkspace === LOCALHOST}
                  id='workspaceCreate'
                  data-id='workspaceCreate'
                  onClick={(e) => {
                    e.stopPropagation()
                    createWorkspace()
                    _paq.push(['trackEvent', 'fileExplorer', 'workspaceMenu', 'workspaceCreate'])
                  }}
                  className='far fa-plus-square remixui_menuicon'
                  title='Create'>
                </span>
                <span
                  hidden={currentWorkspace === LOCALHOST || currentWorkspace === NO_WORKSPACE}
                  id='workspaceRename'
                  data-id='workspaceRename'
                  onClick={(e) => {
                    e.stopPropagation()
                    renameCurrentWorkspace()
                    _paq.push(['trackEvent', 'fileExplorer', 'workspaceMenu', 'workspaceRename'])
                  }}
                  className='far fa-edit remixui_menuicon'
                  title='Rename'>
                </span>
                <span
                  hidden={currentWorkspace === LOCALHOST || currentWorkspace === NO_WORKSPACE}
                  id='workspaceDelete'
                  data-id='workspaceDelete'
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteCurrentWorkspace()
                    _paq.push(['trackEvent', 'fileExplorer', 'workspaceMenu', 'workspaceDelete'])
                  }}
                  className='far fa-trash remixui_menuicon'
                  title='Delete'>
                </span>
                <span
                  hidden={currentWorkspace === LOCALHOST || currentWorkspace === NO_WORKSPACE}
                  id='workspacesDownload'
                  data-id='workspacesDownload'
                  onClick={(e) => {
                    e.stopPropagation()
                    downloadWorkspaces()
                    _paq.push(['trackEvent', 'fileExplorer', 'workspaceMenu', 'workspacesDownload'])
                  }}
                  className='far fa-download remixui_menuicon'
                  title='Download Workspaces'>
                </span>
                <span
                  hidden={currentWorkspace === LOCALHOST}
                  id='workspacesRestore'
                  data-id='workspacesRestore'
                  onClick={(e) => {
                    e.stopPropagation()
                    restoreBackup()
                    _paq.push(['trackEvent', 'fileExplorer', 'workspaceMenu', 'workspacesRestore'])
                  }}
                  className='far fa-upload remixui_menuicon'
                  title='Restore Workspaces Backup'>
                </span>
                <span
                  hidden={currentWorkspace === LOCALHOST}
                  id='cloneGitRepository'
                  data-id='cloneGitRepository'
                  onClick={(e) => {
                    e.stopPropagation()
                    cloneGitRepository()
                    _paq.push(['trackEvent', 'fileExplorer', 'workspaceMenu', 'cloneGitRepository'])
                  }}
                  className='far fa-clone remixui_menuicon'
                  title='Clone Git Repository'>
                </span>
              </span>
              <Dropdown id="workspacesSelect" data-id="workspacesSelect" onToggle={toggleDropdown} show={showDropdown}>
                <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components" className="btn btn-light btn-block w-100 d-inline-block border border-dark form-control" icon={selectedWorkspace && selectedWorkspace.isGitRepo && !(currentWorkspace === LOCALHOST) ? 'far fa-code-branch' : null}>
                  { selectedWorkspace ? selectedWorkspace.name : currentWorkspace === LOCALHOST ? 'localhost' : NO_WORKSPACE }
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
        <div className='h-100 remixui_fileExplorerTree' onFocus={() => { toggleDropdown(false) }}>
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
                expandPath={global.fs.browser.expandPath}
                focusEdit={global.fs.focusEdit}
                focusElement={global.fs.focusElement}
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
            <div className='h-100 filesystemexplorer remixui_treeview'>
              <FileExplorer
                name='localhost'
                menuItems={['createNewFile', 'createNewFolder']}
                contextMenuItems={global.fs.localhost.contextMenu.registeredMenuItems}
                removedContextMenuItems={global.fs.localhost.contextMenu.removedMenuItems}
                files={global.fs.localhost.files}
                fileState={[]}
                expandPath={global.fs.localhost.expandPath}
                focusEdit={global.fs.focusEdit}
                focusElement={global.fs.focusElement}
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
  )
}

export default Workspace
