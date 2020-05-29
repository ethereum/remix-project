var yo = require('yo-yo')
var EventManager = require('../../lib/events')
var FileExplorer = require('../files/file-explorer')
var { RemixdHandle } = require('../files/remixd-handle.js')
var globalRegistry = require('../../global/registry')
var css = require('./styles/file-panel-styles')
import { ViewPlugin } from '@remixproject/engine'

import * as packageJson from '../../../package.json'

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
  icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB3aWR0aD0iMTc5MiIgaGVpZ2h0PSIxNzkyIiB2aWV3Qm94PSIwIDAgMTc5MiAxNzkyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xNjk2IDM4NHE0MCAwIDY4IDI4dDI4IDY4djEyMTZxMCA0MC0yOCA2OHQtNjggMjhoLTk2MHEtNDAgMC02OC0yOHQtMjgtNjh2LTI4OGgtNTQ0cS00MCAwLTY4LTI4dC0yOC02OHYtNjcycTAtNDAgMjAtODh0NDgtNzZsNDA4LTQwOHEyOC0yOCA3Ni00OHQ4OC0yMGg0MTZxNDAgMCA2OCAyOHQyOCA2OHYzMjhxNjgtNDAgMTI4LTQwaDQxNnptLTU0NCAyMTNsLTI5OSAyOTloMjk5di0yOTl6bS02NDAtMzg0bC0yOTkgMjk5aDI5OXYtMjk5em0xOTYgNjQ3bDMxNi0zMTZ2LTQxNmgtMzg0djQxNnEwIDQwLTI4IDY4dC02OCAyOGgtNDE2djY0MGg1MTJ2LTI1NnEwLTQwIDIwLTg4dDQ4LTc2em05NTYgODA0di0xMTUyaC0zODR2NDE2cTAgNDAtMjggNjh0LTY4IDI4aC00MTZ2NjQwaDg5NnoiLz48L3N2Zz4=',
  description: ' - ',
  kind: 'fileexplorer',
  location: 'sidePanel',
  documentation: 'https://remix-ide.readthedocs.io/en/latest/file_explorer.html',
  version: packageJson.version
}

module.exports = class Filepanel extends ViewPlugin {

  constructor (appManager) {
    super(profile)
    var self = this
    self._components = {}
    self._components.registry = globalRegistry
    self._deps = {
      fileProviders: self._components.registry.get('fileproviders').api,
      fileManager: self._components.registry.get('filemanager').api,
      config: self._components.registry.get('config').api
    }

    function createProvider (key, menuItems) {
      return new FileExplorer(self._components.registry, self._deps.fileProviders[key], menuItems)
    }

    var fileExplorer = createProvider('browser', ['createNewFile', 'publishToGist', canUpload ? 'uploadFile' : ''])
    var fileSystemExplorer = createProvider('localhost')

    self.remixdHandle = new RemixdHandle(fileSystemExplorer, self._deps.fileProviders['localhost'], appManager)

    const explorers = yo`
      <div>
        <div class=${css.treeview} data-id="filePanelFileExplorerTree">${fileExplorer.init()}</div>
        <div class="filesystemexplorer ${css.treeview}">${fileSystemExplorer.init()}</div>
      </div>
    `

    function template () {
      return yo`
        <div class=${css.container}>
          <div class="${css.fileexplorer}">           
            <div class="${css.fileExplorerTree}">
              ${explorers}
            </div>
          </div>
        </div>
      `
    }

    var event = new EventManager()
    self.event = event
    var element = template()
    fileExplorer.ensureRoot()
    self._deps.fileProviders['localhost'].event.register('connecting', (event) => {
    })

    self._deps.fileProviders['localhost'].event.register('connected', (event) => {
      fileSystemExplorer.show()
    })

    self._deps.fileProviders['localhost'].event.register('errored', (event) => {
      fileSystemExplorer.hide()
    })

    self._deps.fileProviders['localhost'].event.register('closed', (event) => {
      fileSystemExplorer.hide()
    })

    self.render = function render () { return element }
  }
}

