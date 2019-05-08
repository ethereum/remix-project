'use strict'

var $ = require('jquery')
var csjs = require('csjs-inject')
var yo = require('yo-yo')
var async = require('async')
var request = require('request')
var remixLib = require('remix-lib')
var registry = require('./global/registry')
var UniversalDApp = require('./universal-dapp.js')
var UniversalDAppUI = require('./universal-dapp-ui.js')
var Remixd = require('./lib/remixd')
var OffsetToLineColumnConverter = require('./lib/offsetToLineColumnConverter')
var QueryParams = require('./lib/query-params')
var GistHandler = require('./lib/gist-handler')
var helper = require('./lib/helper')
var Storage = remixLib.Storage
var Browserfiles = require('./app/files/browser-files')
var SharedFolder = require('./app/files/shared-folder')
var Config = require('./config')
var Renderer = require('./app/ui/renderer')
var executionContext = require('./execution-context')
var EditorPanel = require('./app/panels/editor-panel')
var examples = require('./app/editor/example-contracts')
var modalDialogCustom = require('./app/ui/modal-dialog-custom')
var TxLogger = require('./app/execution/txLogger')
var Txlistener = remixLib.execution.txListener
var EventsDecoder = remixLib.execution.EventsDecoder
var FileManager = require('./app/files/fileManager')
var BasicReadOnlyExplorer = require('./app/files/basicReadOnlyExplorer')
var NotPersistedExplorer = require('./app/files/NotPersistedExplorer')
var toolTip = require('./app/ui/tooltip')
var TransactionReceiptResolver = require('./transactionReceiptResolver')

const PluginManagerComponent = require('./app/components/plugin-manager-component')

const VerticalIconsComponent = require('./app/components/vertical-icons-component')
const VerticalIconsApi = require('./app/components/vertical-icons-api')

const SwapPanelComponent = require('./app/components/swap-panel-component')
const SwapPanelApi = require('./app/components/swap-panel-api')

const CompileTab = require('./app/tabs/compile-tab')
const SettingsTab = require('./app/tabs/settings-tab')
const AnalysisTab = require('./app/tabs/analysis-tab')
const DebuggerTab = require('./app/tabs/debugger-tab')
const TestTab = require('./app/tabs/test-tab')
const RunTab = require('./app/tabs/run-tab')
const FilePanel = require('./app/panels/file-panel')

import PanelsResize from './lib/panels-resize'
import { EntityStore } from './lib/store'
import { RemixAppManager } from './remixAppManager'
import { LandingPage } from './app/ui/landing-page/landing-page'
import framingService from './framingService'
import { ThemeModule } from './app/tabs/theme-module'
import { NetworkModule } from './app/tabs/network-module'

var css = csjs`
  html { box-sizing: border-box; }
  *, *:before, *:after { box-sizing: inherit; }
  body                 {
    /* font: 14px/1.5 Lato, "Helvetica Neue", Helvetica, Arial, sans-serif; */
    font-size          : .8rem;
  }
  pre {
    overflow-x: auto;
  }
  .browsersolidity     {
    position           : relative;
    width              : 100vw;
    height             : 100vh;
    overflow           : hidden;
  }
  .mainpanel         {
    display            : flex;
    flex-direction     : column;
    position           : absolute;
    top                : 0;
    bottom             : 0;
    overflow           : hidden;
  }
  .iconpanel           {
    display            : flex;
    flex-direction     : column;
    position           : absolute;
    top                : 0;
    bottom             : 0;
    left               : 0;
    overflow           : hidden;
    width              : 50px;
    user-select        : none;
    /* border-right       : 1px solid var(--primary); */
  }
  .swappanel          {
    display            : flex;
    flex-direction     : column;
    position           : absolute;
    top                : 0;
    left               : 50px;
    bottom             : 0;
    overflow           : hidden;
    overflow-y         : auto;
  }
  .highlightcode {
    position:absolute;
    z-index:20;
    background-color: var(--info);
  }
  .highlightcode_fullLine {
    position:absolute;
    z-index:20;
    background-color: var(--info);
    opacity: 0.5;
  }
`

class App {
  constructor (api = {}, events = {}, opts = {}) {
    var self = this
    self._components = {}
    registry.put({api: self, name: 'app'})

    var fileStorage = new Storage('sol:')
    registry.put({api: fileStorage, name: 'fileStorage'})

    var configStorage = new Storage('config-v0.8:')
    registry.put({api: configStorage, name: 'configStorage'})

    self._components.config = new Config(configStorage)
    registry.put({api: self._components.config, name: 'config'})

    self._components.gistHandler = new GistHandler()

    self._components.filesProviders = {}
    self._components.filesProviders['browser'] = new Browserfiles(fileStorage)
    registry.put({api: self._components.filesProviders['browser'], name: 'fileproviders/browser'})

    var remixd = new Remixd(65520)
    registry.put({api: remixd, name: 'remixd'})
    remixd.event.register('system', (message) => {
      if (message.error) toolTip(message.error)
    })

    self._components.filesProviders['localhost'] = new SharedFolder(remixd)
    self._components.filesProviders['swarm'] = new BasicReadOnlyExplorer('swarm')
    self._components.filesProviders['github'] = new BasicReadOnlyExplorer('github')
    self._components.filesProviders['gist'] = new NotPersistedExplorer('gist')
    self._components.filesProviders['ipfs'] = new BasicReadOnlyExplorer('ipfs')
    self._components.filesProviders['https'] = new BasicReadOnlyExplorer('https')
    self._components.filesProviders['http'] = new BasicReadOnlyExplorer('http')
    registry.put({api: self._components.filesProviders['localhost'], name: 'fileproviders/localhost'})
    registry.put({api: self._components.filesProviders['swarm'], name: 'fileproviders/swarm'})
    registry.put({api: self._components.filesProviders['github'], name: 'fileproviders/github'})
    registry.put({api: self._components.filesProviders['gist'], name: 'fileproviders/gist'})
    registry.put({api: self._components.filesProviders['ipfs'], name: 'fileproviders/ipfs'})
    registry.put({api: self._components.filesProviders, name: 'fileproviders'})

    self._view = {}
  }

  init () {
    var self = this
    self._components.resizeFeature = new PanelsResize('#swap-panel', '#editor-container', { 'minWidth': 300, x: 450 })
    run.apply(self)
  }

  render () {
    var self = this
    if (self._view.el) return self._view.el
    // not resizable
    self._view.iconpanel = yo`
      <div id="icon-panel" class="${css.iconpanel} bg-light">
      ${''}
      </div>
    `

    // center panel, resizable
    self._view.swappanel = yo`
      <div id="swap-panel" class=${css.swappanel}>
        ${''}
      </div>
    `

    // handle the editor + terminal
    self._view.mainpanel = yo`
      <div id="editor-container" class=${css.mainpanel}>
        ${''}
      </div>
    `

    self._view.el = yo`
      <div class=${css.browsersolidity}>
        ${self._view.iconpanel}
        ${self._view.swappanel}
        ${self._view.mainpanel}
      </div>
    `
    return self._view.el
  }
  loadFromGist (params) {
    const self = this
    return self._components.gistHandler.handleLoad(params, function (gistId) {
      request.get({
        url: `https://api.github.com/gists/${gistId}`,
        json: true
      }, (error, response, data = {}) => {
        if (error || !data.files) {
          modalDialogCustom.alert(`Gist load error: ${error || data.message}`)
          return
        }
        self.loadFiles(data.files, 'gist', (errorLoadingFile) => {
          if (!errorLoadingFile) self._components.filesProviders['gist'].id = gistId
        })
      })
    })
  }
  loadFiles (filesSet, fileProvider, callback) {
    const self = this
    if (!fileProvider) fileProvider = 'browser'

    async.each(Object.keys(filesSet), (file, callback) => {
      helper.createNonClashingName(file, self._components.filesProviders[fileProvider],
      (error, name) => {
        if (error) {
          modalDialogCustom.alert('Unexpected error loading the file ' + error)
        } else if (helper.checkSpecialChars(name)) {
          modalDialogCustom.alert('Special characters are not allowed')
        } else {
          self._components.filesProviders[fileProvider].set(name, filesSet[file].content)
        }
        callback()
      })
    }, (error) => {
      if (!error) self._components.fileManager.switchFile()
      if (callback) callback(error)
    })
  }
}

module.exports = App

function run () {
  var self = this

  if (window.location.hostname === 'yann300.github.io') {
    modalDialogCustom.alert('This UNSTABLE ALPHA branch of Remix has been moved to http://ethereum.github.io/remix-live-alpha.')
  } else if (window.location.hostname === 'remix-alpha.ethereum.org' ||
  (window.location.hostname === 'ethereum.github.io' && window.location.pathname.indexOf('/remix-live-alpha') === 0)) {
    modalDialogCustom.alert(`Welcome to the Remix alpha instance. Please use it to try out latest features. But use preferably https://remix.ethereum.org for any production work.`)
  } else if (window.location.protocol.indexOf('http') === 0 &&
  window.location.hostname !== 'remix.ethereum.org' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1') {
    modalDialogCustom.alert(`The Remix IDE has moved to http://remix.ethereum.org.\n
This instance of Remix you are visiting WILL NOT BE UPDATED.\n
Please make a backup of your contracts and start using http://remix.ethereum.org`)
  }

  if (window.location.protocol.indexOf('https') === 0) {
    toolTip('You are using an `https` connection. Please switch to `http` if you are using Remix against an `http Web3 provider` or allow Mixed Content in your browser.')
  }
  // Oops! Accidentally trigger refresh or bookmark.
  window.onbeforeunload = function () {
    return 'Are you sure you want to leave?'
  }

  registry.put({api: msg => self._components.editorpanel.logHtmlMessage(msg), name: 'logCallback'})

  // helper for converting offset to line/column
  var offsetToLineColumnConverter = new OffsetToLineColumnConverter()
  registry.put({api: offsetToLineColumnConverter, name: 'offsettolinecolumnconverter'})

  // json structure for hosting the last compilattion result
  self._components.compilersArtefacts = {} // store all the possible compilation data (key represent a compiler name)
  registry.put({api: self._components.compilersArtefacts, name: 'compilersartefacts'})

  // ----------------- UniversalDApp -----------------
  const udapp = new UniversalDApp(registry)
  // TODO: to remove when possible
  registry.put({api: udapp, name: 'udapp'})
  udapp.event.register('transactionBroadcasted', (txhash, networkName) => {
    var txLink = executionContext.txDetailsLink(networkName, txhash)
    if (txLink) registry.get('logCallback').api(yo`<a href="${txLink}" target="_blank">${txLink}</a>`)
  })

  const udappUI = new UniversalDAppUI(udapp, registry)
  // TODO: to remove when possible
  registry.put({api: udappUI, name: 'udappUI'})

  // ----------------- Tx listener -----------------
  const transactionReceiptResolver = new TransactionReceiptResolver()

  const txlistener = new Txlistener({
    api: {
      contracts: function () {
        if (self._components.compilersArtefacts['__last']) return self._components.compilersArtefacts['__last'].getContracts()
        return null
      },
      resolveReceipt: function (tx, cb) {
        transactionReceiptResolver.resolve(tx, cb)
      }
    },
    event: {
      udapp: udapp.event
    }})
  registry.put({api: txlistener, name: 'txlistener'})
  udapp.startListening(txlistener)

  const eventsDecoder = new EventsDecoder({
    api: {
      resolveReceipt: function (tx, cb) {
        transactionReceiptResolver.resolve(tx, cb)
      }
    }
  })
  registry.put({api: eventsDecoder, name: 'eventsdecoder'})

  txlistener.startListening()

  // TODO: There are still a lot of dep between editorpanel and filemanager

  let appStore = new EntityStore('module', 'name')
  const appManager = new RemixAppManager(appStore)
  registry.put({api: appManager, name: 'appmanager'})

  const mainPanelComponent = new SwapPanelComponent('mainPanel', appStore, appManager, { default: false, displayHeader: false })

  // ----------------- file manager ----------------------------
  self._components.fileManager = new FileManager()
  const fileManager = self._components.fileManager
  registry.put({api: fileManager, name: 'filemanager'})

  // ----------------- Network ----------------------------
  const networkModule = new NetworkModule()
  registry.put({api: networkModule, name: 'network'})

  // ----------------- theme module ----------------------------
  const themeModule = new ThemeModule(registry)
  registry.put({api: themeModule, name: 'themeModule'})

  // ----------------- editor panel ----------------------
  self._components.editorpanel = new EditorPanel(appStore, appManager, mainPanelComponent)
  registry.put({ api: self._components.editorpanel, name: 'editorpanel' })

  // ----------------- Renderer -----------------
  const renderer = new Renderer()
  registry.put({api: renderer, name: 'renderer'})

  // ----------------- app manager ----------------------------

  /*
    TODOs:
      - for each activated plugin,
        an internal module (associated only with the plugin) should be created for accessing specific part of the UI. detail to be discussed
      - the current API is not optimal. For instance methods of `app` only refers to `executionContext`, wich does not make really sense.
  */

  // TODOs those are instanciated before hand. should be instanciated on demand

  const pluginManagerComponent = new PluginManagerComponent()
  const swapPanelComponent = new SwapPanelComponent('swapPanel', appStore, appManager, { default: true, displayHeader: true })
  registry.put({api: appManager.proxy(), name: 'pluginmanager'})

  pluginManagerComponent.setApp(appManager)
  pluginManagerComponent.setStore(appStore)

  // Need to have Home initialized before VerticalIconComponent render to access profile of it for icon
  const landingPage = new LandingPage(appManager, appStore)

  // ----------------- Vertical Icon ----------------------------
  const verticalIconsComponent = new VerticalIconsComponent('swapPanel', appStore, landingPage.profile)
  const swapPanelApi = new SwapPanelApi(swapPanelComponent, verticalIconsComponent) // eslint-disable-line
  const mainPanelApi = new SwapPanelApi(mainPanelComponent, verticalIconsComponent) // eslint-disable-line
  const verticalIconsApi = new VerticalIconsApi(verticalIconsComponent) // eslint-disable-line
  registry.put({api: verticalIconsApi, name: 'verticalicon'})

  self._components.editorpanel.init()
  self._components.fileManager.init()
  self._view.mainpanel.appendChild(self._components.editorpanel.render())
  self._view.iconpanel.appendChild(verticalIconsComponent.render())
  self._view.swappanel.appendChild(swapPanelComponent.render())

  let filePanel = new FilePanel()
  registry.put({api: filePanel, name: 'filepanel'})
  let compileTab = new CompileTab(
    registry.get('editor').api,
    registry.get('config').api,
    registry.get('renderer').api,
    registry.get('fileproviders/swarm').api,
    registry.get('filemanager').api,
    registry.get('fileproviders').api,
    registry.get('pluginmanager').api
  )
  let run = new RunTab(
    registry.get('udapp').api,
    registry.get('udappUI').api,
    registry.get('config').api,
    registry.get('filemanager').api,
    registry.get('editor').api,
    registry.get('logCallback').api,
    registry.get('filepanel').api,
    registry.get('pluginmanager').api,
    registry.get('compilersartefacts').api
  )
  let settings = new SettingsTab(
      registry.get('config').api,
      registry.get('editor').api,
      appManager
  )
  let analysis = new AnalysisTab(registry)
  let debug = new DebuggerTab()
  let test = new TestTab(
    registry.get('filemanager').api,
    registry.get('filepanel').api,
    compileTab
  )
  let sourceHighlighters = registry.get('editor').api.sourceHighlighters

  appManager.init([
    landingPage.api(),
    udapp.api(),
    fileManager.api(),
    sourceHighlighters.api(),
    filePanel.api(),
    // { profile: support.profile(), api: support },
    settings.api(),
    pluginManagerComponent.api(),
    networkModule.api(),
    themeModule.api()
  ])

  appManager.registerMany([
    compileTab.api(),
    run.api(),
    debug.api(),
    analysis.api(),
    test.api(),
    filePanel.remixdHandle.api(),
    ...appManager.plugins()
  ])

  framingService.start(appStore, swapPanelApi, verticalIconsApi, mainPanelApi, this._components.resizeFeature)

  // The event listener needs to be registered as early as possible, because the
  // parent will send the message upon the "load" event.
  let filesToLoad = null
  let loadFilesCallback = function (files) { filesToLoad = files } // will be replaced later

  window.addEventListener('message', function (ev) {
    if (typeof ev.data === typeof [] && ev.data[0] === 'loadFiles') {
      loadFilesCallback(ev.data[1])
    }
  }, false)

  // Replace early callback with instant response
  loadFilesCallback = function (files) {
    self.loadFiles(files)
  }

  // Run if we did receive an event from remote instance while starting up
  if (filesToLoad !== null) {
    self.loadFiles(filesToLoad)
  }

  const txLogger = new TxLogger() // eslint-disable-line
  txLogger.event.register('debuggingRequested', (hash) => {
    if (!appStore.isActive('debugger')) appManager.activateOne('debugger')
    debug.debugger().debug(hash)
    verticalIconsApi.select('debugger')
  })

  let transactionContextAPI = {
    getAddress: (cb) => {
      cb(null, $('#txorigin').val())
    },
    getValue: (cb) => {
      try {
        var number = document.querySelector('#value').value
        var select = document.getElementById('unit')
        var index = select.selectedIndex
        var selectedUnit = select.querySelectorAll('option')[index].dataset.unit
        var unit = 'ether' // default
        if (['ether', 'finney', 'gwei', 'wei'].indexOf(selectedUnit) >= 0) {
          unit = selectedUnit
        }
        cb(null, executionContext.web3().toWei(number, unit))
      } catch (e) {
        cb(e)
      }
    },
    getGasLimit: (cb) => {
      cb(null, $('#gasLimit').val())
    }
  }
  udapp.resetAPI(transactionContextAPI)

  const queryParams = new QueryParams()

  const loadingFromGist = self.loadFromGist(queryParams.get())
  if (!loadingFromGist) {
    // insert ballot contract if there are no files to show
    self._components.filesProviders['browser'].resolveDirectory('browser', (error, filesList) => {
      if (error) console.error(error)
      if (Object.keys(filesList).length === 0) {
        if (!self._components.filesProviders['browser'].set(examples.ballot.name, examples.ballot.content)) {
          modalDialogCustom.alert('Failed to store example contract in browser. Remix will not work properly. Please ensure Remix has access to LocalStorage. Safari in Private mode is known not to work.')
        } else {
          self._components.filesProviders['browser'].set(examples.ballot_test.name, examples.ballot_test.content)
        }
      }
    })
  }
}
