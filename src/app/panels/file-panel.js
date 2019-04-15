var yo = require('yo-yo')
var CompilerMetadata = require('../files/compiler-metadata')
var EventManager = require('../../lib/events')
var FileExplorer = require('../files/file-explorer')
var { RemixdHandle } = require('../files/remixd-handle.js')
var globalRegistry = require('../../global/registry')
var css = require('./styles/file-panel-styles')

import { BaseApi } from 'remix-plugin'

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
  location: 'swapPanel'
}

module.exports = class Filepanel extends BaseApi {

  constructor (localRegistry) {
    super(profile)
    var self = this
    self._components = {}
    self._components.registry = localRegistry || globalRegistry
    self._deps = {
      fileProviders: self._components.registry.get('fileproviders').api,
      fileManager: self._components.registry.get('filemanager').api,
      config: self._components.registry.get('config').api,
      pluginManager: self._components.registry.get('pluginmanager').api
    }
    var fileExplorer = new FileExplorer(self._components.registry, self._deps.fileProviders['browser'],
      ['createNewFile', 'publishToGist', 'copyFiles', canUpload ? 'uploadFile' : '']
    )
    var fileSystemExplorer = new FileExplorer(self._components.registry, self._deps.fileProviders['localhost'])
    var swarmExplorer = new FileExplorer(self._components.registry, self._deps.fileProviders['swarm'])
    var githubExplorer = new FileExplorer(self._components.registry, self._deps.fileProviders['github'])
    var gistExplorer = new FileExplorer(self._components.registry, self._deps.fileProviders['gist'], ['updateGist'])
    var httpExplorer = new FileExplorer(self._components.registry, self._deps.fileProviders['http'])
    var httpsExplorer = new FileExplorer(self._components.registry, self._deps.fileProviders['https'])

    self.remixdHandle = new RemixdHandle(fileSystemExplorer, self._deps.fileProviders['localhost'],
      self._deps.fileProviders['localhost'].isReadOnly ? ['createNewFile'] : [])

    // ----------------- editor panel ----------------------
    self._compilerMetadata = new CompilerMetadata(
      {
        fileManager: self._deps.fileManager,
        pluginManager: self._deps.pluginManager,
        config: self._deps.config
      }
    )
    self._compilerMetadata.syncContractMetadata()

    self.compilerMetadata = () => { return self._compilerMetadata }

    function template () {
      return yo`
        <div class=${css.container}>
          <div class="${css.fileexplorer}">           
            <div>
              <div class=${css.treeview}>${fileExplorer.init()}</div>
              <div class="filesystemexplorer ${css.treeview}">${fileSystemExplorer.init()}</div>
              <div class="swarmexplorer ${css.treeview}">${swarmExplorer.init()}</div>
              <div class="githubexplorer ${css.treeview}">${githubExplorer.init()}</div>
              <div class="gistexplorer ${css.treeview}">${gistExplorer.init()}</div>
              <div class="httpexplorer ${css.treeview}">${httpExplorer.init()}</div>
              <div class="httpsexplorer ${css.treeview}">${httpsExplorer.init()}</div>
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

    fileExplorer.events.register('focus', function (path) {
      self._deps.fileManager.switchFile(path)
    })

    fileSystemExplorer.events.register('focus', function (path) {
      self._deps.fileManager.switchFile(path)
    })

    swarmExplorer.events.register('focus', function (path) {
      self._deps.fileManager.switchFile(path)
    })

    githubExplorer.events.register('focus', function (path) {
      self._deps.fileManager.switchFile(path)
    })

    gistExplorer.events.register('focus', function (path) {
      self._deps.fileManager.switchFile(path)
    })

    httpExplorer.events.register('focus', function (path) {
      self._deps.fileManager.switchFile(path)
    })

    httpsExplorer.events.register('focus', function (path) {
      self._deps.fileManager.switchFile(path)
    })

    self.render = function render () { return element }
  }
}

