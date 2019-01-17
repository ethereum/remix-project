'use strict'

var $ = require('jquery')
var csjs = require('csjs-inject')
var yo = require('yo-yo')
var async = require('async')
var request = require('request')
var remixLib = require('remix-lib')
var EventManager = require('./lib/events')

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
var BrowserfilesTree = require('./app/files/browser-files-tree')
var SharedFolder = require('./app/files/shared-folder')
var Config = require('./config')
var Renderer = require('./app/ui/renderer')
var executionContext = require('./execution-context')
var FilePanel = require('./app/panels/file-panel')
var EditorPanel = require('./app/panels/editor-panel')
var RighthandPanel = require('./app/panels/righthand-panel')
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

const CompilerAbstract = require('./app/compiler/compiler-abstract')
const PluginManager = require('./app/plugin/pluginManager')
const CompileTab = require('./app/tabs/compile-tab')
const SettingsTab = require('./app/tabs/settings-tab')
const AnalysisTab = require('./app/tabs/analysis-tab')
const DebuggerTab = require('./app/tabs/debugger-tab')
const SupportTab = require('./app/tabs/support-tab')
const TestTab = require('./app/tabs/test-tab')
const RunTab = require('./app/tabs/run-tab')

var styleGuide = require('./app/ui/styles-guide/theme-chooser')
var styles = styleGuide.chooser()

var css = csjs`
  html { box-sizing: border-box; }
  *, *:before, *:after { box-sizing: inherit; }
  body                 {
    font: 14px/1.5 Lato, "Helvetica Neue", Helvetica, Arial, sans-serif;
    margin             : 0;
    padding            : 0;
    font-size          : 12px;
    color              : ${styles.leftPanel.text_Primary};
    font-weight        : normal;
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
  .centerpanel         {
    background-color  : ${styles.colors.transparent};
    display            : flex;
    flex-direction     : column;
    position           : absolute;
    top                : 0;
    bottom             : 0;
    overflow           : hidden;
  }
  .leftpanel           {
    background-color  : ${styles.leftPanel.backgroundColor_Panel};
    display            : flex;
    flex-direction     : column;
    position           : absolute;
    top                : 0;
    bottom             : 0;
    left               : 0;
    overflow           : hidden;
  }
  .rightpanel          {
    background-color  : ${styles.rightPanel.backgroundColor_Panel};
    display            : flex;
    flex-direction     : column;
    position           : absolute;
    top                : 0;
    right              : 0;
    bottom             : 0;
    overflow           : hidden;
  }
  .highlightcode {
    position:absolute;
    z-index:20;
    background-color: ${styles.editor.backgroundColor_DebuggerMode};
  }
  .highlightcode_fullLine {
    position:absolute;
    z-index:20;
    background-color: ${styles.editor.backgroundColor_DebuggerMode};
    opacity: 0.5;
  }
`

class App {
  constructor (api = {}, events = {}, opts = {}) {
    var self = this
    this.event = new EventManager()
    self._components = {}
    registry.put({api: self, name: 'app'})

    var fileStorage = new Storage('sol:')
    registry.put({api: fileStorage, name: 'fileStorage'})

    var configStorage = new Storage('config:')
    registry.put({api: configStorage, name: 'configStorage'})

    self._components.config = new Config(fileStorage)
    registry.put({api: self._components.config, name: 'config'})

    executionContext.init(self._components.config)
    executionContext.listenOnLastBlock()

    self._components.gistHandler = new GistHandler()

    self._components.filesProviders = {}
    self._components.filesProviders['browser'] = new Browserfiles(fileStorage)
    self._components.filesProviders['config'] = new BrowserfilesTree('config', configStorage)
    self._components.filesProviders['config'].init()
    registry.put({api: self._components.filesProviders['browser'], name: 'fileproviders/browser'})
    registry.put({api: self._components.filesProviders['config'], name: 'fileproviders/config'})

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

    self.data = {
      _layout: {
        right: {
          offset: self._components.config.get('right-offset') || 400,
          show: true
        }, // @TODO: adapt sizes proportionally to browser window size
        left: {
          offset: self._components.config.get('left-offset') || 200,
          show: true
        }
      }
    }
  }
  _adjustLayout (direction, delta) {
    var self = this
    var layout = self.data._layout[direction]
    if (layout) {
      if (delta === undefined) {
        layout.show = !layout.show
        if (layout.show) delta = layout.offset
        else delta = 0
      } else {
        self._components.config.set(`${direction}-offset`, delta)
        layout.offset = delta
      }
    }
    if (direction === 'left') {
      self._view.leftpanel.style.width = delta + 'px'
      self._view.centerpanel.style.left = delta + 'px'
    }
    if (direction === 'right') {
      self._view.rightpanel.style.width = delta + 'px'
      self._view.centerpanel.style.right = delta + 'px'
    }
  }
  init () {
    var self = this
    run.apply(self)
  }
  render () {
    var self = this
    if (self._view.el) return self._view.el
    self._view.leftpanel = yo`
      <div id="filepanel" class=${css.leftpanel}>
        ${''}
      </div>
    `
    self._view.centerpanel = yo`
      <div id="editor-container" class=${css.centerpanel}>
        ${''}
      </div>
    `
    self._view.rightpanel = yo`
      <div class=${css.rightpanel}>
        ${''}
      </div>
    `
    self._view.el = yo`
      <div class=${css.browsersolidity}>
        ${self._view.leftpanel}
        ${self._view.centerpanel}
        ${self._view.rightpanel}
      </div>
    `
    // INIT
    self._adjustLayout('left', self.data._layout.left.offset)
    self._adjustLayout('right', self.data._layout.right.offset)
    return self._view.el
  }
  startdebugging (txHash) {
    const self = this
    self.event.trigger('debuggingRequested', [])
    self._components.righthandpanel.debugger().debug(txHash)
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
  var udapp = new UniversalDApp(registry)
  // TODO: to remove when possible
  registry.put({api: udapp, name: 'udapp'})
  udapp.event.register('transactionBroadcasted', (txhash, networkName) => {
    var txLink = executionContext.txDetailsLink(networkName, txhash)
    if (txLink) registry.get('logCallback').api.logCallback(yo`<a href="${txLink}" target="_blank">${txLink}</a>`)
  })

  var udappUI = new UniversalDAppUI(udapp, registry)
  // TODO: to remove when possible
  registry.put({api: udappUI, name: 'udappUI'})

  // ----------------- Tx listener -----------------
  var transactionReceiptResolver = new TransactionReceiptResolver()

  var txlistener = new Txlistener({
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

  var eventsDecoder = new EventsDecoder({
    api: {
      resolveReceipt: function (tx, cb) {
        transactionReceiptResolver.resolve(tx, cb)
      }
    }
  })
  registry.put({api: eventsDecoder, name: 'eventsdecoder'})

  txlistener.startListening()

  // TODO: There are still a lot of dep between editorpanel and filemanager

  // ----------------- editor panel ----------------------
  self._components.editorpanel = new EditorPanel()
  registry.put({ api: self._components.editorpanel, name: 'editorpanel' })

  // ----------------- file manager ----------------------------
  self._components.fileManager = new FileManager()
  var fileManager = self._components.fileManager
  registry.put({api: fileManager, name: 'filemanager'})

  // ---------------- Plugin Manager -------------------------------

  let pluginManager = new PluginManager(
    self,
    self._components.compilersArtefacts,
    txlistener,
    self._components.fileProviders,
    self._components.fileManager,
    udapp)
  registry.put({api: pluginManager, name: 'pluginmanager'})

  pluginManager.event.register('sendCompilationResult', (file, source, languageVersion, data) => {
    // TODO check whether the tab is configured
    let compiler = new CompilerAbstract(languageVersion, data, source)
    self._components.compilersArtefacts['__last'] = compiler
  })

  self._components.editorpanel.init()
  self._components.fileManager.init()

  self._components.editorpanel.event.register('resize', direction => self._adjustLayout(direction))
  self._view.centerpanel.appendChild(self._components.editorpanel.render())

  // The event listener needs to be registered as early as possible, because the
  // parent will send the message upon the "load" event.
  var filesToLoad = null
  var loadFilesCallback = function (files) { filesToLoad = files } // will be replaced later

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

  // ---------------- FilePanel --------------------
  self._components.filePanel = new FilePanel()
  self._view.leftpanel.appendChild(self._components.filePanel.render())
  self._components.filePanel.event.register('resize', delta => self._adjustLayout('left', delta))
  registry.put({api: self._components.filePanel, name: 'filepanel'})

  // ----------------- Renderer -----------------
  var renderer = new Renderer()
  registry.put({api: renderer, name: 'renderer'})

  // ---------------- Tabs -------------------------------
  let compileTab = new CompileTab(self._components.registry)
  let tabs = {
    compile: compileTab,
    run: new RunTab(
      registry.get('udapp').api,
      registry.get('udappUI').api,
      registry.get('config').api,
      registry.get('filemanager').api,
      registry.get('editor').api,
      registry.get('logCallback').api,
      registry.get('filepanel').api,
      registry.get('pluginmanager').api,
      registry.get('compilersartefacts').api
    ),
    settings: new SettingsTab(self._components.registry),
    analysis: new AnalysisTab(registry),
    debug: new DebuggerTab(),
    support: new SupportTab(),
    test: new TestTab(self._components.registry, compileTab)
  }

  registry.get('app').api.event.register('tabChanged', (tabName) => {
    if (tabName === 'Support') tabs.support.loadTab()
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

  // ---------------- Righthand-panel --------------------
  self._components.righthandpanel = new RighthandPanel({ tabs, pluginManager })
  self._view.rightpanel.appendChild(self._components.righthandpanel.render())
  self._components.righthandpanel.init()
  self._components.righthandpanel.event.register('resize', delta => self._adjustLayout('right', delta))

  var txLogger = new TxLogger() // eslint-disable-line

  var queryParams = new QueryParams()

  var loadingFromGist = self.loadFromGist(queryParams.get())
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

  // Open last opened file
  var previouslyOpenedFile = self._components.config.get('currentFile')
  if (previouslyOpenedFile) {
    self._components.filesProviders['browser'].get(previouslyOpenedFile, (error, content) => {
      if (!error && content) {
        fileManager.switchFile(previouslyOpenedFile)
      } else {
        fileManager.switchFile()
      }
    })
  } else {
    fileManager.switchFile()
  }
}
