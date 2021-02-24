import { ViewPlugin } from '@remixproject/engine-web'

import * as packageJson from '../../../../../package.json'
import React from 'react' // eslint-disable-line
import ReactDOM from 'react-dom'
import { FileExplorer } from '@remix-ui/file-explorer' // eslint-disable-line
import './styles/file-panel-styles.css'
var ethutil = require('ethereumjs-util')
var yo = require('yo-yo')
var EventManager = require('../../lib/events')
var { RemixdHandle } = require('../files/remixd-handle.js')
var { GitHandle } = require('../files/git-handle.js')
var globalRegistry = require('../../global/registry')
var examples = require('../editor/examples')
var GistHandler = require('../../lib/gist-handler')
var QueryParams = require('../../lib/query-params')
const modalDialog = require('../ui/modal-dialog-custom')

var canUpload = window.File || window.FileReader || window.FileList || window.Blob

/*
  Overview of APIs:
   * fileManager: @args fileProviders (browser, shared-folder, swarm, github, etc ...) & config & editor
      - listen on browser & localhost file provider (`fileRenamed` & `fileRemoved`)
      - update the tabs, switchFile
      - trigger `currentFileChanged`
      - set the current file in the config
   * fileProvider: currently browser, swarm, localhost, github, gist
      - link to backend
      - provide properties `type`, `readonly`
      - provide API `resolveDirectory`, `remove`, `exists`, `rename`, `get`, `set`
      - trigger `fileExternallyChanged`, `fileRemoved`, `fileRenamed`, `fileRenamedError`, `fileAdded`
   * file-explorer: treeview @args fileProvider
      - listen on events triggered by fileProvider
      - call fileProvider API
*/

const profile = {
  name: 'fileExplorers',
  displayName: 'File explorers',
  methods: ['createNewFile', 'uploadFile', 'getCurrentWorkspace', 'getWorkspaces', 'createWorkspace'],
  events: ['setWorkspace', 'renameWorkspace', 'deleteWorkspace'],
  icon: 'assets/img/fileManager.webp',
  description: ' - ',
  kind: 'fileexplorer',
  location: 'sidePanel',
  documentation: 'https://remix-ide.readthedocs.io/en/latest/file_explorer.html',
  version: packageJson.version
}

module.exports = class Filepanel extends ViewPlugin {
  constructor (appManager) {
    super(profile)
    this._components = {}
    this._components.registry = globalRegistry
    this._deps = {
      fileProviders: this._components.registry.get('fileproviders').api,
      fileManager: this._components.registry.get('filemanager').api,
      config: this._components.registry.get('config').api
    }
    this.LOCALHOST = ' - connect to localhost - '
    this.NO_WORKSPACE = ' - none - '
    this.hideRemixdExplorer = true
    this.remixdExplorer = {
      hide: () => {
        if (this.currentWorkspace === this.LOCALHOST) this.setWorkspace(this.NO_WORKSPACE)
        this._deps.fileManager.setMode('browser')
        this.hideRemixdExplorer = true
        this.renderComponent()
      },
      show: () => {
        this._deps.fileManager.setMode('localhost')
        this.hideRemixdExplorer = false
        this.renderComponent()
      }
    }
    this.reset = false
    this.registeredMenuItems = []
    this.displayNewFile = false
    this.uploadFileEvent = null
    this.el = yo`
      <div id="fileExplorerView">
      </div>
    `

    this.remixdHandle = new RemixdHandle(this.remixdExplorer, this._deps.fileProviders.localhost, appManager)
    this.gitHandle = new GitHandle()

    this.event = new EventManager()
    this._deps.fileProviders.localhost.event.register('connecting', (event) => {
    })

    this._deps.fileProviders.localhost.event.register('connected', (event) => {
      this.remixdExplorer.show()
    })

    this._deps.fileProviders.localhost.event.register('errored', (event) => {
      this.remixdExplorer.hide()
    })

    this._deps.fileProviders.localhost.event.register('closed', (event) => {
      this.remixdExplorer.hide()
    })

    this.currentWorkspace = null

    const workspacesPath = this._deps.fileProviders.workspace.workspacesPath
    this._deps.fileProviders.browser.resolveDirectory('/' + workspacesPath, (error, fileTree) => {
      if (error) return console.error(error)
      this.setWorkspace(Object.keys(fileTree)[0].replace(workspacesPath + '/', ''))
    })
    this.renderComponent()
  }

  async initWorkspace () {
    const workspacesPath = this._deps.fileProviders.workspace.workspacesPath
    const queryParams = new QueryParams()
    const params = queryParams.get()
    // get the file from gist
    const gistHandler = new GistHandler()
    const loadedFromGist = gistHandler.loadFromGist(params, this._deps.fileManager)
    if (loadedFromGist) return
    if (params.code) {
      try {
        await this._deps.fileManager.createWorkspace('code-sample')
        var hash = ethutil.bufferToHex(ethutil.keccak(params.code))
        const fileName = 'contract-' + hash.replace('0x', '').substring(0, 10) + '.sol'
        const path = 'browser/' + workspacesPath + '/code-sample/' + fileName
        await this._deps.fileManager.writeFile(path, atob(params.code))
        this.setWorkspace('code-sample')
        await this._deps.fileManager.openFile(path)
      } catch (e) {
        console.error(e)
      }
      return
    }
    // insert example contracts if there are no files to show
    this._deps.fileProviders.browser.resolveDirectory('/', async (error, filesList) => {
      if (error) console.error(error)
      if (Object.keys(filesList).length === 0) {
        for (const file in examples) {
          await this._deps.fileManager.writeFile('browser/' + workspacesPath + '/default_workspace/' + examples[file].name, examples[file].content)
        }
        this.setWorkspace('default_workspace')
      }
    })
  }

  async refreshWorkspacesList () {
    if (!document.getElementById('workspacesSelect')) return
    const workspaces = await this.getWorkspaces()
    workspaces.push(this.LOCALHOST)
    workspaces.push(this.NO_WORKSPACE)
    ReactDOM.render(
      (
        workspaces
          .map((folder) => {
            return <option selected={this.currentWorkspace === folder} value={folder}>{folder}</option>
          })), document.getElementById('workspacesSelect')
    )
  }

  resetFocus (value) {
    this.reset = value
    this.renderComponent()
  }

  createNewFile () {
    this.displayNewFile = true
    this.renderComponent()
  }

  resetNewFile () {
    this.displayNewFile = false
    this.renderComponent()
  }

  uploadFile (target) {
    this.uploadFileEvent = target
    this.renderComponent()
  }

  resetUploadFile () {
    this.uploadFileEvent = null
    this.renderComponent()
  }

  render () {
    return this.el
  }

  getWorkspaces () {
    return new Promise((resolve, reject) => {
      const workspacesPath = this._deps.fileProviders.workspace.workspacesPath
      this._deps.fileProviders.browser.resolveDirectory('/' + workspacesPath, (error, items) => {
        if (error) return reject(error)
        resolve(Object.keys(items)
          .filter((item) => items[item].isDirectory)
          .map((folder) => folder.replace(workspacesPath + '/', '')))
      })
    })
  }

  getCurrentWorkspace () {
    return this.currentWorkspace
  }

  async setWorkspace (name) {
    this._deps.fileManager.removeTabsOf(this._deps.fileProviders.workspace)
    this.currentWorkspace = name
    if (name === this.LOCALHOST) {
      this._deps.fileProviders.workspace.clearWorkspace()
      this.call('manager', 'activatePlugin', 'remixd')
    } else if (name === this.NO_WORKSPACE) {
      this._deps.fileProviders.workspace.clearWorkspace()
    } else {
      this._deps.fileProviders.workspace.setWorkspace(name)
    }
    if (name !== this.LOCALHOST && await this.call('manager', 'isActive', 'remixd')) {
      this.call('manager', 'deactivatePlugin', 'remixd')
    }
    this.renderComponent()
    this.emit('setWorkspace', { name })
  }

  /**
   *
   * @param item { id: string, name: string, type?: string[], path?: string[], extension?: string[], pattern?: string[] }
   * @param callback (...args) => void
   */
  registerContextMenuItem (item) {
    if (!item) throw new Error('Invalid register context menu argument')
    if (!item.name || !item.id) throw new Error('Item name and id is mandatory')
    if (!item.type && !item.path && !item.extension && !item.pattern) throw new Error('Invalid file matching criteria provided')

    this.registeredMenuItems = [...this.registeredMenuItems, item]
    this.renderComponent()
  }

  renameWorkspace () {
    modalDialog.prompt('Rename Workspace', 'Please choose a name for the workspace', this.currentWorkspace, async (value) => {
      const workspacesPath = this._deps.fileProviders.workspace.workspacesPath
      await this._deps.fileManager.rename('browser/' + workspacesPath + '/' + this.currentWorkspace, 'browser/' + workspacesPath + '/' + value)
      this.setWorkspace(value)
      this.emit('renameWorkspace', { name: value })
    })
  }

  createWorkspace () {
    return new Promise((resolve, reject) => {
      const workspace = `workspace_${Date.now()}`
      modalDialog.prompt('New Workspace', 'Please choose a name for the workspace', workspace, (value) => {
        const workspacesPath = this._deps.fileProviders.workspace.workspacesPath
        this._deps.fileProviders.browser.createDir(workspacesPath + '/' + value, async () => {
          this.setWorkspace(value)
          for (const file in examples) {
            await this._deps.fileManager.writeFile(`${examples[file].name}`, examples[file].content)
          }
          resolve(value)
        })
      }, () => reject(new Error('workspace creation rejected by user')))
    })
  }

  deleteCurrentWorkspace () {
    if (!this.currentWorkspace) return
    modalDialog.confirm('Delete Workspace', 'Please confirm workspace deletion', () => {
      const workspacesPath = this._deps.fileProviders.workspace.workspacesPath
      this._deps.fileProviders.browser.remove(workspacesPath + '/' + this.currentWorkspace)
      const name = this.currentWorkspace
      this.currentWorkspace = null
      this.setWorkspace(this.NO_WORKSPACE)
      this.renderComponent()
      this.emit('deleteWorkspace', { name })
    })
  }

  renderComponent () {
    ReactDOM.render(
      <div className='remixui_container'>
        <div className='remixui_fileexplorer' onClick={() => this.resetFocus(true)}>
          <div>
            <header>
              <div className="mb-2">
                <label className="form-check-label" htmlFor="workspacesSelect">
                Workspaces
                </label>
                <span className="remixui_menu">
                  <span
                    id='workspaceCreate'
                    data-id='workspaceCreate'
                    onClick={(e) => {
                      e.stopPropagation()
                      this.createWorkspace()
                    }}
                    className='far fa-plus-square remixui_menuicon'
                    title='Create a new Workspace'>
                  </span>
                  <span
                    hidden={this.currentWorkspace === this.LOCALHOST || this.currentWorkspace === this.NO_WORKSPACE}
                    id='workspaceRename'
                    data-id='workspaceRename'
                    onClick={(e) => {
                      e.stopPropagation()
                      this.renameWorkspace()
                    }}
                    className='far fa-edit remixui_menuicon'
                    title='Rename current Workspace'>
                  </span>
                  <span
                    hidden={this.currentWorkspace === this.LOCALHOST || this.currentWorkspace === this.NO_WORKSPACE}
                    id='workspaceDelete'
                    data-id='workspaceDelete'
                    onClick={(e) => {
                      e.stopPropagation()
                      this.deleteCurrentWorkspace()
                    }}
                    className='fas fa-trash'
                    title='Delete current Workspace'>
                  </span>
                </span>
                <select id="workspacesSelect" data-id="workspacesSelect" onChange={(e) => this.setWorkspace(e.target.value)} className="form-control custom-select">
                </select>
              </div>
            </header>
          </div>
          <div className='remixui_fileExplorerTree'>
            <div>
              <div className='pl-2 remixui_treeview' data-id='filePanelFileExplorerTree'>
                { this.hideRemixdExplorer && this.currentWorkspace && this.currentWorkspace !== this.NO_WORKSPACE &&
                  <FileExplorer
                    name={this.currentWorkspace}
                    registry={this._components.registry}
                    filesProvider={this._deps.fileProviders.workspace}
                    menuItems={['createNewFile', 'createNewFolder', 'publishToGist', canUpload ? 'uploadFile' : '']}
                    plugin={this}
                    focusRoot={this.reset}
                    contextMenuItems={this.registeredMenuItems}
                  />
                }
              </div>
              <div className='pl-2 filesystemexplorer remixui_treeview'>
                { !this.hideRemixdExplorer &&
                  <FileExplorer
                    name='localhost'
                    registry={this._components.registry}
                    filesProvider={this._deps.fileProviders.localhost}
                    menuItems={['createNewFile', 'createNewFolder']}
                    plugin={this}
                    focusRoot={this.reset}
                    contextMenuItems={this.registeredMenuItems}
                  />
                }
              </div>
              <div className='pl-2 remixui_treeview'>
                { false && <FileExplorer
                  name='browser'
                  registry={this._components.registry}
                  filesProvider={this._deps.fileProviders.browser}
                  menuItems={['createNewFile', 'createNewFolder', 'publishToGist', canUpload ? 'uploadFile' : '']}
                  plugin={this}
                  focusRoot={this.reset}
                  contextMenuItems={this.registeredMenuItems}
                  displayInput={this.displayNewFile}
                  externalUploads={this.uploadFileEvent}
                />
                }
              </div>
            </div>
          </div>
        </div>
      </div>
      , this.el)
    setTimeout(() => {
      this.refreshWorkspacesList()
    }, 500)
  }
}
