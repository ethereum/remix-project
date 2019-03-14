var yo = require('yo-yo')
var CompilerMetadata = require('../files/compiler-metadata')
var EventManager = require('../../lib/events')
var FileExplorer = require('../files/file-explorer')
var { RemixdHandle } = require('../files/remixd-handle.js')
var globalRegistry = require('../../global/registry')
var css = require('./styles/file-panel-styles')

import { ApiFactory } from 'remix-plugin'

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

module.exports = class Filepanel extends ApiFactory {

  constructor (localRegistry) {
    super()
    var self = this
    self._components = {}
    self._components.registry = localRegistry || globalRegistry
    self._deps = {
      fileProviders: self._components.registry.get('fileproviders').api,
      fileManager: self._components.registry.get('filemanager').api,
      config: self._components.registry.get('config').api,
      pluginManager: self._components.registry.get('pluginmanager').api
    }
    var fileExplorer = new FileExplorer(self._components.registry, self._deps.fileProviders['browser'])
    var fileSystemExplorer = new FileExplorer(self._components.registry, self._deps.fileProviders['localhost'])
    var swarmExplorer = new FileExplorer(self._components.registry, self._deps.fileProviders['swarm'])
    var githubExplorer = new FileExplorer(self._components.registry, self._deps.fileProviders['github'])
    var gistExplorer = new FileExplorer(self._components.registry, self._deps.fileProviders['gist'])
    var configExplorer = new FileExplorer(self._components.registry, self._deps.fileProviders['config'])
    var httpExplorer = new FileExplorer(self._components.registry, self._deps.fileProviders['http'])
    var httpsExplorer = new FileExplorer(self._components.registry, self._deps.fileProviders['https'])

    self.remixdHandle = new RemixdHandle(fileSystemExplorer, self._deps.fileProviders['localhost'])

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
              <div class="configexplorer ${css.treeview}">${configExplorer.init()}</div>
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
    configExplorer.ensureRoot()
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

    configExplorer.events.register('focus', function (path) {
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

