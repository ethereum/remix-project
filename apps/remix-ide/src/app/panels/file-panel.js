import { ViewPlugin } from '@remixproject/engine-web'

import * as packageJson from '../../../../../package.json'
import React from 'react' // eslint-disable-line
import ReactDOM from 'react-dom'
import { FileExplorer } from '@remix-ui/file-explorer' // eslint-disable-line
import './styles/file-panel-styles.css'
var yo = require('yo-yo')
var EventManager = require('../../lib/events')
// var FileExplorer = require('../files/file-explorer')
var { RemixdHandle } = require('../files/remixd-handle.js')
var { GitHandle } = require('../files/git-handle.js')
var globalRegistry = require('../../global/registry')

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
  methods: ['createNewFile', 'uploadFile'],
  events: [],
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
    this.hideRemixdExplorer = true
    this.remixdExplorer = {
      hide: () => {
        this.hideRemixdExplorer = true
        this.renderComponent()
      },
      show: () => {
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

    this.renderComponent()
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

  renderComponent () {
    ReactDOM.render(
      <div className='remixui_container'>
        <div className='remixui_fileexplorer' data-id='filePanelFileExplorer' onClick={() => this.resetFocus(true)}>
          <div className='remixui_fileExplorerTree'>
            <div>
              <div className='pl-2 remixui_treeview' data-id='filePanelFileExplorerTree'>
                <FileExplorer
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
            </div>
          </div>
        </div>
      </div>
      , this.el)
  }
}
