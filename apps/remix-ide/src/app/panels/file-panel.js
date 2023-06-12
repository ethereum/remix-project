import { ViewPlugin } from '@remixproject/engine-web'

import * as packageJson from '../../../../../package.json'
import React from 'react' // eslint-disable-line
import { FileSystemProvider } from '@remix-ui/workspace' // eslint-disable-line
import Registry from '../state/registry'
import { RemixdHandle } from '../plugins/remixd-handle'
const { HardhatHandle } = require('../files/hardhat-handle.js')
const { FoundryHandle } = require('../files/foundry-handle.js')
const { TruffleHandle } = require('../files/truffle-handle.js')
const { SlitherHandle } = require('../files/slither-handle.js')

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
  displayName: 'File explorer',
  methods: ['createNewFile', 'uploadFile', 'getCurrentWorkspace', 'getAvailableWorkspaceName', 'getWorkspaces', 'createWorkspace', 'switchToWorkspace', 'setWorkspace', 'registerContextMenuItem', 'renameWorkspace', 'deleteWorkspace'],
  events: ['setWorkspace', 'workspaceRenamed', 'workspaceDeleted', 'workspaceCreated'],
  icon: 'assets/img/fileManager.webp',
  description: 'Remix IDE file explorer',
  kind: 'fileexplorer',
  location: 'sidePanel',
  documentation: 'https://remix-ide.readthedocs.io/en/latest/file_explorer.html',
  version: packageJson.version,
  maintainedBy: 'Remix'
}
module.exports = class Filepanel extends ViewPlugin {
  constructor (appManager) {
    super(profile)
    this.registry = Registry.getInstance()
    this.fileProviders = this.registry.get('fileproviders').api
    this.fileManager = this.registry.get('filemanager').api

    this.el = document.createElement('div')
    this.el.setAttribute('id', 'fileExplorerView')

    this.remixdHandle = new RemixdHandle(this.fileProviders.localhost, appManager)
    this.hardhatHandle = new HardhatHandle()
    this.foundryHandle = new FoundryHandle()
    this.truffleHandle = new TruffleHandle()
    this.slitherHandle = new SlitherHandle()
    this.workspaces = []
    this.appManager = appManager
    this.currentWorkspaceMetadata = null
  }

  render () {
    return <div id='fileExplorerView'><FileSystemProvider plugin={this} /></div>
  }

  /**
   * @param item { id: string, name: string, type?: string[], path?: string[], extension?: string[], pattern?: string[] }
   * typically: 
   * group 0 for file manipulations
   * group 1 for download operations
   * group 2 for running operations (script for instance)
   * group 3 for publishing operations (gist)
   * group 4 for copying operations
   * group 5 for solidity file operations (flatten for instance)
   * group 6 for compiling operations
   * group 7 for generating resource files (UML, documentation, ...)
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

  getAvailableWorkspaceName (name) {
    if (!this.workspaces) return name
    let index = 1
    let workspace = this.workspaces.find(workspace => workspace.name === name + ' - ' + index)
    while (workspace) {
      index++
      workspace = this.workspaces.find(workspace => workspace.name === name + ' - ' + index)      
    }
    return name + ' - ' + index
  }

  setWorkspaces (workspaces) {
    this.workspaces = workspaces
  }

  createNewFile () {
    return new Promise((resolve, reject) => {
      this.emit('createNewFileInputReducerEvent', '/', (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
  }

  uploadFile (target) {
    return new Promise((resolve, reject) => {
      return this.emit('uploadFileReducerEvent', '/', target, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
  }

  createWorkspace (workspaceName, workspaceTemplateName, isEmpty) {
    return new Promise((resolve, reject) => {
      this.emit('createWorkspaceReducerEvent', workspaceName, workspaceTemplateName, isEmpty, (err, data) => {
        if (err) reject(err)
        else resolve(data || true)
      })
    })
  }

  renameWorkspace (oldName, workspaceName) {
    return new Promise((resolve, reject) => {
      this.emit('renameWorkspaceReducerEvent', oldName, workspaceName, (err, data) => {
        if (err) reject(err)
        else resolve(data || true)
      })
    })
  }

  deleteWorkspace (workspaceName) {
    return new Promise((resolve, reject) => {
      this.emit('deleteWorkspaceReducerEvent', workspaceName, (err, data) => {
        if (err) reject(err)
        else resolve(data || true)
      })
    })
  }

  saveRecent (workspaceName) {
    if (!localStorage.getItem('recentWorkspaces')) {
      localStorage.setItem('recentWorkspaces', JSON.stringify({first: workspaceName, second:'', third:''}))
    } else {
      const recents = JSON.parse(localStorage.getItem('recentWorkspaces'))
      if (recents.first !== workspaceName && recents.second !== workspaceName && recents.third !== workspaceName) {
        let newResents = JSON.stringify({first: workspaceName, second: recents.first, third: recents.second})
        localStorage.setItem('recentWorkspaces', newResents)
      }
    }
  }

  setWorkspace (workspace) {
    const workspaceProvider = this.fileProviders.workspace
    const current = this.currentWorkspaceMetadata
    this.currentWorkspaceMetadata = { name: workspace.name, isLocalhost: workspace.isLocalhost, absolutePath: `${workspaceProvider.workspacesPath}/${workspace.name}` }
    if (this.currentWorkspaceMetadata.name !== current) {
      this.saveRecent(workspace.name)
    }
    if (workspace.name !== " - connect to localhost - ") {
      localStorage.setItem('currentWorkspace', workspace.name)
    }
    this.emit('setWorkspace', workspace)
  }

  switchToWorkspace(workspaceName) {
    this.emit('switchToWorkspace', workspaceName)
  }

  workspaceRenamed (oldName, workspaceName) {
    this.emit('workspaceRenamed', oldName, workspaceName)
  }

  workspaceDeleted (workspace) {
    this.emit('workspaceDeleted', workspace)
  }

  workspaceCreated (workspace) {
    this.emit('workspaceCreated', workspace)
  }
  /** end section */
}
