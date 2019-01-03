'use strict'

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
// const PluginManager = require('./app/plugin/pluginManager')

// var IconPanel = require('./app/panels/left-icon-panel')

const VerticalIconsComponent = require('./app/components/vertical-icons-component')
const VerticalIconsApi = require('./app/components/vertical-icons-api')
// var VerticalIconsProfile = require('./app/panels/vertical-icons-profile')

const SwapPanelComponent = require('./app/component/swap-panel-component')
const SwapPanelComponent = require('./app/component/swap-panel-api')

const CompileTab = require('./app/tabs/compile-tab')
const SettingsTab = require('./app/tabs/settings-tab')
const AnalysisTab = require('./app/tabs/analysis-tab')
const DebuggerTab = require('./app/tabs/debugger-tab')
const SupportTab = require('./app/tabs/support-tab')
const TestTab = require('./app/tabs/test-tab')
const RunTab = require('./app/tabs/run-tab')

const appManager = require('remix-plugin').appManager

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
      self._view.swappanel.style.width = delta + 'px'
      self._view.mainpanel.style.left = delta + 'px'
    }
    // if (direction === 'right') {
    //   self._view.mainpanel.style.width = delta + 'px'
    //   self._view.swappanel.style.right = delta + 'px'
    // }
  }
  init () {
    var self = this
    run.apply(self)
  }
  
  render () {
    var self = this
    if (self._view.el) return self._view.el
    // not resizable
    self._view.iconpanel = yo`
      <div id="icon-panel" class=${css.iconpanel} style="width: 50px;">
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
      <div id="editor-container" class=${css.centerpanel}>
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
    // INIT
    self._adjustLayout('left', self.data._layout.left.offset)
    // self._adjustLayout('right', self.data._layout.right.offset)
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
    }
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

  // ----------------- app manager ----------------------------
  const VerticalIconsProfile = {
    type: 'verticalIcons',
    methods: ['addIcon', 'removeIcon'],
  }
  
  const SwapPanelProfile = {
    type: 'swapPanel',
    methods: ['addView', 'showContent'],
  }

  const PluginManagerProfile = {
    type: 'pluginManager',
    methods: [],
  }

  const FileManagerProfile = {
    type: 'fileManager',
    methods: [],
  }

  const SettingsProfile = {
    type: 'settings',
    methods: [],
  }

  const appManager = new appManager()

  const swapPanelComponent = new SwapPanelComponent()
  const pluginManagerComponent = new PluginManagerComponent(appManager)
  const verticalIconComponent = new VerticalIconsComponent(appManager)

  const swapPanelApi = new SwapPanelApi(swapPanelComponent)
  const verticalIconApi = new VerticalsIconApi(verticalIconComponent)
  const pluginManagerAPI = new pluginManagerAPI(pluginManagerComponent)

  // All Plugins and Modules are registered in the contructor
  // You cannot add module after
  appManager.init({
    // Module should be activated by default
    modules: [
      { json: VerticalIconsProfile, api: verticalIconApi },
      { json: SwapPanelProfile, api: swapPanelApi },
      { json: PluginManagerProfile, api: pluginManagerApi },
      { json: FileManagerProfile, api: self._components.filePanel },
    ],
    // Plugins need to be activated
    plugins: [],
    options: {
      bootstrap: 'pluginManager'
    }
  })

  self._components.filePanel = new FilePanel()
  registry.put({api: self._components.filePanel, name: 'filepanel'})
  swapPanelApi.addView('File', self._components.filePanel.render())
  verticalIconApi.addIcon('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDUwIDUwIiBoZWlnaHQ9IjUwcHgiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MCA1MCIgd2lkdGg9IjUwcHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxyZWN0IGZpbGw9Im5vbmUiIGhlaWdodD0iNTAiIHdpZHRoPSI1MCIvPjxwYXRoIGQ9Ik00NiwxNXYtNCAgYzAtMS4xMDQtMC44OTYtMi0yLTJjMCwwLTI0LjY0OCwwLTI2LDBjLTEuNDY5LDAtMi40ODQtNC00LTRIM0MxLjg5Niw1LDEsNS44OTYsMSw3djR2Mjl2NGMwLDEuMTA0LDAuODk2LDIsMiwyaDM5ICBjMS4xMDQsMCwyLTAuODk2LDItMiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBhdGggZD0iTTEsNDRsNS0yNyAgYzAtMS4xMDQsMC44OTYtMiwyLTJoMzljMS4xMDQsMCwyLDAuODk2LDIsMmwtNSwyNyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+')

  const compileTab = new CompileTab(self._components.registry)
  swapPanelApi.addView('Compile', compileTab.render())
  verticalIconApi.addIcon('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDUwIDUwIiBoZWlnaHQ9IjUwcHgiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MCA1MCIgd2lkdGg9IjUwcHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxyZWN0IGZpbGw9Im5vbmUiIGhlaWdodD0iNTAiIHdpZHRoPSI1MCIvPjxjaXJjbGUgY3g9IjI1IiBjeT0iMjUiIGZpbGw9Im5vbmUiIHI9IjI0IiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2Utd2lkdGg9IjIiLz48ZWxsaXBzZSBjeD0iMjUiIGN5PSIyNSIgZmlsbD0ibm9uZSIgcng9IjEyIiByeT0iMjQiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS13aWR0aD0iMiIvPjxwYXRoIGQ9Ik02LjM2NSw0MC40MzhDMTAuNzY2LDM3LjcyOSwxNy40NzksMzYsMjUsMzYgIGM3LjQxOCwwLDE0LjA0OSwxLjY4MiwxOC40NTEsNC4zMjUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2Utd2lkdGg9IjIiLz48cGF0aCBkPSJNNDMuNjM1LDkuNTYzQzM5LjIzNCwxMi4yNzEsMzIuNTIxLDE0LDI1LDE0ICBjLTcuNDE3LDAtMTQuMDQ5LTEuNjgyLTE4LjQ1MS00LjMyNSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS13aWR0aD0iMiIvPjxsaW5lIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2Utd2lkdGg9IjIiIHgxPSIxIiB4Mj0iNDkiIHkxPSIyNSIgeTI9IjI1Ii8+PGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS13aWR0aD0iMiIgeDE9IjI1IiB4Mj0iMjUiIHkxPSIxIiB5Mj0iNDkiLz48L3N2Zz4=')

  const testTab = new TestTab(self._components.registry, compileTab)
  swapPanelApi.addView('Test', testTab.render())
  verticalIconApi.addIcon('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDUwIDUwIiBoZWlnaHQ9IjUwcHgiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MCA1MCIgd2lkdGg9IjUwcHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxjaXJjbGUgY3g9IjI1IiBjeT0iMjUiIGZpbGw9Im5vbmUiIHI9IjI0IiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2Utd2lkdGg9IjIiLz48cmVjdCBmaWxsPSJub25lIiBoZWlnaHQ9IjUwIiB3aWR0aD0iNTAiLz48Zz48cGF0aCBkPSJNMjMuNTMzLDMwLjQwN3YtMS40N2MwLTEuNDM2LDAuMzIyLTIuMTg4LDEuMDc1LTMuMjI5bDIuNDA0LTMuM2MxLjI1NC0xLjcyMSwxLjY4NC0yLjU0NiwxLjY4NC0zLjc2NiAgIGMwLTIuMDQ0LTEuNDM0LTMuMzM1LTMuNDc5LTMuMzM1Yy0yLjAwOCwwLTMuMjk5LDEuMjE5LTMuNzI5LDMuNDA3Yy0wLjAzNiwwLjIxNS0wLjE3OSwwLjMyMy0wLjM5NSwwLjI4N2wtMi4yNTktMC4zOTUgICBjLTAuMjE2LTAuMDM2LTAuMzIzLTAuMTc5LTAuMjg4LTAuMzk1YzAuNTM5LTMuNDQzLDMuMDE0LTUuNzAzLDYuNzQ0LTUuNzAzYzMuODcyLDAsNi40OSwyLjU0Niw2LjQ5LDYuMDk3ICAgYzAsMS43MjItMC42MDgsMi45NzctMS44MjgsNC42NjNsLTIuNDAzLDMuM2MtMC43MTcsMC45NjgtMC45MzMsMS40Ny0wLjkzMywyLjY4OXYxLjE0N2MwLDAuMjE1LTAuMTQzLDAuMzU4LTAuMzU4LDAuMzU4aC0yLjM2NyAgIEMyMy42NzYsMzAuNzY2LDIzLjUzMywzMC42MjIsMjMuNTMzLDMwLjQwN3ogTTIzLjM1NCwzMy44NTFjMC0wLjIxNSwwLjE0My0wLjM1OCwwLjM1OS0wLjM1OGgyLjcyNiAgIGMwLjIxNSwwLDAuMzU4LDAuMTQ0LDAuMzU4LDAuMzU4djMuMDg0YzAsMC4yMTYtMC4xNDQsMC4zNTgtMC4zNTgsMC4zNThoLTIuNzI2Yy0wLjIxNywwLTAuMzU5LTAuMTQzLTAuMzU5LTAuMzU4VjMzLjg1MXoiLz48L2c+PC9zdmc+')

  const runTab = new RunTab(self._components.registry)
  swapPanelApi.addView('Run', runTab.render())
  verticalIconApi.addIcon('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDUwIDUwIiBoZWlnaHQ9IjUwcHgiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MCA1MCIgd2lkdGg9IjUwcHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxyZWN0IGZpbGw9Im5vbmUiIGhlaWdodD0iNTAiIHdpZHRoPSI1MCIvPjxwYXRoIGQ9Ik0zMC45MzMsMzIuNTI4Yy0wLjE0Ni0xLjYxMi0wLjA5LTIuNzM3LTAuMDktNC4yMWMwLjczLTAuMzgzLDIuMDM4LTIuODI1LDIuMjU5LTQuODg4YzAuNTc0LTAuMDQ3LDEuNDc5LTAuNjA3LDEuNzQ0LTIuODE4ICBjMC4xNDMtMS4xODctMC40MjUtMS44NTUtMC43NzEtMi4wNjVjMC45MzQtMi44MDksMi44NzQtMTEuNDk5LTMuNTg4LTEyLjM5N2MtMC42NjUtMS4xNjgtMi4zNjgtMS43NTktNC41ODEtMS43NTkgIGMtOC44NTQsMC4xNjMtOS45MjIsNi42ODYtNy45ODEsMTQuMTU2Yy0wLjM0NSwwLjIxLTAuOTEzLDAuODc4LTAuNzcxLDIuMDY1YzAuMjY2LDIuMjExLDEuMTcsMi43NzEsMS43NDQsMi44MTggIGMwLjIyLDIuMDYyLDEuNTgsNC41MDUsMi4zMTIsNC44ODhjMCwxLjQ3MywwLjA1NSwyLjU5OC0wLjA5MSw0LjIxQzE5LjM2NywzNy4yMzgsNy41NDYsMzUuOTE2LDcsNDVoMzggIEM0NC40NTUsMzUuOTE2LDMyLjY4NSwzNy4yMzgsMzAuOTMzLDMyLjUyOHoiLz48L3N2Zz4=')

  const analysisTab = new AnalysisTab(self._components.registry)
  swapPanelApi.addView('Analysis', analysisTab.render())
  verticalIconApi.addIcon('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDUwIDUwIiBoZWlnaHQ9IjUwcHgiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MCA1MCIgd2lkdGg9IjUwcHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxyZWN0IGZpbGw9Im5vbmUiIGhlaWdodD0iNTAiIHdpZHRoPSI1MCIvPjxwb2x5Z29uIGZpbGw9Im5vbmUiIHBvaW50cz0iNDksMTQgMzYsMjEgMzYsMjkgICA0OSwzNiAiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS13aWR0aD0iMiIvPjxwYXRoIGQ9Ik0zNiwzNmMwLDIuMjA5LTEuNzkxLDQtNCw0ICBINWMtMi4yMDksMC00LTEuNzkxLTQtNFYxNGMwLTIuMjA5LDEuNzkxLTQsNC00aDI3YzIuMjA5LDAsNCwxLjc5MSw0LDRWMzZ6IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=')

  const debuggerTab = new DebuggerTab(self._components.registry)
  swapPanelApi.addView('Debugger', debuggerTab.render())
  verticalIconApi.addIcon('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDUwIDUwIiBoZWlnaHQ9IjUwcHgiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MCA1MCIgd2lkdGg9IjUwcHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxwb2x5bGluZSBmaWxsPSJub25lIiBwb2ludHM9IjIwLDIzIDIsMjMgMiwxNCAgIDQ4LDE0IDQ4LDIzIDMwLDIzICIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc3Ryb2tlLXdpZHRoPSIyIi8+PHJlY3QgZmlsbD0ibm9uZSIgaGVpZ2h0PSIzNCIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc3Ryb2tlLXdpZHRoPSIyIiB3aWR0aD0iMTAiIHg9IjIwIiB5PSIxNCIvPjxyZWN0IGZpbGw9Im5vbmUiIGhlaWdodD0iNTAiIHdpZHRoPSI1MCIvPjxwYXRoIGQ9Ik0yMCwyM0g0djI1aDQyVjIzSDMwIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2Utd2lkdGg9IjIiLz48cGF0aCBkPSIgIE0yNSwxM2MwLDAtMy41ODIsMC04LDBzLTktMi41ODEtOS03YzAtMS44MjgsMC44NzgtNCw0LjMxOS00QzE5LjIzNiwyLDE5LjM2MywxMywyNSwxM3oiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS13aWR0aD0iMiIvPjxwYXRoIGQ9IiAgTTI1LDEzYzAsMCwzLjU4MiwwLDgsMHM5LTIuNTgxLDktN2MwLTEuODI4LTAuODc4LTQtNC4zMTktNEMzMC43NjQsMiwzMC42MzcsMTMsMjUsMTN6IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=')

  const supportTab = new SupportTab(self._components.registry)
  swapPanelApi.addView('Support', supportTab.render())
  verticalIconApi.addIcon('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDUwIDUwIiBoZWlnaHQ9IjUwcHgiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MCA1MCIgd2lkdGg9IjUwcHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxyZWN0IGZpbGw9Im5vbmUiIGhlaWdodD0iNTAiIHdpZHRoPSI1MCIvPjxnPjxwYXRoIGQ9Ik0yNSwxMC4wNjIgICBjMC0zLjU5LTIuOTEzLTYuNS02LjUtNi41Yy0zLjU5MywwLTYuNSwyLjkxLTYuNSw2LjVjMCwxLjAwNywwLjIzLDEuOTU1LDAuNjQyLDIuOCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48cGF0aCBkPSIgIE00NS4zNzUsMjQuMDI5aC0xLjYyN2MtMC44NDgsMC0xLjI1LTAuMzc3LTEuMzEyLTAuNzYyYy0wLjQ0My0yLjc4OS0yLjI1NS02LjQxMy02LjgwOS04LjAwM2MtMC4wNDQtMi41MjMsMC41MTktNC4zNDMsMS42MTUtNy4zMDQgIGMtMi41NDcsMC42MzktNS4zNjEsMi4wMjYtNy4wMjcsNS43Yy0xLjg3Ny0wLjQ1OS0zLjg4My0wLjcwNy01Ljk3OC0wLjcwN2MtNS40ODUsMC05LjYyMiwxLjY2NC0xMi45MzQsNC4yNDIgIGMtMi45OTEsMi4zMjktNC44Nyw2LjIyOS00LjY0NywxMS41NDljMC4xNjgsNC4wMTMsMi45NjMsNy4wNzUsNS4xMDcsOC43OWMwLjMwOSwwLjI0NCwwLjkyNSwwLjYzNSwwLjYwMywxLjYzMiAgYy0wLjMyMywwLjk5NS0wLjkwMywyLjM4NC0wLjkwMywyLjM4NGMtMC4zMzgsMC44ODYsMC4xMTEsMS44ODEsMC45OTYsMi4yMThsMy4yMTgsMS4yMTZjMC44ODYsMC4zMzgsMS44ODEtMC4xMDksMi4yMTgtMC45OTYgIGMwLDAsMC40MjgtMS4xMTUsMC43NzYtMi4wNDVjMC42NjEtMS43NDgsMS4wNjUtMC4zMyw1LjU2Ni0wLjMzYzQuNjc3LDAsNS4xNDktMC45MTIsNS42MzgsMC41MiAgYzAuMzEzLDAuOTM1LDAuNzAzLDEuODU1LDAuNzAzLDEuODU1YzAuMzM0LDAuODg3LDEuMzMsMS4zMzQsMi4yMTksMC45OTZsMy4yMTQtMS4yMTZjMC44ODgtMC4zMzcsMS4zMzgtMS4zMzIsMC45OTktMi4yMTggIGwtMC41MTYtMS4zNjVjMCwwLTAuNTI1LTAuOSwwLjYtMS41MTFjMi4yNDItMS4yMiwzLjkzMi0zLjA3MSw1LjAyOC01LjM1N2MwLjIzMy0wLjQ5LDAuNTc3LTEuMTU2LDEuNjI2LTEuMTU2aDEuNjI3ICBjMC44OTYsMCwxLjYyNS0wLjcyOSwxLjYyNS0xLjYyNHYtNC44NzlDNDcsMjQuNzYxLDQ2LjI3MSwyNC4wMjksNDUuMzc1LDI0LjAyOXoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS13aWR0aD0iMiIvPjxwYXRoIGQ9Ik0zNi40OCwyNi45MjJjLTEuMDU5LDAtMS45MTYtMC44NTctMS45MTYtMS45MTRjMC0xLjA1NSwwLjg1Ny0xLjkxMiwxLjkxNi0xLjkxMmMxLjA1NiwwLDEuOTEsMC44NTcsMS45MSwxLjkxMiAgQzM4LjM5MSwyNi4wNjQsMzcuNTM2LDI2LjkyMiwzNi40OCwyNi45MjJ6Ii8+PHBhdGggZD0iICBNNi44MjYsMjMuMDk2YzAsMC0zLjgyNi0wLjg3Ni0zLjgyNi00LjMyN2MwLTEuNDE1LDAuNzE0LTIuNzE3LDEuOTYzLTMuMjU2IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=')

  const settings = new SettingsTab()(self._components.registry)
  swapPanelApi.addView('Settings', settingsTab.render())
  verticalIconApi.addIcon('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDUwIDUwIiBoZWlnaHQ9IjUwcHgiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MCA1MCIgd2lkdGg9IjUwcHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxyZWN0IGZpbGw9Im5vbmUiIGhlaWdodD0iNTAiIHdpZHRoPSI1MCIvPjxwYXRoIGQ9Ik00OSwyNy45NTR2LTZsLTcuMTQxLTEuMTY3ICBjLTAuNDIzLTEuNjkxLTEuMDg3LTMuMjgxLTEuOTYyLTQuNzM3bDQuMTYyLTUuOTMybC00LjI0My00LjI0MWwtNS44NTYsNC4yMWMtMS40Ni0wLjg4NC0zLjA2LTEuNTU4LTQuNzYzLTEuOTgybC0xLjI0NS03LjEwNmgtNiAgbC0xLjE1Niw3LjA4M2MtMS43MDQsMC40MTgtMy4zMTMsMS4wODMtNC43NzcsMS45NjNMMTAuMTgsNS44NzNsLTQuMjQzLDQuMjQxbDQuMTA3LDUuODc0Yy0wLjg4OCwxLjQ3LTEuNTYzLDMuMDc3LTEuOTkyLDQuNzkyICBMMSwyMS45NTR2Nmw3LjA0NCwxLjI0OWMwLjQyNSwxLjcxMSwxLjEwMSwzLjMxOCwxLjk5Miw0Ljc5bC00LjE2Myw1LjgyM2w0LjI0MSw0LjI0NWw1Ljg4MS00LjExOSAgYzEuNDY4LDAuODgyLDMuMDczLDEuNTUyLDQuNzc3LDEuOTczbDEuMTgsNy4wODdoNmwxLjI2MS03LjEwNWMxLjY5NS0wLjQzLDMuMjk3LTEuMTA1LDQuNzUxLTEuOTlsNS45MjIsNC4xNTVsNC4yNDItNC4yNDUgIGwtNC4yMjctNS44N2MwLjg3NS0xLjQ1NiwxLjUzOS0zLjA0OCwxLjk1OC00LjczOUw0OSwyNy45NTR6IE0yNSwzM2MtNC40MTgsMC04LTMuNTgyLTgtOHMzLjU4Mi04LDgtOHM4LDMuNTgyLDgsOFMyOS40MTgsMzMsMjUsMzMgIHoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==')

  self._components.iconpanel.appendChild(verticalIconComponent.render())
  self._components.iconpanel.event.register('resize', delta => self._adjustLayout('left', delta))

  self._components.swappanel.appendChild(swapPanelComponent.render())
  self._components.swappanel.event.register('resize', delta => self._adjustLayout('center', delta))

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

  // ----------------- Renderer -----------------
  var renderer = new Renderer()
  registry.put({api: renderer, name: 'renderer'})

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
