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
  methods: ['createNewFile', 'uploadFile', 'getCurrentWorkspace', 'getWorkspaces', 'createWorkspace', 'setWorkspace', 'registerContextMenuItem'],
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
    this.currentWorkspaceInfo = {}
  }

  onActivation () {
    this.renderComponent()
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
    this.emit('registerContextMenuItem', item)
  }

  removePluginActions (plugin) {
    this.emit('removePluginActions', plugin)
  }

  getCurrentWorkspace () {
    return this.currentWorkspaceInfo
  }

  getWorkspaces () {
    return this.workspaces
  }

  setWorkspaces (workspaces) {
    this.worspaces = workspaces
  }

  async createNewFile () {
    const provider = this.fileManager.currentFileProvider()
    const dir = provider.workspace || '/'

    this.emit('displayNewFileInput', dir)
  }

  async uploadFile (target) {
    const provider = this.fileManager.currentFileProvider()
    const dir = provider.workspace || '/'

    return this.emit('uploadFileEvent', dir, target)
  }

  async createWorkspace (workspaceName) {
    this.emit('createWorkspace', workspaceName)
  }

  async renameWorkspace (oldName, workspaceName) {
    this.emit('renameWorkspace', oldName, workspaceName)
  }

  setWorkspace (workspace) {
    const workspaceProvider = this.fileProviders.workspace

    this.currentWorkspaceInfo = { name: workspace.name, isLocalhost: workspace.isLocalhost, absolutePath: `${workspaceProvider.workspacesPath}/${workspace.name}` }
  }

  workspaceDeleted (workspace) {
    this.emit('deleteWorkspace', workspace)
  }

  workspaceCreated (workspace) {
    this.emit('createWorkspace', workspace)
  }
  /** end section */
}
