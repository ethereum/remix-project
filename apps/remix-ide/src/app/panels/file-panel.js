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
  methods: [],
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
    this.el = yo` 
      <div id="fileExplorerView">
      </div>
    `

    this.remixdHandle = new RemixdHandle({}, this._deps.fileProviders.localhost, appManager)

    this.event = new EventManager()
    // fileExplorer.ensureRoot()
    this._deps.fileProviders.localhost.event.register('connecting', (event) => {
    })

    this._deps.fileProviders.localhost.event.register('connected', (event) => {
      fileSystemExplorer.show()
    })

    this._deps.fileProviders.localhost.event.register('errored', (event) => {
      fileSystemExplorer.hide()
    })

    this._deps.fileProviders.localhost.event.register('closed', (event) => {
      fileSystemExplorer.hide()
    })

    this.renderComponent()
  }

  render () {
    return this.el
  }

  renderComponent () {
    ReactDOM.render(
      <div className='remixui_container'>
        <div className='remixui_fileexplorer'>
          <div className='remixui_fileExplorerTree'>
            <div>
              <div className='pl-2 remixui_treeview' data-id='filePanelFileExplorerTree'>
                <FileExplorer
                  name='browser'
                  localRegistry={this._components.registry}
                  files={this._deps.fileProviders.browser}
                  menuItems={['createNewFile', 'publishToGist', canUpload ? 'uploadFile' : '']}
                  plugin={this}
                />
              </div>
              <div className='pl-2 filesystemexplorer remixui_treeview'>
                <FileExplorer
                  name='localhost'
                  localRegistry={this._components.registry}
                  files={this._deps.fileProviders.localhost}
                  menuItems={[]}
                  plugin={this}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      , this.el)
  }
}
