'use strict'

var isElectron = require('is-electron')
var csjs = require('csjs-inject')
var yo = require('yo-yo')
var remixLib = require('remix-lib')
var registry = require('./global/registry')
var Remixd = require('./lib/remixd')
var loadFileFromParent = require('./loadFilesFromParent')
var { OffsetToLineColumnConverter } = require('./lib/offsetToLineColumnConverter')
var QueryParams = require('./lib/query-params')
var GistHandler = require('./lib/gist-handler')
var Storage = remixLib.Storage
var RemixDProvider = require('./app/files/remixDProvider')
var Config = require('./config')
var Renderer = require('./app/ui/renderer')
var examples = require('./app/editor/example-contracts')
var modalDialogCustom = require('./app/ui/modal-dialog-custom')
var FileManager = require('./app/files/fileManager')
var FileProvider = require('./app/files/fileProvider')
var toolTip = require('./app/ui/tooltip')
var CompilerMetadata = require('./app/files/compiler-metadata')
var CompilerImport = require('./app/compiler/compiler-imports')

const Blockchain = require('./blockchain/blockchain.js')
const PluginUDapp = require('./blockchain/pluginUDapp.js')

const PluginManagerComponent = require('./app/components/plugin-manager-component')
const CompilersArtefacts = require('./app/compiler/compiler-artefacts')

const CompileTab = require('./app/tabs/compile-tab')
const SettingsTab = require('./app/tabs/settings-tab')
const AnalysisTab = require('./app/tabs/analysis-tab')
const DebuggerTab = require('./app/tabs/debugger-tab')
const TestTab = require('./app/tabs/test-tab')
const FilePanel = require('./app/panels/file-panel')
const Editor = require('./app/editor/editor')

import { RunTab, makeUdapp } from './app/udapp'

import PanelsResize from './lib/panels-resize'
import { RemixAppManager } from './remixAppManager'
import { FramingService } from './framingService'
import { MainView } from './app/panels/main-view'
import { ThemeModule } from './app/tabs/theme-module'
import { NetworkModule } from './app/tabs/network-module'
import { SidePanel } from './app/components/side-panel'
import { HiddenPanel } from './app/components/hidden-panel'
import { VerticalIcons } from './app/components/vertical-icons'
import { LandingPage } from './app/ui/landing-page/landing-page'
import { MainPanel } from './app/components/main-panel'

import migrateFileSystem from './migrateFileSystem'

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
  .remixIDE            {
    width              : 100vw;
    height             : 100vh;
    overflow           : hidden;
    flex-direction     : row;
    display            : flex;
  }
  .mainpanel           {
    display            : flex;
    flex-direction     : column;
    overflow           : hidden;
    flex               : 1;
  }
  .iconpanel           {
    display            : flex;
    flex-direction     : column;
    overflow           : hidden;
    width              : 50px;
    user-select        : none;
  }
  .sidepanel           {
    display            : flex;
    flex-direction     : row-reverse;
    width              : 320px;
  }
  .highlightcode       {
    position           : absolute;
    z-index            : 20;
    background-color   : var(--info);
  }
  .highlightcode_fullLine {
    position           : absolute;
    z-index            : 20;
    background-color   : var(--info);
    opacity            : 0.5;
  }
  .centered {
    position           : fixed;
    top                : 20%;
    left               : 45%;
    width              : 200px;
    height             : 200px;
  }
  .centered svg path {
    fill: var(--secondary);
  }
  .centered svg polygon {
    fill: var(--secondary);
  }
`

class App {
  constructor (api = {}, events = {}, opts = {}) {
    var self = this
    self._components = {}
    self._view = {}
    self._view.splashScreen = yo`<div class=${css.centered}><svg id="Ebene_2" data-name="Ebene 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 105 100">
    <title>remix_logo1</title>
    <path d="M91.84,35a.09.09,0,0,1-.1-.07,41,41,0,0,0-79.48,0,.09.09,0,0,1-.1.07C9.45,35,1,35.35,1,42.53c0,8.56,1,16,6,20.32,2.16,1.85,5.81,2.3,9.27,2.22a44.4,44.4,0,0,0,6.45-.68.09.09,0,0,0,.06-.15A34.81,34.81,0,0,1,17,45c0-.1,0-.21,0-.31a35,35,0,0,1,70,0c0,.1,0,.21,0,.31a34.81,34.81,0,0,1-5.78,19.24.09.09,0,0,0,.06.15,44.4,44.4,0,0,0,6.45.68c3.46.08,7.11-.37,9.27-2.22,5-4.27,6-11.76,6-20.32C103,35.35,94.55,35,91.84,35Z"/>
    <path d="M52,74,25.4,65.13a.1.1,0,0,0-.1.17L51.93,91.93a.1.1,0,0,0,.14,0L78.7,65.3a.1.1,0,0,0-.1-.17L52,74A.06.06,0,0,1,52,74Z"/>
    <path d="M75.68,46.9,82,45a.09.09,0,0,0,.08-.09,29.91,29.91,0,0,0-.87-6.94.11.11,0,0,0-.09-.08l-6.43-.58a.1.1,0,0,1-.06-.18l4.78-4.18a.13.13,0,0,0,0-.12,30.19,30.19,0,0,0-3.65-6.07.09.09,0,0,0-.11,0l-5.91,2a.1.1,0,0,1-.12-.14L72.19,23a.11.11,0,0,0,0-.12,29.86,29.86,0,0,0-5.84-4.13.09.09,0,0,0-.11,0l-4.47,4.13a.1.1,0,0,1-.17-.07l.09-6a.1.1,0,0,0-.07-.1,30.54,30.54,0,0,0-7-1.47.1.1,0,0,0-.1.07l-2.38,5.54a.1.1,0,0,1-.18,0l-2.37-5.54a.11.11,0,0,0-.11-.06,30,30,0,0,0-7,1.48.12.12,0,0,0-.07.1l.08,6.05a.09.09,0,0,1-.16.07L37.8,18.76a.11.11,0,0,0-.12,0,29.75,29.75,0,0,0-5.83,4.13.11.11,0,0,0,0,.12l2.59,5.6a.11.11,0,0,1-.13.14l-5.9-2a.11.11,0,0,0-.12,0,30.23,30.23,0,0,0-3.62,6.08.11.11,0,0,0,0,.12l4.79,4.19a.1.1,0,0,1-.06.17L23,37.91a.1.1,0,0,0-.09.07A29.9,29.9,0,0,0,22,44.92a.1.1,0,0,0,.07.1L28.4,47a.1.1,0,0,1,0,.18l-5.84,3.26a.16.16,0,0,0,0,.11,30.17,30.17,0,0,0,2.1,6.76c.32.71.67,1.4,1,2.08a.1.1,0,0,0,.06,0L52,68.16H52l26.34-8.78a.1.1,0,0,0,.06-.05,30.48,30.48,0,0,0,3.11-8.88.1.1,0,0,0-.05-.11l-5.83-3.26A.1.1,0,0,1,75.68,46.9Z"/>
    </svg>
    <div class="info-secondary" style="text-align:center">
      REMIX IDE
    </div>
    </div>`
    document.body.appendChild(self._view.splashScreen)

    // setup storage
    var configStorage = new Storage('config-v0.8:')

    // load app config
    const config = new Config(configStorage)
    registry.put({api: config, name: 'config'})

    // load file system
    self._components.filesProviders = {}
    self._components.filesProviders['browser'] = new FileProvider('browser')
    registry.put({api: self._components.filesProviders['browser'], name: 'fileproviders/browser'})

    var remixd = new Remixd(65520)
    registry.put({api: remixd, name: 'remixd'})
    remixd.event.register('system', (message) => {
      if (message.error) toolTip(message.error)
    })

    self._components.filesProviders['localhost'] = new RemixDProvider(remixd)
    registry.put({api: self._components.filesProviders['localhost'], name: 'fileproviders/localhost'})
    registry.put({api: self._components.filesProviders, name: 'fileproviders'})

    migrateFileSystem(self._components.filesProviders['browser'])
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
      <div id="icon-panel" data-id="remixIdeIconPanel" class="${css.iconpanel} bg-light">
      ${''}
      </div>
    `

    // center panel, resizable
    self._view.sidepanel = yo`
      <div id="side-panel" data-id="remixIdeSidePanel" style="min-width: 320px;" class=${css.sidepanel}>
        ${''}
      </div>
    `

    // handle the editor + terminal
    self._view.mainpanel = yo`
      <div id="main-panel" data-id="remixIdeMainPanel" class=${css.mainpanel}>
        ${''}
      </div>
    `

    self._components.resizeFeature = new PanelsResize(self._view.sidepanel)

    self._view.el = yo`
      <div style="visibility:hidden" class=${css.remixIDE}>
        ${self._view.iconpanel}
        ${self._view.sidepanel}
        ${self._components.resizeFeature.render()}
        ${self._view.mainpanel}
      </div>
    `
    return self._view.el
  }
}

module.exports = App

async function run () {
  var self = this

  // check the origin and warn message
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

  // workaround for Electron support
  if (!isElectron()) {
    // Oops! Accidentally trigger refresh or bookmark.
    window.onbeforeunload = function () {
      return 'Are you sure you want to leave?'
    }
  }

  // APP_MANAGER
  const appManager = new RemixAppManager({})
  const workspace = appManager.pluginLoader.get()

  // SERVICES
  // ----------------- import content servive ----------------------------
  const contentImport = new CompilerImport()
  // ----------------- theme servive ----------------------------
  const themeModule = new ThemeModule(registry)
  registry.put({api: themeModule, name: 'themeModule'})
  themeModule.initTheme(() => {
    setTimeout(() => {
      document.body.removeChild(self._view.splashScreen)
      self._view.el.style.visibility = 'visible'
    }, 1500)
  })
  // ----------------- editor servive ----------------------------
  const editor = new Editor({}, themeModule) // wrapper around ace editor
  registry.put({api: editor, name: 'editor'})
  editor.event.register('requiringToSaveCurrentfile', () => fileManager.saveCurrentFile())
  // ----------------- fileManager servive ----------------------------
  const fileManager = new FileManager(editor)
  registry.put({api: fileManager, name: 'filemanager'})

  const blockchain = new Blockchain(registry.get('config').api)
  const pluginUdapp = new PluginUDapp(blockchain)

  // ----------------- compilation metadata generation servive ----------------------------
  const compilerMetadataGenerator = new CompilerMetadata(blockchain, fileManager, registry.get('config').api)
  // ----------------- compilation result service (can keep track of compilation results) ----------------------------
  const compilersArtefacts = new CompilersArtefacts() // store all the compilation results (key represent a compiler name)
  registry.put({api: compilersArtefacts, name: 'compilersartefacts'})

  const {eventsDecoder, txlistener} = makeUdapp(blockchain, compilersArtefacts, (domEl) => mainview.getTerminal().logHtml(domEl))
  // ----------------- network service (resolve network id / name) ----------------------------
  const networkModule = new NetworkModule(blockchain)
  // ----------------- convert offset to line/column service ----------------------------
  var offsetToLineColumnConverter = new OffsetToLineColumnConverter()
  registry.put({api: offsetToLineColumnConverter, name: 'offsettolinecolumnconverter'})

  appManager.register([
    contentImport,
    themeModule,
    editor,
    fileManager,
    compilerMetadataGenerator,
    compilersArtefacts,
    networkModule,
    offsetToLineColumnConverter
  ])

  // LAYOUT & SYSTEM VIEWS
  const appPanel = new MainPanel()
  const mainview = new MainView(editor, appPanel, fileManager, appManager, txlistener, eventsDecoder, blockchain)
  registry.put({ api: mainview, name: 'mainview' })

  appManager.register([
    appPanel
  ])

  // those views depend on app_manager
  const menuicons = new VerticalIcons(appManager)
  const landingPage = new LandingPage(appManager, menuicons)
  const sidePanel = new SidePanel(appManager, menuicons)
  const hiddenPanel = new HiddenPanel()
  const pluginManagerComponent = new PluginManagerComponent(appManager)
  const filePanel = new FilePanel(appManager)
  let settings = new SettingsTab(
    registry.get('config').api,
    editor,
    appManager
  )

  // adding Views to the DOM
  self._view.mainpanel.appendChild(mainview.render())
  self._view.iconpanel.appendChild(menuicons.render())
  self._view.sidepanel.appendChild(sidePanel.render())
  document.body.appendChild(hiddenPanel.render()) // Hidden Panel is display none, it can be directly on body

  appManager.register([
    menuicons,
    landingPage,
    sidePanel,
    pluginManagerComponent,
    filePanel,
    settings
  ])

  // CONTENT VIEWS & DEFAULT PLUGINS
  const compileTab = new CompileTab(
    editor,
    registry.get('config').api,
    new Renderer(),
    registry.get('fileproviders/browser').api,
    registry.get('filemanager').api
  )
  const run = new RunTab(
    blockchain,
    pluginUdapp,
    registry.get('config').api,
    registry.get('filemanager').api,
    registry.get('editor').api,
    filePanel,
    registry.get('compilersartefacts').api,
    networkModule,
    mainview
  )
  const analysis = new AnalysisTab(registry)
  const debug = new DebuggerTab(blockchain)
  const test = new TestTab(
    registry.get('filemanager').api,
    filePanel,
    compileTab,
    appManager,
    new Renderer()
  )

  appManager.register([
    compileTab,
    run,
    debug,
    analysis,
    test,
    filePanel.remixdHandle
  ])

  try {
    appManager.register(await appManager.registeredPlugins())
  } catch (e) {
    console.log('couldn\'t register iframe plugins', e.message)
  }

  await appManager.activate(['contentImport', 'theme', 'editor', 'fileManager', 'compilerMetadata', 'compilerArtefacts', 'network', 'offsetToLineColumnConverter'])
  await appManager.activate(['mainPanel'])
  await appManager.activate(['menuicons', 'home', 'sidePanel', 'pluginManager', 'fileExplorers', 'settings'])

  // Set workspace after initial activation
  if (Array.isArray(workspace)) await appManager.activate(workspace)

  // Load and start the service who manager layout and frame
  const framingService = new FramingService(sidePanel, menuicons, mainview, this._components.resizeFeature)
  framingService.start()

  // get the file list from the parent iframe
  loadFileFromParent(fileManager)

  // get the file from gist
  const gistHandler = new GistHandler()
  const queryParams = new QueryParams()
  const loadedFromGist = gistHandler.loadFromGist(queryParams.get(), fileManager)
  if (!loadedFromGist) {
    // insert example contracts if there are no files to show
    self._components.filesProviders['browser'].resolveDirectory('/', (error, filesList) => {
      if (error) console.error(error)
      if (Object.keys(filesList).length === 0) {
        for (let file in examples) {
          fileManager.setFile(examples[file].name, examples[file].content)
        }
      }
    })
  }

  if (isElectron()) {
    appManager.activate(['remixd'])
  }
}
