import { ViewPlugin } from '@remixproject/engine-web'

import * as packageJson from '../../../../../package.json'
import React from 'react' // eslint-disable-line
import ReactDOM from 'react-dom'
import { FileSystemProvider } from '@remix-ui/workspace' // eslint-disable-line
import { checkSpecialChars, checkSlash } from '../../lib/helper'
const { RemixdHandle } = require('../files/remixd-handle.js')
const { GitHandle } = require('../files/git-handle.js')
const { HardhatHandle } = require('../files/hardhat-handle.js')
const { SlitherHandle } = require('../files/slither-handle.js')
const globalRegistry = require('../../global/registry')
const examples = require('../editor/examples')
const modalDialogCustom = require('../ui/modal-dialog-custom')
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
    this.registeredMenuItems = []
    this.removedMenuItems = []
    this.request = {}
    this.workspaces = []
    this.initialWorkspace = null
    this.appManager = appManager
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
    if (!item) throw new Error('Invalid register context menu argument')
    if (!item.name || !item.id) throw new Error('Item name and id is mandatory')
    if (!item.type && !item.path && !item.extension && !item.pattern) throw new Error('Invalid file matching criteria provided')
    if (this.registeredMenuItems.filter((o) => {
      return o.id === item.id && o.name === item.name
    }).length) throw new Error(`Action ${item.name} already exists on ${item.id}`)
    this.registeredMenuItems = [...this.registeredMenuItems, item]
    this.removedMenuItems = this.removedMenuItems.filter(menuItem => item.id !== menuItem.id)
    this.renderComponent()
  }

  removePluginActions (plugin) {
    this.registeredMenuItems = this.registeredMenuItems.filter((item) => {
      if (item.id !== plugin.name || item.sticky === true) return true
      else {
        this.removedMenuItems.push(item)
        return false
      }
    })
    this.renderComponent()
  }

  async getCurrentWorkspace () {
    return await this.request.getCurrentWorkspace()
  }

  async getWorkspaces () {
    const result = new Promise((resolve, reject) => {
      const workspacesPath = this.fileProviders.workspace.workspacesPath
      this.fileProviders.browser.resolveDirectory('/' + workspacesPath, (error, items) => {
        if (error) {
          console.error(error)
          return reject(error)
        }
        resolve(Object.keys(items)
          .filter((item) => items[item].isDirectory)
          .map((folder) => folder.replace(workspacesPath + '/', '')))
      })
    })
    try {
      this.workspaces = await result
    } catch (e) {
      modalDialogCustom.alert('Workspaces have not been created on your system. Please use "Migrate old filesystem to workspace" on the home page to transfer your files or start by creating a new workspace in the File Explorers.')
      console.log(e)
    }
    this.renderComponent()
    return this.workspaces
  }

  async createNewFile () {
    const provider = this.fileManager.currentFileProvider()
    const dir = provider.workspace || '/'

    this.emit('displayNewFileInput', dir)
  }

  async uploadFile (event) {
    return await this.request.uploadFile(event)
  }

  async processCreateWorkspace (name) {
    const workspaceProvider = this.fileProviders.workspace
    const browserProvider = this.fileProviders.browser
    const workspacePath = 'browser/' + workspaceProvider.workspacesPath + '/' + name
    const workspaceRootPath = 'browser/' + workspaceProvider.workspacesPath
    const workspaceRootPathExists = await browserProvider.exists(workspaceRootPath)
    const workspacePathExists = await browserProvider.exists(workspacePath)

    if (!workspaceRootPathExists) browserProvider.createDir(workspaceRootPath)
    if (!workspacePathExists) browserProvider.createDir(workspacePath)
  }

  async workspaceExists (name) {
    const workspaceProvider = this.fileProviders.workspace
    const browserProvider = this.fileProviders.browser
    const workspacePath = 'browser/' + workspaceProvider.workspacesPath + '/' + name
    return browserProvider.exists(workspacePath)
  }

  async createWorkspace (workspaceName, setDefaults = true) {
    if (!workspaceName) throw new Error('name cannot be empty')
    if (checkSpecialChars(workspaceName) || checkSlash(workspaceName)) throw new Error('special characters are not allowed')
    if (await this.workspaceExists(workspaceName)) throw new Error('workspace already exists')
    else {
      const workspaceProvider = this.fileProviders.workspace
      await this.processCreateWorkspace(workspaceName)
      workspaceProvider.setWorkspace(workspaceName)
      await this.request.setWorkspace(workspaceName) // tells the react component to switch to that workspace
      if (setDefaults) {
        for (const file in examples) {
          try {
            await workspaceProvider.set(examples[file].name, examples[file].content)
          } catch (error) {
            console.error(error)
          }
        }
      }
    }
  }

  async renameWorkspace (oldName, workspaceName) {
    if (!workspaceName) throw new Error('name cannot be empty')
    if (checkSpecialChars(workspaceName) || checkSlash(workspaceName)) throw new Error('special characters are not allowed')
    if (await this.workspaceExists(workspaceName)) throw new Error('workspace already exists')
    const browserProvider = this.fileProviders.browser
    const workspacesPath = this.fileProviders.workspace.workspacesPath
    browserProvider.rename('browser/' + workspacesPath + '/' + oldName, 'browser/' + workspacesPath + '/' + workspaceName, true)
  }

  /** these are called by the react component, action is already finished whent it's called */
  async setWorkspace (workspace, setEvent = true) {
    if (workspace.isLocalhost) {
      this.call('manager', 'activatePlugin', 'remixd')
    } else if (await this.call('manager', 'isActive', 'remixd')) {
      this.call('manager', 'deactivatePlugin', 'remixd')
    }
    if (setEvent) {
      this.fileManager.setMode(workspace.isLocalhost ? 'localhost' : 'browser')
      this.emit('setWorkspace', workspace)
    }
  }

  workspaceDeleted (workspace) {
    this.emit('deleteWorkspace', workspace)
  }

  workspaceCreated (workspace) {
    this.emit('createWorkspace', workspace)
  }
  /** end section */
}
