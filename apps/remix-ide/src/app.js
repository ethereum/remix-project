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
const Terminal = require('./app/panels/terminal')
const ContextualListener = require('./app/editor/contextualListener')
import { basicLogo } from './app/ui/svgLogo'

import { RunTab, makeUdapp } from './app/udapp'

import PanelsResize from './lib/panels-resize'
import { Engine } from '@remixproject/engine'
import { RemixAppManager } from './remixAppManager'
import { FramingService } from './framingService'
import { MainView } from './app/panels/main-view'
import { ThemeModule } from './app/tabs/theme-module'
import { NetworkModule } from './app/tabs/network-module'
import { Web3ProviderModule } from './app/tabs/web3-provider'
import { SidePanel } from './app/components/side-panel'
import { HiddenPanel } from './app/components/hidden-panel'
import { VerticalIcons } from './app/components/vertical-icons'
import { LandingPage } from './app/ui/landing-page/landing-page'
import { MainPanel } from './app/components/main-panel'
import FetchAndCompile from './app/compiler/compiler-sourceVerifier-fetchAndCompile'

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
    self._view.splashScreen = yo`
    <div class=${css.centered}>
      ${basicLogo()}
      <div class="info-secondary" style="text-align:center">
        REMIX IDE
      </div>
      </div>
    `
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
      <div id="side-panel" data-id="remixIdeSidePanel" style="min-width: 320px;" class="${css.sidepanel} border-right border-left">
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
      <div style="visibility:hidden" class=${css.remixIDE} data-id="remixIDE">
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

  const hosts = ['127.0.0.1:8080', '192.168.0.101:8080', 'localhost:8080']
  // workaround for Electron support
  if (!isElectron() && !hosts.includes(window.location.host)) {
    // Oops! Accidentally trigger refresh or bookmark.
    window.onbeforeunload = function () {
      return 'Are you sure you want to leave?'
    }
  }

  // APP_MANAGER
  const appManager = new RemixAppManager({})
  const workspace = appManager.pluginLoader.get()
  const engine = new Engine(appManager)
  await engine.onload()

  // SERVICES
  // ----------------- import content servive ------------------------
  const contentImport = new CompilerImport()
  // ----------------- theme servive ---------------------------------
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

  // ----------------- compilation metadata generation servive ---------
  const compilerMetadataGenerator = new CompilerMetadata(blockchain, fileManager, registry.get('config').api)
  // ----------------- compilation result service (can keep track of compilation results) ----------------------------
  const compilersArtefacts = new CompilersArtefacts() // store all the compilation results (key represent a compiler name)
  registry.put({api: compilersArtefacts, name: 'compilersartefacts'})

  // service which fetch contract artifacts from sourve-verify, put artifacts in remix and compile it
  const fetchAndCompile = new FetchAndCompile()
  // ----------------- network service (resolve network id / name) -----
  const networkModule = new NetworkModule(blockchain)
  // ----------------- represent the current selected web3 provider ----
  const web3Provider = new Web3ProviderModule(blockchain)
  // ----------------- convert offset to line/column service -----------
  const offsetToLineColumnConverter = new OffsetToLineColumnConverter()
  registry.put({api: offsetToLineColumnConverter, name: 'offsettolinecolumnconverter'})

  // -------------------Terminal----------------------------------------

  const terminal = new Terminal(
    { appManager, blockchain },
    {
      getPosition: (event) => {
        var limitUp = 36
        var limitDown = 20
        var height = window.innerHeight
        var newpos = (event.pageY < limitUp) ? limitUp : event.pageY
        newpos = (newpos < height - limitDown) ? newpos : height - limitDown
        return height - newpos
      }
    }
  )
  makeUdapp(blockchain, compilersArtefacts, (domEl) => terminal.logHtml(domEl))

  const contextualListener = new ContextualListener({editor})

  engine.register([
    contentImport,
    themeModule,
    editor,
    fileManager,
    compilerMetadataGenerator,
    compilersArtefacts,
    networkModule,
    offsetToLineColumnConverter,
    contextualListener,
    terminal,
    web3Provider,
    fetchAndCompile
  ])

  // LAYOUT & SYSTEM VIEWS
  const appPanel = new MainPanel()
  const mainview = new MainView(contextualListener, editor, appPanel, fileManager, appManager, terminal)
  registry.put({ api: mainview, name: 'mainview' })

  engine.register(appPanel)

  // those views depend on app_manager
  const menuicons = new VerticalIcons(appManager)
  const landingPage = new LandingPage(appManager, menuicons)
  const sidePanel = new SidePanel(appManager, menuicons)
  const hiddenPanel = new HiddenPanel()
  const pluginManagerComponent = new PluginManagerComponent(appManager, engine)
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

  engine.register([
    menuicons,
    landingPage,
    hiddenPanel,
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
    mainview,
    registry.get('fileproviders/browser').api,
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

  engine.register([
    compileTab,
    run,
    debug,
    analysis,
    test,
    filePanel.remixdHandle
  ])

  try {
    engine.register(await appManager.registeredPlugins())
  } catch (e) {
    console.log('couldn\'t register iframe plugins', e.message)
  }

  await appManager.activatePlugin(['contentImport', 'theme', 'editor', 'fileManager', 'compilerMetadata', 'compilerArtefacts', 'network', 'web3Provider', 'offsetToLineColumnConverter'])
  await appManager.activatePlugin(['mainPanel', 'menuicons'])
  await appManager.activatePlugin(['home', 'sidePanel', 'hiddenPanel', 'pluginManager', 'fileExplorers', 'settings', 'contextualListener', 'scriptRunner', 'terminal', 'fetchAndCompile'])

  // Set workspace after initial activation
  if (Array.isArray(workspace)) await appManager.activatePlugin(workspace)

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
    appManager.activatePlugin('remixd')
  }
}
