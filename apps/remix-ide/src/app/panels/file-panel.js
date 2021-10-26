import { ViewPlugin } from '@remixproject/engine-web'

import * as packageJson from '../../../../../package.json'
import React from 'react' // eslint-disable-line
import ReactDOM from 'react-dom'
import { FileSystemProvider } from '@remix-ui/workspace' // eslint-disable-line
const { RemixdHandle } = require('../files/remixd-handle.js')
const { GitHandle } = require('../files/git-handle.js')
const { HardhatHandle } = require('../files/hardhat-handle.js')
const { SlitherHandle } = require('../files/slither-handle.js')
const globalRegistry = require('../../global/registry')
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
  name: 'filePanel',
  displayName: 'File explorers',
  methods: ['createNewFile', 'uploadFile', 'getCurrentWorkspace', 'getWorkspaces', 'createWorkspace', 'setWorkspace', 'registerContextMenuItem', 'renameWorkspace'],
  events: ['setWorkspace', 'renameWorkspace', 'deleteWorkspace', 'createWorkspace'],
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
    this.registry = globalRegistry
    this.fileProviders = this.registry.get('fileproviders').api
    this.fileManager = this.registry.get('filemanager').api

    this.el = document.createElement('div')
    this.el.setAttribute('id', 'fileExplorerView')

    this.remixdHandle = new RemixdHandle(this.fileProviders.localhost, appManager)
    this.gitHandle = new GitHandle()
    this.hardhatHandle = new HardhatHandle()
    this.slitherHandle = new SlitherHandle()
    this.workspaces = []
    this.appManager = appManager
    this.currentWorkspaceMetadata = {}
  }

  onActivation () {
    this.on('editor', 'editorMounted', () => this.renderComponent())
  }

  render () {
    return this.el
  }

  renderComponent () {
    ReactDOM.render(
      <FileSystemProvider plugin={this} />
      , this.el)
  }

  /**
   * @param item { id: string, name: string, type?: string[], path?: string[], extension?: string[], pattern?: string[] }
   * @param callback (...args) => void
   */
  registerContextMenuItem (item) {
    return new Promise((resolve, reject) => {
      this.emit('registerContextMenuItemReducerEvent', item, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
  }

  removePluginActions (plugin) {
    return new Promise((resolve, reject) => {
      this.emit('removePluginActionsReducerEvent', plugin, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
  }

  getCurrentWorkspace () {
    return this.currentWorkspaceMetadata
  }

  getWorkspaces () {
    return this.workspaces
  }

  setWorkspaces (workspaces) {
    this.workspaces = workspaces
  }

  createNewFile () {
    return new Promise((resolve, reject) => {
      const provider = this.fileManager.currentFileProvider()
      const dir = provider.workspace || '/'

      this.emit('createNewFileInputReducerEvent', dir, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
  }

  uploadFile (target) {
    return new Promise((resolve, reject) => {
      const provider = this.fileManager.currentFileProvider()
      const dir = provider.workspace || '/'

      return this.emit('uploadFileReducerEvent', dir, target, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
  }

  createWorkspace (workspaceName, isEmpty) {
    return new Promise((resolve, reject) => {
      this.emit('createWorkspaceReducerEvent', workspaceName, isEmpty, (err, data) => {
        if (err) reject(err)
        else resolve(data || true)
      })
    })
  }

  renameWorkspace (oldName, workspaceName) {
    this.emit('renameWorkspace', oldName, workspaceName)
  }

  setWorkspace (workspace) {
    const workspaceProvider = this.fileProviders.workspace

    this.currentWorkspaceMetadata = { name: workspace.name, isLocalhost: workspace.isLocalhost, absolutePath: `${workspaceProvider.workspacesPath}/${workspace.name}` }
    this.emit('setWorkspace', workspace)
  }

  workspaceDeleted (workspace) {
    this.emit('deleteWorkspace', workspace)
  }

  workspaceCreated (workspace) {
    this.emit('createWorkspace', workspace)
  }
  /** end section */
}
