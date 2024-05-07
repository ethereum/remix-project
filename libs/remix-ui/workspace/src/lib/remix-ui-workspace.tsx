import React, {useState, useEffect, useRef, useContext, ChangeEvent} from 'react' // eslint-disable-line
import {FormattedMessage, useIntl} from 'react-intl'
import {Dropdown} from 'react-bootstrap'
import {CustomIconsToggle, CustomMenu, CustomToggle, CustomTooltip, extractNameFromKey, extractParentFromKey} from '@remix-ui/helper'
import {CopyToClipboard} from '@remix-ui/clipboard'
import {FileExplorer} from './components/file-explorer' // eslint-disable-line
import {FileSystemContext} from './contexts'
import './css/remix-ui-workspace.css'
import {ROOT_PATH, TEMPLATE_NAMES} from './utils/constants'
import {HamburgerMenu} from './components/workspace-hamburger'

import {MenuItems, WorkSpaceState, WorkspaceMetadata} from './types'
import {contextMenuActions} from './utils'
import FileExplorerContextMenu from './components/file-explorer-context-menu'
import { customAction } from '@remixproject/plugin-api'
import { appPlatformTypes, platformContext } from '@remix-ui/app'
import { ElectronMenu } from './components/electron-menu'
import { ElectronWorkspaceName } from './components/electron-workspace-name'


const _paq = (window._paq = window._paq || [])

const canUpload = window.File || window.FileReader || window.FileList || window.Blob

export function Workspace() {
  const platform = useContext(platformContext)
  const LOCALHOST = ' - connect to localhost - '
  const NO_WORKSPACE = ' - none - '
  const [currentWorkspace, setCurrentWorkspace] = useState<string>(NO_WORKSPACE)
  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceMetadata>(null)
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
  const filteredBranches = selectedWorkspace ? (selectedWorkspace.branches || []).filter((branch) => branch.name.includes(branchFilter) && branch.name !== 'HEAD').slice(0, 20) : []
  const currentBranch = selectedWorkspace ? selectedWorkspace.currentBranch : null

  const [canPaste, setCanPaste] = useState(false)

  const [state, setState] = useState<WorkSpaceState>({
    ctrlKey: false,
    newFileName: '',
    actions: contextMenuActions,
    focusContext: {
      element: null,
      x: null,
      y: null,
      type: ''
    },
    focusEdit: {
      element: null,
      type: '',
      isNew: false,
      lastEdit: ''
    },
    mouseOverElement: null,
    showContextMenu: false,
    reservedKeywords: [ROOT_PATH],
    copyElement: [],
    dragStatus: false
  })

  useEffect(() => {
    if (canPaste) {
      addMenuItems([
        {
          id: 'paste',
          name: 'Paste',
          type: ['folder', 'file', 'workspace'],
          path: [],
          extension: [],
          pattern: [],
          multiselect: false,
          label: '',
          group: 4
        }
      ])
    } else {
      removeMenuItems([
        {
          id: 'paste',
          name: 'Paste',
          type: ['folder', 'file', 'workspace'],
          path: [],
          extension: [],
          pattern: [],
          multiselect: false,
          label: '',
          group: 4
        }
      ])
    }
  }, [canPaste])

  useEffect(() => {
    let workspaceName = localStorage.getItem('currentWorkspace')
    if (!workspaceName && global.fs.browser.workspaces.length) {
      workspaceName = global.fs.browser.workspaces[0].name
    }
    setCurrentWorkspace(workspaceName)
    resetFocus()

    // expose some UI to the plugin, perhaps not the best way to do it
    if (global.plugin) {
      global.plugin.loadTemplate = async () => {
        await global.plugin.call('menuicons', 'select', 'filePanel')
        createWorkspace()
      }
      global.plugin.clone = async () => {
        await global.plugin.call('menuicons', 'select', 'filePanel')
        cloneGitRepository()
      }
    }
  }, [])

  useEffect(() => {
    if (global.fs.mode === 'browser') {
      if (global.fs.browser.currentWorkspace) {
        setCurrentWorkspace(global.fs.browser.currentWorkspace)
        global.dispatchFetchWorkspaceDirectory(ROOT_PATH)
      } else {
        setCurrentWorkspace(NO_WORKSPACE)
      }
    } else if (global.fs.mode === 'localhost') {
      global.dispatchFetchWorkspaceDirectory(ROOT_PATH)
      setCurrentWorkspace(LOCALHOST)
    }
  }, [global.fs.browser.currentWorkspace, global.fs.localhost.sharedFolder, global.fs.mode])

  useEffect(() => {
    if (global.fs.browser.currentWorkspace && !global.fs.browser.workspaces.find(({name}) => name === global.fs.browser.currentWorkspace)) {
      if (global.fs.browser.workspaces.length > 0) {
        switchWorkspace(global.fs.browser.workspaces[global.fs.browser.workspaces.length - 1].name)
      } else {
        switchWorkspace(NO_WORKSPACE)
      }
    }
  }, [global.fs.browser.workspaces])

  useEffect(() => {
    const workspace = global.fs.browser.workspaces.find((workspace) => workspace.name === currentWorkspace)
    setSelectedWorkspace(workspace)
  }, [currentWorkspace])

  const renameCurrentWorkspace = () => {
    global.modal(
      intl.formatMessage({id: 'filePanel.workspace.rename'}),
      renameModalMessage(),
      intl.formatMessage({id: 'filePanel.save'}),
      onFinishRenameWorkspace,
      intl.formatMessage({id: 'filePanel.cancel'})
    )
  }

  const saveSampleCodeWorkspace = () => {
    const workspaceName = global.plugin.getAvailableWorkspaceName('code-sample')
    global.modal(
      intl.formatMessage({id: 'filePanel.workspace.save_workspace'}),
      renameModalMessage(workspaceName),
      intl.formatMessage({id: 'filePanel.save'}),
      onFinishRenameWorkspace,
      intl.formatMessage({id: 'filePanel.cancel'})
    )
  }

  const downloadCurrentWorkspace = () => {
    global.modal(
      intl.formatMessage({id: 'filePanel.workspace.download'}),
      intl.formatMessage({id: 'filePanel.workspace.downloadConfirm'}),
      intl.formatMessage({id: 'filePanel.ok'}),
      onFinishDownloadWorkspace,
      intl.formatMessage({id: 'filePanel.cancel'})
    )
  }
  const createWorkspace = () => {
    global.modal(
      intl.formatMessage({id: (platform !== appPlatformTypes.desktop)? 'filePanel.workspace.create': 'filePanel.workspace.create.desktop'}),
      createModalMessage(),
      intl.formatMessage({id: (platform !== appPlatformTypes.desktop)? 'filePanel.ok':'filePanel.selectFolder'}),
      onFinishCreateWorkspace,
      intl.formatMessage({id: 'filePanel.cancel'})
    )
  }

  const deleteCurrentWorkspace = () => {
    global.modal(
      intl.formatMessage({id: 'filePanel.workspace.delete'}),
      intl.formatMessage({id: 'filePanel.workspace.deleteConfirm'}),
      intl.formatMessage({id: 'filePanel.ok'}),
      onFinishDeleteWorkspace,
      intl.formatMessage({id: 'filePanel.cancel'})
    )
  }

  const deleteAllWorkspaces = () => {
    global.modal(
      intl.formatMessage({id: 'filePanel.workspace.deleteAll'}),
      <>
        <div className="d-flex flex-column">
          <span className="pb-1">{intl.formatMessage({id: 'filePanel.workspace.deleteAllConfirm1'})}</span>
          <span>{intl.formatMessage({id: 'filePanel.workspace.deleteAllConfirm2'})}</span>
        </div>
      </>,
      intl.formatMessage({id: 'filePanel.ok'}),
      onFinishDeleteAllWorkspaces,
      intl.formatMessage({id: 'filePanel.cancel'})
    )
  }

  const addMenuItems = (items: MenuItems) => {
    setState((prevState) => {
      // filter duplicate items
      const actions = items.filter(({name}) => prevState.actions.findIndex((action) => action.name === name) === -1)

      return {...prevState, actions: [...prevState.actions, ...actions]}
    })
  }

  const removeMenuItems = (items: MenuItems) => {
    setState((prevState) => {
      const actions = prevState.actions.filter(({id, name}) => items.findIndex((item) => id === item.id && name === item.name) === -1)
      return {...prevState, actions}
    })
  }

  const cloneGitRepository = () => {
    global.modal(
      intl.formatMessage({id: 'filePanel.workspace.clone'}),
      cloneModalMessage(),
      intl.formatMessage({id:  (platform !== appPlatformTypes.desktop)? 'filePanel.ok':'filePanel.selectFolder'}),
      handleTypingUrl,
      intl.formatMessage({id: 'filePanel.cancel'})
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

  const addHelperScripts = (script: string) => {
    global.dispatchCreateHelperScripts(script)
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
      global.modal(
        intl.formatMessage({id: 'filePanel.workspace.rename'}),
        e.message,
        intl.formatMessage({id: 'filePanel.ok'}),
        () => {},
        intl.formatMessage({id: 'filePanel.cancel'})
      )
      console.error(e)
    }
  }

  const onFinishDownloadWorkspace = async () => {
    try {
      await global.dispatchHandleDownloadWorkspace()
    } catch (e) {
      global.modal(
        intl.formatMessage({id: 'filePanel.workspace.download'}),
        e.message,
        intl.formatMessage({id: 'filePanel.ok'}),
        () => {},
        intl.formatMessage({id: 'filePanel.cancel'})
      )
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
      upgradeable: transparentRadioRef.current.checked ? transparentRadioRef.current.value : uupsRadioRef.current.checked ? uupsRadioRef.current.value : false
    }

    try {
      await global.dispatchCreateWorkspace(workspaceName, workspaceTemplateName, opts, initGitRepo)
    } catch (e) {
      global.modal(
        intl.formatMessage({id:  (platform !== appPlatformTypes.desktop)? 'filePanel.workspace.create': 'filePanel.workspace.create.desktop'}),
        e.message,
        intl.formatMessage({id: 'filePanel.ok'}),
        () => {},
        intl.formatMessage({id: 'filePanel.cancel'})
      )
      console.error(e)
    }
  }

  const onFinishDeleteWorkspace = async () => {
    try {
      await global.dispatchDeleteWorkspace(global.fs.browser.currentWorkspace)
    } catch (e) {
      global.modal(
        intl.formatMessage({id: 'filePanel.workspace.delete'}),
        e.message,
        intl.formatMessage({id: 'filePanel.ok'}),
        () => {},
        intl.formatMessage({id: 'filePanel.cancel'})
      )
      console.error(e)
    }
  }

  const onFinishDeleteAllWorkspaces = async () => {
    try {
      await global.dispatchDeleteAllWorkspaces()
    } catch (e) {
      global.modal(
        intl.formatMessage({id: 'filePanel.workspace.deleteAll'}),
        e.message,
        intl.formatMessage({id: 'filePanel.ok'}),
        () => {},
        intl.formatMessage({id: 'filePanel.cancel'})
      )
      console.error(e)
    }
  }

  const resetFocus = () => {
    global.dispatchSetFocusElement([{key: '', type: 'folder'}])
  }

  const switchWorkspace = async (name: string) => {
    try {
      await global.dispatchSwitchToWorkspace(name)
      global.dispatchHandleExpandPath([])
    } catch (e) {
      global.modal(
        intl.formatMessage({id: 'filePanel.workspace.switch'}),
        e.message,
        intl.formatMessage({id: 'filePanel.ok'}),
        () => {},
        intl.formatMessage({id: 'filePanel.cancel'})
      )
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
    let displayName = TEMPLATE_NAMES[(workspaceCreateTemplateInput.current && workspaceCreateTemplateInput.current.value) || 'remixDefault']
    displayName = global.plugin.getAvailableWorkspaceName(displayName)
    // @ts-ignore
    workspaceCreateInput.current.value = displayName
  }

  const handleTypingUrl = () => {
    const url = cloneUrlRef.current.value

    if (url) {
      global.dispatchCloneRepository(url)
    } else {
      global.modal(
        intl.formatMessage({id: 'filePanel.workspace.clone'}),
        intl.formatMessage({id: 'filePanel.workspace.cloneMessage'}),
        intl.formatMessage({id: (platform !== appPlatformTypes.desktop)? 'filePanel.ok':'filePanel.selectFolder'}),
        () => {},
        intl.formatMessage({id: 'filePanel.cancel'})
      )
    }
  }

  const handleCopyClick = (path: string, type: 'folder' | 'file' | 'workspace') => {
    setState((prevState) => {
      return {...prevState, copyElement: [{key: path, type}]}
    })
    setCanPaste(true)
    global.toast(intl.formatMessage({id: 'filePanel.copiedToClipboard'}, {path}))
  }

  const handlePasteClick = (dest: string, destType: string) => {
    dest = destType === 'file' ? extractParentFromKey(dest) || ROOT_PATH : dest
    state.copyElement.map(({key, type}) => {
      type === 'file' ? copyFile(key, dest) : copyFolder(key, dest)
    })
  }

  const downloadPath = async (path: string) => {
    try {
      global.dispatchDownloadPath(path)
    } catch (error) {
      global.modal(
        intl.formatMessage({id: 'filePanel.downloadFailed'}),
        intl.formatMessage({id: 'filePanel.copiedToClipboard'}, {error: typeof error === 'string' ? error : error.message}),
        intl.formatMessage({id: 'filePanel.close'}),
        async () => {}
      )
    }
  }

  const copyFile = (src: string, dest: string) => {
    try {
      global.dispatchCopyFile(src, dest)
    } catch (error) {
      global.modal(
        intl.formatMessage({id: 'filePanel.copyFileFailed'}),
        intl.formatMessage({id: 'filePanel.copyFileFailedMsg'}, {src}),
        intl.formatMessage({id: 'filePanel.close'}),
        async () => {}
      )
    }
  }

  const copyFolder = (src: string, dest: string) => {
    try {
      global.dispatchCopyFolder(src, dest)
    } catch (error) {
      global.modal(
        intl.formatMessage({id: 'filePanel.copyFolderFailed'}),
        intl.formatMessage({id: 'filePanel.copyFolderFailedMsg'}, {src}),
        intl.formatMessage({id: 'filePanel.close'}),
        async () => {}
      )
    }
  }

  const handleContextMenu = (pageX: number, pageY: number, path: string, content: string, type: string) => {
    if (!content) return
    setState((prevState) => {
      return {
        ...prevState,
        focusContext: {element: path, x: pageX, y: pageY, type},
        focusEdit: {...prevState.focusEdit, element: null, lastEdit: content},
        showContextMenu: prevState.focusEdit.element !== path
      }
    })
  }
  const getFocusedFolder = () => {
    const focusElement = global.fs.focusElement
    if (focusElement[0]) {
      if (focusElement[0].type === 'folder' && focusElement[0].key) return focusElement[0].key
      else if (focusElement[0].type === 'file' && focusElement[0].key) return extractParentFromKey(focusElement[0].key) ? extractParentFromKey(focusElement[0].key) : ROOT_PATH
      else return ROOT_PATH
    }
  }

  const uploadFile = (target) => {
    const parentFolder = getFocusedFolder()
    const expandPath = [...new Set([...global.fs.browser.expandPath, parentFolder])]

    global.dispatchHandleExpandPath(expandPath)
    global.dispatchUploadFile(target, parentFolder)
  }

  const uploadFolder = (target) => {
    const parentFolder = getFocusedFolder()
    const expandPath = [...new Set([...global.fs.browser.expandPath, parentFolder])]

    global.dispatchHandleExpandPath(expandPath)
    global.dispatchUploadFolder(target, parentFolder)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCopyFileNameClick = (path: string, _type: string) => {
    const fileName = extractNameFromKey(path)
    navigator.clipboard.writeText(fileName)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCopyShareURLClick = (path: string, _type: string) => {
    global.dispatchCopyShareURL(path)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCopyFilePathClick = (path: string, _type: string) => {
    navigator.clipboard.writeText(path)
  }

  const hideContextMenu = () => {
    setState((prevState) => {
      return {
        ...prevState,
        focusContext: {element: null, x: 0, y: 0, type: ''},
        showContextMenu: false
      }
    })
  }

  const runScript = async (path: string) => {
    try {
      global.dispatchRunScript(path)
    } catch (error) {
      global.toast(intl.formatMessage({id: 'filePanel.runScriptFailed'}))
    }
  }

  const emitContextMenuEvent = (cmd: customAction) => {
    try {
      global.dispatchEmitContextMenuEvent(cmd)
    } catch (error) {
      global.toast(error)
    }
  }

  const pushChangesToGist = (path?: string) => {
    global.modal(
      intl.formatMessage({id: 'filePanel.createPublicGist'}),
      intl.formatMessage({id: 'filePanel.createPublicGistMsg1'}),
      intl.formatMessage({id: 'filePanel.ok'}),
      () => toGist(path),
      intl.formatMessage({id: 'filePanel.cancel'}),
      () => {}
    )
  }

  const publishFolderToGist = (path?: string) => {
    global.modal(
      intl.formatMessage({id: 'filePanel.createPublicGist'}),
      intl.formatMessage({id: 'filePanel.createPublicGistMsg2'}, {path}),
      intl.formatMessage({id: 'filePanel.ok'}),
      () => toGist(path),
      intl.formatMessage({id: 'filePanel.cancel'}),
      () => {}
    )
  }

  const publishFileToGist = (path?: string) => {
    global.modal(
      intl.formatMessage({id: 'filePanel.createPublicGist'}),
      intl.formatMessage({id: 'filePanel.createPublicGistMsg3'}, {path}),
      intl.formatMessage({id: 'filePanel.ok'}),
      () => toGist(path),
      intl.formatMessage({id: 'filePanel.cancel'}),
      () => {}
    )
  }

  const deleteMessage = (path: string[]) => {
    return (
      <div>
        <div>
          <FormattedMessage id="filePanel.deleteMsg" /> {path.length > 1 ? <FormattedMessage id="filePanel.theseItems" /> : <FormattedMessage id="filePanel.thisItem" />}?
        </div>
        {path.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </div>
    )
  }

  const deletePath = async (path: string[]) => {
    if (global.fs.readonly) return global.toast('cannot delete file. ' + name + ' is a read only explorer')
    if (!Array.isArray(path)) path = [path]

    global.modal(
      path.length > 1 ? intl.formatMessage({id: 'filePanel.deleteItems'}) : intl.formatMessage({id: 'filePanel.deleteItem'}),
      deleteMessage(path),
      intl.formatMessage({id: 'filePanel.ok'}),
      () => {
        global.dispatchDeletePath(path)
      },
      intl.formatMessage({id: 'filePanel.cancel'}),
      () => {}
    )
  }

  const toGist = (path?: string) => {
    global.dispatchPublishToGist(path)
  }

  const editModeOn = (path: string, type: string, isNew = false) => {
    if (global.fs.readonly) return global.toast(intl.formatMessage({id: 'filePanel.globalToast'}))
    setState((prevState) => {
      return {
        ...prevState,
        focusEdit: {...prevState.focusEdit, element: path, isNew, type}
      }
    })
  }

  const dragStatus = (status: boolean) => {
    setState((prevState) => {
      return {
        ...prevState,
        dragStatus: status
      }
    })
  }

  const handleNewFileInput = async (parentFolder?: string) => {
    if (!parentFolder) parentFolder = getFocusedFolder()
    const expandPath = [...new Set([...global.fs.browser.expandPath, parentFolder])]

    await global.dispatchAddInputField(parentFolder, 'file')
    global.dispatchHandleExpandPath(expandPath)
    editModeOn(parentFolder + '/....blank', 'file', true)
  }

  const handleNewFolderInput = async (parentFolder?: string) => {
    if (!parentFolder) parentFolder = getFocusedFolder()
    else if (parentFolder.indexOf('.sol') !== -1 || parentFolder.indexOf('.js') !== -1) parentFolder = extractParentFromKey(parentFolder)
    const expandPath = [...new Set([...global.fs.browser.expandPath, parentFolder])]

    await global.dispatchAddInputField(parentFolder, 'folder')
    global.dispatchHandleExpandPath(expandPath)
    editModeOn(parentFolder + '/....blank', 'folder', true)
  }

  const toggleDropdown = (isOpen: boolean) => {
    setShowDropdown(isOpen)
  }

  const toggleBranches = (isOpen: boolean) => {
    setShowBranches(isOpen)
  }

  const updateSubModules = async () => {
    try {
      await global.dispatchUpdateGitSubmodules()
    } catch (e) {
      console.error(e)
    }
  }

  const handleBranchFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const branchFilter = e.target.value

    setBranchFilter(branchFilter)
  }

  const showAllBranches = () => {
    global.dispatchShowAllBranches()
  }

  const switchToBranch = async (branch: {remote: string; name: string}) => {
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
      global.modal(
        intl.formatMessage({id: 'filePanel.checkoutGitBranch'}),
        e.message,
        intl.formatMessage({id: 'filePanel.ok'}),
        () => {},
        intl.formatMessage({id: 'filePanel.cancel'})
      )
    }
  }

  const switchToNewBranch = async () => {
    try {
      await global.dispatchCreateNewBranch(branchFilter)
      _paq.push(['trackEvent', 'Workspace', 'GIT', 'switch_to_new_branch'])
    } catch (e) {
      global.modal(
        intl.formatMessage({id: 'filePanel.checkoutGitBranch'}),
        e.message,
        intl.formatMessage({id: 'filePanel.ok'}),
        () => {},
        intl.formatMessage({id: 'filePanel.cancel'})
      )
    }
  }

  const createModalMessage = () => {
    return (
      <>
        <label id="selectWsTemplate" className="form-check-label" style={{fontWeight: 'bolder'}}>
          <FormattedMessage id="filePanel.workspace.chooseTemplate" />
        </label>
        <select
          name="wstemplate"
          className="mb-3 form-control custom-select"
          id="wstemplate"
          defaultValue="remixDefault"
          ref={workspaceCreateTemplateInput}
          onChange={updateWsName}
        >
          <optgroup style={{fontSize: 'medium'}} label="General">
            <option style={{fontSize: 'small'}} value="remixDefault">
              {intl.formatMessage({id: 'filePanel.basic'})}
            </option>
            <option style={{fontSize: 'small'}} value="blank">
              {intl.formatMessage({id: 'filePanel.blank'})}
            </option>
          </optgroup>
          <optgroup style={{fontSize: 'medium'}} label="OpenZeppelin">
            <option style={{fontSize: 'small'}} value="ozerc20">
              ERC20
            </option>
            <option style={{fontSize: 'small'}} value="ozerc721">
              ERC721
            </option>
            <option style={{fontSize: 'small'}} value="ozerc1155">
              ERC1155
            </option>
          </optgroup>
          <optgroup style={{fontSize: 'medium'}} label="0xProject">
            <option style={{fontSize: 'small'}} value="zeroxErc20">
              ERC20
            </option>
          </optgroup>
          <optgroup style={{fontSize: 'medium'}} label="GnosisSafe">
            <option style={{fontSize: 'small'}} value="gnosisSafeMultisig">
              {intl.formatMessage({id: 'filePanel.multiSigWallet'})}
            </option>
          </optgroup>
          <optgroup style={{fontSize: 'medium'}} label="Circom ZKP">
            <option style={{fontSize: 'small'}} value="semaphore">
              {intl.formatMessage({id: 'filePanel.semaphore'})}
            </option>
            <option style={{fontSize: 'small'}} value="hashchecker">
              {intl.formatMessage({id: 'filePanel.hashchecker'})}
            </option>
            <option style={{fontSize: 'small'}} value="rln">
              {intl.formatMessage({id: 'filePanel.rln'})}
            </option>
          </optgroup>
          <optgroup style={{fontSize: 'medium'}} label="Uniswap V4">
            <option style={{fontSize: 'small'}} value="uniswapV4Template">
              {intl.formatMessage({id: 'filePanel.uniswapV4Template'})}
            </option>
            <option style={{fontSize: 'small'}} value="breakthroughLabsUniswapv4Hooks">
              {intl.formatMessage({id: 'filePanel.breakthroughLabsUniswapv4Hooks'})}
            </option>

            <option style={{fontSize: 'small'}} value="uniswapV4HookBookMultiSigSwapHook">
              {intl.formatMessage({id: 'filePanel.uniswapV4HookBookMultiSigSwapHook'})}
            </option>


          </optgroup>
        </select>
        <div id="ozcustomization" data-id="ozCustomization" ref={displayOzCustomRef} style={{display: 'none'}} className="mb-2">
          <label className="form-check-label d-block mb-2" style={{fontWeight: 'bolder'}}>
            <FormattedMessage id="filePanel.customizeTemplate" />
          </label>

          <label id="wsName" className="form-check-label d-block mb-1">
            <FormattedMessage id="filePanel.features" />
          </label>
          <div className="mb-2">
            <div className="d-flex ml-2 custom-control custom-checkbox">
              <input className="custom-control-input" type="checkbox" name="feature" value="mintable" id="mintable" ref={mintableCheckboxRef} />
              <label className="form-check-label custom-control-label" htmlFor="mintable" data-id="featureTypeMintable">
                <FormattedMessage id="filePanel.mintable" />
              </label>
            </div>
            <div className="d-flex ml-2 custom-control custom-checkbox">
              <input className="custom-control-input" type="checkbox" name="feature" value="burnable" id="burnable" ref={burnableCheckboxRef} />
              <label className="form-check-label custom-control-label" htmlFor="burnable" data-id="featureTypeBurnable">
                <FormattedMessage id="filePanel.burnable" />
              </label>
            </div>
            <div className="d-flex ml-2 custom-control custom-checkbox">
              <input className="custom-control-input" type="checkbox" name="feature" value="pausable" id="pausable" ref={pausableCheckboxRef} />
              <label className="form-check-label custom-control-label" htmlFor="pausable" data-id="featureTypePausable">
                <FormattedMessage id="filePanel.pausable" />
              </label>
            </div>
          </div>

          <label id="wsName" className="form-check-label d-block mb-1">
            <FormattedMessage id="filePanel.upgradeability" />
          </label>
          <div>
            <div className="d-flex ml-2 custom-control custom-radio">
              <input className="custom-control-input" type="radio" name="upgradeability" value="transparent" id="transparent" ref={transparentRadioRef} />
              <label className="form-check-label custom-control-label" htmlFor="transparent" data-id="upgradeTypeTransparent">
                <FormattedMessage id="filePanel.transparent" />
              </label>
            </div>
            <div className="d-flex ml-2 custom-control custom-radio">
              <input className="custom-control-input" type="radio" name="upgradeability" value="uups" id="uups" ref={uupsRadioRef} />
              <label className="form-check-label custom-control-label" htmlFor="uups" data-id="upgradeTypeUups">
                UUPS
              </label>
            </div>
          </div>
        </div>

        <label id="wsName" className="form-check-label" style={{fontWeight: 'bolder'}}>
          <FormattedMessage id="filePanel.workspaceName" />
        </label>
        <input
          type="text"
          data-id="modalDialogCustomPromptTextCreate"
          defaultValue={global.plugin.getAvailableWorkspaceName(TEMPLATE_NAMES['remixDefault'])}
          ref={workspaceCreateInput}
          className="form-control"
        />

        <div className="d-flex py-2 align-items-center custom-control custom-checkbox">
          <input
            ref={initGitRepoRef}
            id="initGitRepository"
            data-id="initGitRepository"
            className="form-check-input custom-control-input"
            type="checkbox"
            disabled={!global.fs.gitConfig.username || !global.fs.gitConfig.email}
            onChange={() => { }}
          />
          {(platform == appPlatformTypes.desktop)? <></>:
            <label
              htmlFor="initGitRepository"
              data-id="initGitRepositoryLabel"
              className="m-0 form-check-label custom-control-label udapp_checkboxAlign"
              title={intl.formatMessage({id: 'filePanel.initGitRepoTitle'})}
            >
              <FormattedMessage id="filePanel.initGitRepositoryLabel" />
            </label>}
        </div>
        {(!global.fs.gitConfig.username || !global.fs.gitConfig.email ) && !(platform == appPlatformTypes.desktop) ? (
          <div className="text-warning">
            <FormattedMessage id="filePanel.initGitRepositoryWarning" />
          </div>
        ) : (
          <></>
        )}
      </>
    )
  }

  const renameModalMessage = (workspaceName?: string) => {
    return (
      <div className='d-flex flex-column'>
        <label><FormattedMessage id="filePanel.name" /></label>
        <input type="text" data-id="modalDialogCustomPromptTextRename" defaultValue={workspaceName || currentWorkspace} ref={workspaceRenameInput} className="form-control" />
      </div>
    )
  }

  const formatNameForReadonly = (name: string) => {
    return global.fs.readonly ? name + ` (${intl.formatMessage({id: 'filePanel.readOnly'})})` : name
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
  return (
    <div className="d-flex flex-column justify-content-between h-100">
      <div
        className="remixui_container overflow-auto"
        style={{
          maxHeight: selectedWorkspace && selectedWorkspace.isGitRepo ? '95%' : '100%'
        }}
        onContextMenu={(e) => {
          e.preventDefault()
          handleContextMenu(e.pageX, e.pageY, ROOT_PATH, 'workspace', 'workspace')
        }}
      >
        <div className="d-flex flex-column w-100 remixui_fileexplorer" data-id="remixUIWorkspaceExplorer" onClick={resetFocus}>
          <div className='mb-1'>
            <header>
              <div className="mx-2 my-2 d-flex flex-column">
                <div className="mx-2 d-flex">
                  {currentWorkspace !== LOCALHOST ? (
                    <span className="remixui_topmenu d-flex">
                      <Dropdown id="workspacesMenuDropdown" data-id="workspacesMenuDropdown" onToggle={() => hideIconsMenu(!showIconsMenu)} show={showIconsMenu}>
                        <Dropdown.Toggle
                          as={CustomIconsToggle}
                          onClick={() => {
                            hideIconsMenu(!showIconsMenu)
                          }}
                          icon={'fas fa-bars'}
                        ></Dropdown.Toggle>
                        <Dropdown.Menu as={CustomMenu} data-id="wsdropdownMenu" className="custom-dropdown-items remixui_menuwidth" rootCloseEvent="click">
                          <HamburgerMenu
                            selectedWorkspace={selectedWorkspace}
                            createWorkspace={createWorkspace}
                            renameCurrentWorkspace={renameCurrentWorkspace}
                            downloadCurrentWorkspace={downloadCurrentWorkspace}
                            deleteCurrentWorkspace={deleteCurrentWorkspace}
                            deleteAllWorkspaces={deleteAllWorkspaces}
                            pushChangesToGist={pushChangesToGist}
                            cloneGitRepository={cloneGitRepository}
                            downloadWorkspaces={downloadWorkspaces}
                            restoreBackup={restoreBackup}
                            hideIconsMenu={hideIconsMenu}
                            addGithubAction={addGithubAction}
                            addSlitherGithubAction={addSlitherGithubAction}
                            addHelperScripts={addHelperScripts}
                            addTsSolTestGithubAction={addTsSolTestGithubAction}
                            showIconsMenu={showIconsMenu}
                            hideWorkspaceOptions={currentWorkspace === LOCALHOST}
                            hideLocalhostOptions={currentWorkspace === NO_WORKSPACE}
                            hideFileOperations={(platform == appPlatformTypes.desktop)? (global.fs.browser.currentLocalFilePath && global.fs.browser.currentLocalFilePath !== ''? false:true):false}
                          />
                        </Dropdown.Menu>
                      </Dropdown>
                    </span>
                  ) : null}
                  <span className="d-flex">
                    <label className="pl-2 form-check-label" style={{ wordBreak: 'keep-all' }}>
                      {(platform == appPlatformTypes.desktop) ? (
                        <ElectronWorkspaceName plugin={global.plugin} path={global.fs.browser.currentLocalFilePath} />
                      ) : <FormattedMessage id='filePanel.workspace' />}
                    </label>
                    {selectedWorkspace && selectedWorkspace.name === 'code-sample' && <CustomTooltip
                      placement="right"
                      tooltipId="saveCodeSample"
                      tooltipClasses="text-nowrap"
                      tooltipText={<FormattedMessage id="filePanel.saveCodeSample" />}
                    >
                      <i onClick={() => saveSampleCodeWorkspace()} className="far fa-exclamation-triangle text-warning ml-2 align-self-center" aria-hidden="true"></i>
                    </CustomTooltip>}

                    {selectedWorkspace && selectedWorkspace.isGist && <CopyToClipboard tip={'Copy Gist ID to clipboard'} getContent={() => selectedWorkspace.isGist} direction="bottom" icon="far fa-copy">
                      <i className="remixui_copyIcon ml-2 fab fa-github text-info" aria-hidden="true" style={{fontSize: '1.1rem', cursor: 'pointer'}} ></i>
                    </CopyToClipboard>
                    }

                  </span>
                </div>
                <div className='mx-2'>
                  {(platform !== appPlatformTypes.desktop) ? (
                    <Dropdown id="workspacesSelect" data-id="workspacesSelect" onToggle={toggleDropdown} show={showDropdown}>
                      <Dropdown.Toggle
                        as={CustomToggle}
                        id="dropdown-custom-components"
                        className="btn btn-light btn-block w-100 d-inline-block border border-dark form-control mt-1"
                        icon={selectedWorkspace && selectedWorkspace.isGitRepo && !(currentWorkspace === LOCALHOST) ? 'far fa-code-branch' : null}
                      >
                        {selectedWorkspace ? selectedWorkspace.name : currentWorkspace === LOCALHOST ? formatNameForReadonly('localhost') : NO_WORKSPACE}
                      </Dropdown.Toggle>

                      <Dropdown.Menu as={CustomMenu} className="w-100 custom-dropdown-items" data-id="custom-dropdown-items">
                        <Dropdown.Item
                          onClick={() => {
                            createWorkspace()
                          }}
                        >
                          {
                            <span className="pl-3">
                              {' '}
                            - <FormattedMessage id="filePanel.createNewWorkspace" /> -{' '}
                            </span>
                          }
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => {
                            switchWorkspace(LOCALHOST)
                          }}
                        >
                          {currentWorkspace === LOCALHOST ? (
                            <span>&#10003; localhost </span>
                          ) : (
                            <span className="pl-3">
                              {' '}
                              <FormattedMessage id="filePanel.connectToLocalhost" />{' '}
                            </span>
                          )}
                        </Dropdown.Item>
                        {global.fs.browser.workspaces.map(({name, isGitRepo}, index) => (
                          <Dropdown.Item
                            key={index}
                            onClick={() => {
                              switchWorkspace(name)
                            }}
                            data-id={`dropdown-item-${name}`}
                          >
                            {isGitRepo ? (
                              <div className="d-flex justify-content-between">
                                <span>{currentWorkspace === name ? <span>&#10003; {name} </span> : <span className="pl-3">{name}</span>}</span>
                                <i className="fas fa-code-branch pt-1"></i>
                              </div>
                            ) : (
                              <span>{currentWorkspace === name ? <span>&#10003; {name} </span> : <span className="pl-3">{name}</span>}</span>
                            )}
                          </Dropdown.Item>
                        ))}
                        {(global.fs.browser.workspaces.length <= 0 || currentWorkspace === NO_WORKSPACE) && (
                          <Dropdown.Item
                            onClick={() => {
                              switchWorkspace(NO_WORKSPACE)
                            }}
                          >
                            {<span className="pl-3">NO_WORKSPACE</span>}
                          </Dropdown.Item>
                        )}
                      </Dropdown.Menu>
                    </Dropdown>
                  ):null}
                </div>
              </div>
            </header>
          </div>
          <ElectronMenu></ElectronMenu>
          <div
            className="h-100 remixui_fileExplorerTree"
            onFocus={() => {
              toggleDropdown(false)
            }}
          >
            <div className="h-100">
              {(global.fs.browser.isRequestingWorkspace || global.fs.browser.isRequestingCloning) && (
                <div className="text-center py-5">
                  <i className="fas fa-spinner fa-pulse fa-2x"></i>
                </div>
              )}
              {!(global.fs.browser.isRequestingWorkspace || global.fs.browser.isRequestingCloning) && global.fs.mode === 'browser' && currentWorkspace !== NO_WORKSPACE && (
                <FileExplorer
                  fileState={global.fs.browser.fileState}
                  name={currentWorkspace}
                  menuItems={['createNewFile', 'createNewFolder', selectedWorkspace && selectedWorkspace.isGist ? 'updateGist' : 'publishToGist', canUpload ? 'uploadFile' : '', canUpload ? 'uploadFolder' : '']}
                  contextMenuItems={global.fs.browser.contextMenu.registeredMenuItems}
                  removedContextMenuItems={global.fs.browser.contextMenu.removedMenuItems}
                  files={global.fs.browser.files}
                  flatTree={global.fs.browser.flatTree}
                  workspaceState={state}
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
                  dispatchDownloadPath={global.dispatchDownloadPath}
                  dispatchUploadFile={global.dispatchUploadFile}
                  dispatchUploadFolder={global.dispatchUploadFolder}
                  dispatchCopyFile={global.dispatchCopyFile}
                  dispatchCopyShareURL={global.dispatchCopyShareURL}
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
                  handleCopyClick={handleCopyClick}
                  handlePasteClick={handlePasteClick}
                  addMenuItems={addMenuItems}
                  removeMenuItems={removeMenuItems}
                  handleContextMenu={handleContextMenu}
                  uploadFile={uploadFile}
                  uploadFolder={uploadFolder}
                  getFocusedFolder={getFocusedFolder}
                  toGist={toGist}
                  editModeOn={editModeOn}
                  handleNewFileInput={handleNewFileInput}
                  handleNewFolderInput={handleNewFolderInput}
                  dragStatus={dragStatus}
                  createNewFile={handleNewFileInput}
                  createNewFolder={handleNewFolderInput}
                  deletePath={deletePath}
                  renamePath={editModeOn}
                />

              )}
              {global.fs.localhost.isRequestingLocalhost && (
                <div className="text-center py-5">
                  <i className="fas fa-spinner fa-pulse fa-2x"></i>
                </div>
              )}
              {global.fs.mode === 'localhost' && global.fs.localhost.isSuccessfulLocalhost && (
                <FileExplorer
                  name="localhost"
                  menuItems={['createNewFile', 'createNewFolder']}
                  contextMenuItems={global.fs.localhost.contextMenu.registeredMenuItems}
                  removedContextMenuItems={global.fs.localhost.contextMenu.removedMenuItems}
                  files={global.fs.localhost.files}
                  flatTree={global.fs.localhost.flatTree}
                  fileState={[]}
                  workspaceState={state}
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
                  dispatchDownloadPath={global.dispatchDownloadPath}
                  dispatchUploadFile={global.dispatchUploadFile}
                  dispatchUploadFolder={global.dispatchUploadFolder}
                  dispatchCopyFile={global.dispatchCopyFile}
                  dispatchCopyShareURL={global.dispatchCopyShareURL}
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
                  handleCopyClick={handleCopyClick}
                  handlePasteClick={handlePasteClick}
                  addMenuItems={addMenuItems}
                  removeMenuItems={removeMenuItems}
                  handleContextMenu={handleContextMenu}
                  uploadFile={uploadFile}
                  uploadFolder={uploadFolder}
                  getFocusedFolder={getFocusedFolder}
                  toGist={toGist}
                  editModeOn={editModeOn}
                  handleNewFileInput={handleNewFileInput}
                  handleNewFolderInput={handleNewFolderInput}
                  createNewFile={handleNewFileInput}
                  createNewFolder={handleNewFolderInput}
                  deletePath={deletePath}
                  renamePath={editModeOn}
                  dragStatus={dragStatus}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      {selectedWorkspace && (
        <div className={`bg-light border-top ${selectedWorkspace.isGitRepo && currentBranch ? 'd-block' : 'd-none'}`} data-id="workspaceGitPanel">
          <div className="d-flex justify-space-between p-1">
            <div className="mr-auto text-uppercase text-dark pt-2 pl-2">GIT</div>
            {selectedWorkspace.hasGitSubmodules?
              <div className="pt-1 mr-1">
                {global.fs.browser.isRequestingCloning ? <div style={{ height: 30 }} className='btn btn-sm border text-muted small'><i className="fad fa-spinner fa-spin"></i> updating submodules</div>  :
                  <div style={{ height: 30 }} onClick={updateSubModules} data-id='updatesubmodules' className='btn btn-sm border text-muted small'>update submodules</div>}
              </div>
              : null}
            <div className="pt-1 mr-1" data-id="workspaceGitBranchesDropdown">
              <Dropdown style={{height: 30, minWidth: 80}} onToggle={toggleBranches} show={showBranches} drop={'up'}>
                <Dropdown.Toggle
                  as={CustomToggle}
                  id="dropdown-custom-components"
                  className="btn btn-light btn-block w-100 d-inline-block border border-dark form-control h-100 p-0 pl-2 pr-2 text-dark"
                  icon={null}
                >
                  {global.fs.browser.isRequestingCloning ? <i className="fad fa-spinner fa-spin"></i> : currentBranch || '-none-'}
                </Dropdown.Toggle>

                <Dropdown.Menu as={CustomMenu} className="custom-dropdown-items branches-dropdown">
                  <div data-id="custom-dropdown-menu">
                    <div className="d-flex text-dark" style={{fontSize: 14, fontWeight: 'bold'}}>
                      <span className="mt-2 ml-2 mr-auto">
                        <FormattedMessage id="filePanel.switchBranches" />
                      </span>
                      <div
                        className="pt-2 pr-2"
                        onClick={() => {
                          toggleBranches(false)
                        }}
                      >
                        <i className="fa fa-close"></i>
                      </div>
                    </div>
                    <div className="border-top py-2">
                      <input
                        className="form-control border checkout-input bg-light"
                        placeholder={intl.formatMessage({
                          id: 'filePanel.findOrCreateABranch'
                        })}
                        style={{minWidth: 225}}
                        onChange={handleBranchFilterChange}
                        data-id="workspaceGitInput"
                      />
                    </div>
                    <div className="border-top" style={{maxHeight: 120, overflowY: 'scroll'}} data-id="custom-dropdown-items">
                      {filteredBranches.length > 0 ? (
                        filteredBranches.map((branch, index) => {
                          return (
                            <Dropdown.Item
                              key={index}
                              onClick={() => {
                                switchToBranch(branch)
                              }}
                              title={intl.formatMessage({id: `filePanel.switchToBranch${branch.remote ? 'Title1' : 'Title2'}`})}
                            >
                              <div data-id={`workspaceGit-${branch.remote ? `${branch.remote}/${branch.name}` : branch.name}`}>
                                {currentBranch === branch.name && !branch.remote ? (
                                  <span>
                                    &#10003; <i className="far fa-code-branch"></i>
                                    <span className="pl-1">{branch.name}</span>
                                  </span>
                                ) : (
                                  <span className="pl-3">
                                    <i className={`far ${branch.remote ? 'fa-cloud' : 'fa-code-branch'}`}></i>
                                    <span className="pl-1">{branch.remote ? `${branch.remote}/${branch.name}` : branch.name}</span>
                                  </span>
                                )}
                              </div>
                            </Dropdown.Item>
                          )
                        })
                      ) : (
                        <Dropdown.Item onClick={switchToNewBranch}>
                          <div className="pl-1 pr-1" data-id="workspaceGitCreateNewBranch">
                            <i className="fas fa-code-branch pr-2"></i>
                            <span>
                              <FormattedMessage id="filePanel.createBranch" />: {branchFilter} from '{currentBranch}'
                            </span>
                          </div>
                        </Dropdown.Item>
                      )}
                    </div>
                    {(selectedWorkspace.branches || []).length > 4 && (
                      <div className="text-center border-top pt-2">
                        <label style={{fontSize: 12, cursor: 'pointer'}} onClick={showAllBranches}>
                          <FormattedMessage id="filePanel.viewAllBranches" />
                        </label>
                      </div>
                    )}
                  </div>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        </div>
      )}
      {state.showContextMenu && (
        <FileExplorerContextMenu
          actions={global.fs.focusElement.length > 1 ? state.actions.filter((item) => item.multiselect) : state.actions.filter((item) => !item.multiselect)}
          hideContextMenu={hideContextMenu}
          createNewFile={handleNewFileInput}
          createNewFolder={handleNewFolderInput}
          deletePath={deletePath}
          renamePath={editModeOn}
          runScript={runScript}
          copy={handleCopyClick}
          paste={handlePasteClick}
          copyFileName={handleCopyFileNameClick}
          copyPath={handleCopyFilePathClick}
          copyShareURL={handleCopyShareURLClick}
          emit={emitContextMenuEvent}
          pageX={state.focusContext.x}
          pageY={state.focusContext.y}
          path={state.focusContext.element}
          type={state.focusContext.type}
          focus={global.fs.focusElement}
          pushChangesToGist={pushChangesToGist}
          publishFolderToGist={publishFolderToGist}
          publishFileToGist={publishFileToGist}
          uploadFile={uploadFile}
          downloadPath={downloadPath}
        />
      )}
    </div>
  )
}

export default Workspace
