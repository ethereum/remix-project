/* global localStorage */
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
var Browserfiles = require('./app/files/browser-files')
var SharedFolder = require('./app/files/shared-folder')
var Config = require('./config')
var Renderer = require('./app/ui/renderer')
var examples = require('./app/editor/example-contracts')
var modalDialogCustom = require('./app/ui/modal-dialog-custom')
var FileManager = require('./app/files/fileManager')
var BasicReadOnlyExplorer = require('./app/files/basicReadOnlyExplorer')
var NotPersistedExplorer = require('./app/files/NotPersistedExplorer')
var toolTip = require('./app/ui/tooltip')
var CompilerMetadata = require('./app/files/compiler-metadata')
var CompilerImport = require('./app/compiler/compiler-imports')

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
import { UniversalDApp } from 'remix-lib'

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
  .sidepanel          {
    display            : flex;
    flex-direction     : column;
    position           : absolute;
    top                : 0;
    left               : 50px;
    bottom             : 0;
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
    // setup storage
    var fileStorage = new Storage('sol:')
    var configStorage = new Storage('config-v0.8:')

    // load app config
    const config = new Config(configStorage)
    registry.put({api: config, name: 'config'})

    // load file system
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
    self._components.resizeFeature = new PanelsResize('#side-panel', '#editor-container', { 'minWidth': 300, x: 450 })
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
    self._view.sidepanel = yo`
      <div id="side-panel" class=${css.sidepanel}>
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
        ${self._view.sidepanel}
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
  const workspace = JSON.parse(localStorage.getItem('workspace'))

  // SERVICES
  // ----------------- import content servive ----------------------------
  const contentImport = new CompilerImport()
  // ----------------- theme servive ----------------------------
  const themeModule = new ThemeModule(registry)
  registry.put({api: themeModule, name: 'themeModule'})
  // ----------------- editor servive ----------------------------
  const editor = new Editor({}, themeModule) // wrapper around ace editor
  registry.put({api: editor, name: 'editor'})
  editor.event.register('requiringToSaveCurrentfile', () => fileManager.saveCurrentFile())
  // ----------------- fileManager servive ----------------------------
  const fileManager = new FileManager(editor)
  registry.put({api: fileManager, name: 'filemanager'})
  // ----------------- compilation metadata generation servive ----------------------------
  const compilerMetadataGenerator = new CompilerMetadata(fileManager, registry.get('config').api)
  // ----------------- compilation result service (can keep track of compilation results) ----------------------------
  const compilersArtefacts = new CompilersArtefacts() // store all the compilation results (key represent a compiler name)
  registry.put({api: compilersArtefacts, name: 'compilersartefacts'})
  // ----------------- universal dapp: run transaction, listen on transactions, decode events
  const udapp = new UniversalDApp(registry.get('config').api)
  const {eventsDecoder, txlistener} = makeUdapp(udapp, compilersArtefacts, (domEl) => mainview.getTerminal().logHtml(domEl))
  // ----------------- network service (resolve network id / name) ----------------------------
  const networkModule = new NetworkModule()
  // ----------------- convert offset to line/column service ----------------------------
  var offsetToLineColumnConverter = new OffsetToLineColumnConverter()
  registry.put({api: offsetToLineColumnConverter, name: 'offsettolinecolumnconverter'})

  appManager.register([
    contentImport,
    themeModule,
    editor.sourceHighlighters,
    fileManager,
    compilerMetadataGenerator,
    compilersArtefacts,
    networkModule,
    offsetToLineColumnConverter
  ])

  // LAYOUT & SYSTEM VIEWS
  const appPanel = new MainPanel()
  const mainview = new MainView(editor, appPanel, fileManager, appManager, txlistener, eventsDecoder)
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
    registry.get('fileproviders/swarm').api,
    registry.get('filemanager').api,
    registry.get('fileproviders').api,
  )
  const run = new RunTab(
    udapp,
    registry.get('config').api,
    registry.get('filemanager').api,
    registry.get('editor').api,
    filePanel,
    registry.get('compilersartefacts').api,
    networkModule,
    mainview
  )
  const analysis = new AnalysisTab(registry)
  const debug = new DebuggerTab()
  const test = new TestTab(
    registry.get('filemanager').api,
    filePanel,
    compileTab,
    appManager
  )

  appManager.register([
    compileTab,
    run,
    debug,
    analysis,
    test,
    filePanel.remixdHandle,
    ...appManager.registeredPlugins()
  ])

  await appManager.activate(['contentImport', 'theme', 'sourceHighlighters', 'fileManager', 'compilerMetadata', 'compilerArtefacts', 'network', 'offsetToLineColumnConverter'])
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
