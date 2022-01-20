'use strict'
import { RunTab, makeUdapp } from './app/udapp'
import { RemixEngine } from './remixEngine'
import { RemixAppManager } from './remixAppManager'
import { ThemeModule } from './app/tabs/theme-module'
import { NetworkModule } from './app/tabs/network-module'
import { Web3ProviderModule } from './app/tabs/web3-provider'
import { SidePanel } from './app/components/side-panel'
import { HiddenPanel } from './app/components/hidden-panel'
import { VerticalIcons } from './app/components/vertical-icons'
import { LandingPage } from './app/ui/landing-page/landing-page'
import { MainPanel } from './app/components/main-panel'
import { PermissionHandlerPlugin } from './app/plugins/permission-handler-plugin'

import { WalkthroughService } from './walkthroughService'

import { OffsetToLineColumnConverter, CompilerMetadata, CompilerArtefacts, FetchAndCompile, CompilerImports, EditorContextListener, GistHandler } from '@remix-project/core-plugin'

import Registry from './app/state/registry'
import { ConfigPlugin } from './app/plugins/config'
import { Layout } from './app/panels/layout'
import { ModalPlugin } from './app/plugins/modal'
import { Blockchain } from './blockchain/blockchain.js'
import { HardhatProvider } from './app/tabs/hardhat-provider'

const isElectron = require('is-electron')

const remixLib = require('@remix-project/remix-lib')

const QueryParams = require('./lib/query-params')
const Storage = remixLib.Storage
const RemixDProvider = require('./app/files/remixDProvider')
const Config = require('./config')

const FileManager = require('./app/files/fileManager')
const FileProvider = require('./app/files/fileProvider')
const DGitProvider = require('./app/files/dgitProvider')
const WorkspaceFileProvider = require('./app/files/workspaceFileProvider')

const PluginManagerComponent = require('./app/components/plugin-manager-component')

const CompileTab = require('./app/tabs/compile-tab')
const SettingsTab = require('./app/tabs/settings-tab')
const AnalysisTab = require('./app/tabs/analysis-tab')
const { DebuggerTab } = require('./app/tabs/debugger-tab')
const TestTab = require('./app/tabs/test-tab')
const FilePanel = require('./app/panels/file-panel')
const Editor = require('./app/editor/editor')
const Terminal = require('./app/panels/terminal')
const { TabProxy } = require('./app/panels/tab-proxy.js')

class AppComponent {
  constructor () {
    const self = this
    self.appManager = new RemixAppManager({})
    self.queryParams = new QueryParams()
    self._components = {}
    // setup storage
    const configStorage = new Storage('config-v0.8:')

    // load app config
    const config = new Config(configStorage)
    Registry.getInstance().put({ api: config, name: 'config' })

    // load file system
    self._components.filesProviders = {}
    self._components.filesProviders.browser = new FileProvider('browser')
    Registry.getInstance().put({
      api: self._components.filesProviders.browser,
      name: 'fileproviders/browser'
    })
    self._components.filesProviders.localhost = new RemixDProvider(
      self.appManager
    )
    Registry.getInstance().put({
      api: self._components.filesProviders.localhost,
      name: 'fileproviders/localhost'
    })
    self._components.filesProviders.workspace = new WorkspaceFileProvider()
    Registry.getInstance().put({
      api: self._components.filesProviders.workspace,
      name: 'fileproviders/workspace'
    })

    Registry.getInstance().put({
      api: self._components.filesProviders,
      name: 'fileproviders'
    })
  }

  async run () {
    const self = this
    // APP_MANAGER
    const appManager = self.appManager
    const pluginLoader = self.appManager.pluginLoader
    self.panels = {}
    self.workspace = pluginLoader.get()
    self.engine = new RemixEngine()
    self.engine.register(appManager)

    const matomoDomains = {
      'remix-alpha.ethereum.org': 27,
      'remix-beta.ethereum.org': 25,
      'remix.ethereum.org': 23
    }
    self.showMatamo =
      matomoDomains[window.location.hostname] &&
      !Registry.getInstance()
        .get('config')
        .api.exists('settings/matomo-analytics')
    self.walkthroughService = new WalkthroughService(
      appManager,
      self.showMatamo
    )

    const hosts = ['127.0.0.1:8080', '192.168.0.101:8080', 'localhost:8080']
    // workaround for Electron support
    if (!isElectron() && !hosts.includes(window.location.host)) {
      // Oops! Accidentally trigger refresh or bookmark.
      window.onbeforeunload = function () {
        return 'Are you sure you want to leave?'
      }
    }

    // SERVICES
    // ----------------- gist service ---------------------------------
    self.gistHandler = new GistHandler()
    // ----------------- theme service ---------------------------------
    self.themeModule = new ThemeModule()
    Registry.getInstance().put({ api: self.themeModule, name: 'themeModule' })

    // ----------------- editor service ----------------------------
    const editor = new Editor() // wrapper around ace editor
    Registry.getInstance().put({ api: editor, name: 'editor' })
    editor.event.register('requiringToSaveCurrentfile', () =>
      fileManager.saveCurrentFile()
    )

    // ----------------- fileManager service ----------------------------
    const fileManager = new FileManager(editor, appManager)
    Registry.getInstance().put({ api: fileManager, name: 'filemanager' })
    // ----------------- dGit provider ---------------------------------
    const dGitProvider = new DGitProvider()

    // ----------------- import content service ------------------------
    const contentImport = new CompilerImports()

    const blockchain = new Blockchain(Registry.getInstance().get('config').api)

    // ----------------- compilation metadata generation service ---------
    const compilerMetadataGenerator = new CompilerMetadata()
    // ----------------- compilation result service (can keep track of compilation results) ----------------------------
    const compilersArtefacts = new CompilerArtefacts() // store all the compilation results (key represent a compiler name)
    Registry.getInstance().put({
      api: compilersArtefacts,
      name: 'compilersartefacts'
    })

    // service which fetch contract artifacts from sourve-verify, put artifacts in remix and compile it
    const fetchAndCompile = new FetchAndCompile()
    // ----------------- network service (resolve network id / name) -----
    const networkModule = new NetworkModule(blockchain)
    // ----------------- represent the current selected web3 provider ----
    const web3Provider = new Web3ProviderModule(blockchain)
    const hardhatProvider = new HardhatProvider(blockchain)
    // ----------------- convert offset to line/column service -----------
    const offsetToLineColumnConverter = new OffsetToLineColumnConverter()
    Registry.getInstance().put({
      api: offsetToLineColumnConverter,
      name: 'offsettolinecolumnconverter'
    })

    // -------------------Terminal----------------------------------------
    makeUdapp(blockchain, compilersArtefacts, domEl => terminal.logHtml(domEl))
    const terminal = new Terminal(
      { appManager, blockchain },
      {
        getPosition: event => {
          const limitUp = 36
          const limitDown = 20
          const height = window.innerHeight
          let newpos = event.pageY < limitUp ? limitUp : event.pageY
          newpos = newpos < height - limitDown ? newpos : height - limitDown
          return height - newpos
        }
      }
    )
    const contextualListener = new EditorContextListener()

    self.modal = new ModalPlugin()

    const configPlugin = new ConfigPlugin()
    self.layout = new Layout()
    
    const permissionHandler = new PermissionHandlerPlugin()

    self.engine.register([
      permissionHandler,
      self.layout,
      self.modal,
      self.gistHandler,
      configPlugin,
      blockchain,
      contentImport,
      self.themeModule,
      editor,
      fileManager,
      compilerMetadataGenerator,
      compilersArtefacts,
      networkModule,
      offsetToLineColumnConverter,
      contextualListener,
      terminal,
      web3Provider,
      fetchAndCompile,
      dGitProvider,
      hardhatProvider,
      self.walkthroughService
    ])

    // LAYOUT & SYSTEM VIEWS
    const appPanel = new MainPanel()
    Registry.getInstance().put({ api: self.mainview, name: 'mainview' })
    const tabProxy = new TabProxy(fileManager, editor)
    self.engine.register([appPanel, tabProxy])

    // those views depend on app_manager
    self.menuicons = new VerticalIcons()
    self.sidePanel = new SidePanel()
    self.hiddenPanel = new HiddenPanel()

    const pluginManagerComponent = new PluginManagerComponent(
      appManager,
      self.engine
    )
    const filePanel = new FilePanel(appManager)
    const landingPage = new LandingPage(
      appManager,
      self.menuicons,
      fileManager,
      filePanel,
      contentImport
    )
    self.settings = new SettingsTab(
      Registry.getInstance().get('config').api,
      editor,
      appManager
    )

    self.engine.register([
      self.menuicons,
      landingPage,
      self.hiddenPanel,
      self.sidePanel,
      filePanel,
      pluginManagerComponent,
      self.settings
    ])

    // CONTENT VIEWS & DEFAULT PLUGINS
    const compileTab = new CompileTab(
      Registry.getInstance().get('config').api,
      Registry.getInstance().get('filemanager').api
    )
    const run = new RunTab(
      blockchain,
      Registry.getInstance().get('config').api,
      Registry.getInstance().get('filemanager').api,
      Registry.getInstance().get('editor').api,
      filePanel,
      Registry.getInstance().get('compilersartefacts').api,
      networkModule,
      Registry.getInstance().get('fileproviders/browser').api
    )
    const analysis = new AnalysisTab()
    const debug = new DebuggerTab()
    const test = new TestTab(
      Registry.getInstance().get('filemanager').api,
      Registry.getInstance().get('offsettolinecolumnconverter').api,
      filePanel,
      compileTab,
      appManager,
      contentImport
    )

    self.engine.register([
      compileTab,
      run,
      debug,
      analysis,
      test,
      filePanel.remixdHandle,
      filePanel.gitHandle,
      filePanel.hardhatHandle,
      filePanel.slitherHandle
    ])

    self.layout.panels = {
      tabs: { plugin: tabProxy, active: true },
      editor: { plugin: editor, active: true },
      main: { plugin: appPanel, active: false },
      terminal: { plugin: terminal, active: true, minimized: false }
    }
  }

  async activate () {
    const queryParams = new QueryParams()
    const params = queryParams.get()
    const self = this

    if (isElectron()) {
      self.appManager.activatePlugin('remixd')
    }

    try {
      self.engine.register(await self.appManager.registeredPlugins())
    } catch (e) {
      console.log("couldn't register iframe plugins", e.message)
    }
    await self.appManager.activatePlugin(['layout'])
    await self.appManager.activatePlugin(['notification'])
    await self.appManager.activatePlugin(['editor'])
    await self.appManager.activatePlugin(['permissionhandler', 'theme', 'fileManager', 'compilerMetadata', 'compilerArtefacts', 'network', 'web3Provider', 'offsetToLineColumnConverter'])
    await self.appManager.activatePlugin(['mainPanel', 'menuicons', 'tabs'])
    await self.appManager.activatePlugin(['sidePanel']) // activating  host plugin separately
    await self.appManager.activatePlugin(['home'])
    await self.appManager.activatePlugin(['settings', 'config'])
    await self.appManager.activatePlugin(['hiddenPanel', 'pluginManager', 'contextualListener', 'terminal', 'blockchain', 'fetchAndCompile', 'contentImport', 'gistHandler'])
    await self.appManager.activatePlugin(['settings'])
    await self.appManager.activatePlugin(['walkthrough'])

    self.appManager.on(
      'filePanel',
      'workspaceInitializationCompleted',
      async () => {
        await self.appManager.registerContextMenuItems()
      }
    )

    await self.appManager.activatePlugin(['filePanel'])
    // Set workspace after initial activation
    self.appManager.on('editor', 'editorMounted', () => {
      if (Array.isArray(self.workspace)) {
        self.appManager
          .activatePlugin(self.workspace)
          .then(async () => {
            try {
              if (params.deactivate) {
                await self.appManager.deactivatePlugin(
                  params.deactivate.split(',')
                )
              }
            } catch (e) {
              console.log(e)
            }
            if (params.code) {
              // if code is given in url we focus on solidity plugin
              self.menuicons.select('solidity')
            } else {
              // If plugins are loaded from the URL params, we focus on the last one.
              if (
                self.appManager.pluginLoader.current === 'queryParams' &&
                self.workspace.length > 0
              ) { self.menuicons.select(self.workspace[self.workspace.length - 1]) }
            }

            if (params.call) {
              const callDetails = params.call.split('//')
              if (callDetails.length > 1) {
                self.appManager.call('notification', 'toast', `initiating ${callDetails[0]} ...`)
                // @todo(remove the timeout when activatePlugin is on 0.3.0)
                self.appManager.call(...callDetails).catch(console.error)
              }
            }
          })
          .catch(console.error)
      }
    })
    // activate solidity plugin
    self.appManager.activatePlugin(['solidity', 'udapp'])
    // Load and start the service who manager layout and frame
  }
}

export default AppComponent
