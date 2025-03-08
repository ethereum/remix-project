import {PluginManager} from '@remixproject/engine'
import {EventEmitter} from 'events'
import {QueryParams} from '@remix-project/remix-lib'
import {IframePlugin} from '@remixproject/engine-web'
import {Registry} from '@remix-project/remix-lib'

const _paq = (window._paq = window._paq || [])

// requiredModule removes the plugin from the plugin manager list on UI
let requiredModules = [
  // services + layout views + system views
  'manager',
  'config',
  'compilerArtefacts',
  'compilerMetadata',
  'compilerloader',
  'contextualListener',
  'editor',
  'offsetToLineColumnConverter',
  'network',
  'theme',
  'locale',
  'fileManager',
  'contentImport',
  'blockchain',
  'web3Provider',
  'scriptRunner',
  'scriptRunnerBridge',
  'fetchAndCompile',
  'mainPanel',
  'hiddenPanel',
  'sidePanel',
  'menuicons',
  'filePanel',
  'terminal',
  'statusBar',
  'settings',
  'pluginManager',
  'tabs',
  'udapp',
  'dgitApi',
  'solidity',
  'solidity-logic',
  'gistHandler',
  'layout',
  'notification',
  'permissionhandler',
  'walkthrough',
  'storage',
  'restorebackupzip',
  'link-libraries',
  'deploy-libraries',
  'openzeppelin-proxy',
  'hardhat-provider',
  'ganache-provider',
  'foundry-provider',
  'basic-http-provider',
  'vm-custom-fork',
  'vm-goerli-fork',
  'vm-mainnet-fork',
  'vm-sepolia-fork',
  'vm-paris',
  'vm-london',
  'vm-berlin',
  'vm-shanghai',
  'compileAndRun',
  'search',
  'recorder',
  'fileDecorator',
  'codeParser',
  'codeFormatter',
  'solidityumlgen',
  'compilationDetails',
  'vyperCompilationDetails',
  'contractflattener',
  'solidity-script',
  'home',
  'doc-viewer',
  // 'doc-gen',
  'remix-templates',
  'remixAID',
  'solhint',
  'dgit',
  'pinnedPanel',
  'pluginStateLogger',
  'environmentExplorer',
  'templateSelection',
  'matomo',
  'walletconnect',
  'popupPanel',
  'remixAI',
  'remixAID'
]

// dependentModules shouldn't be manually activated (e.g hardhat is activated by remixd)
const dependentModules = ['foundry', 'hardhat', 'truffle', 'slither']

const loadLocalPlugins = ['doc-gen', 'doc-viewer', 'contract-verification', 'vyper', 'solhint', 'walletconnect', 'circuit-compiler', 'learneth', 'quick-dapp', 'noir-compiler']

const partnerPlugins = ['cookbookdev']

const sensitiveCalls = {
  fileManager: ['writeFile', 'copyFile', 'rename', 'copyDir'],
  contentImport: ['resolveAndSave'],
  web3Provider: ['sendAsync'],
}

const isInjectedProvider = (name) => {
  return name.startsWith('injected')
}

const isVM = (name) => {
  return name.startsWith('vm')
}

const isScriptRunner = (name) => {
  return name.startsWith('scriptRunner')
}

export function isNative(name) {

  // nativePlugin allows to bypass the permission request
  const nativePlugins = [
    'vyper',
    'workshops',
    'debugger',
    'remixd',
    'menuicons',
    'solidity',
    'solidity-logic',
    'solidityStaticAnalysis',
    'solhint',
    'solidityUnitTesting',
    'layout',
    'statusBar',
    'notification',
    'hardhat-provider',
    'ganache-provider',
    'foundry-provider',
    'basic-http-provider',
    'tabs',
    'doc-gen',
    'doc-viewer',
    'circuit-compiler',
    'compilationDetails',
    'vyperCompilationDetails',
    'remixGuide',
    'environmentExplorer',
    'templateSelection',
    'walletconnect',
    'contract-verification',
    'popupPanel',
    'LearnEth',
    'noir-compiler'
  ]
  return nativePlugins.includes(name) || requiredModules.includes(name) || isInjectedProvider(name) || isVM(name) || isScriptRunner(name)
}

/**
 * Checks if plugin caller 'from' is allowed to activate plugin 'to'
 * The caller can have 'canActivate' as an optional property in the plugin profile.
 * This is an array containing the 'name' property of the plugin it wants to call.
 * canActivate = ['plugin1-to-call','plugin2-to-call',....]
 * or the plugin is allowed by default because it is native
 *
 * @param {any, any}
 * @returns {boolean}
 */
export function canActivate(from, to) {
  return ['ethdoc'].includes(from.name) || isNative(from.name) || (to && from && from.canActivate && from.canActivate.includes(to.name))
}

export class RemixAppManager extends PluginManager {
  constructor() {
    super()
    this.event = new EventEmitter()
    this.pluginsDirectory = 'https://raw.githubusercontent.com/ethereum/remix-plugins-directory/master/build/metadata.json'
    this.pluginLoader = new PluginLoader()
    if (Registry.getInstance().get('platform').api.isDesktop()) {
      requiredModules = [...requiredModules, 'fs', 'electronTemplates', 'isogit', 'remix-templates', 'electronconfig', 'xterm', 'compilerloader', 'ripgrep', 'slither', 'remixAID', 'circom']
    }
  }

  async canActivatePlugin(from, to) {
    return canActivate(from, to)
  }

  async canDeactivatePlugin(from, to) {
    if (this.isRequired(to.name)) return false
    return isNative(from.name)
  }

  async canDeactivate(from, to) {
    return this.canDeactivatePlugin(from, to)
  }

  async deactivatePlugin(name) {
    const profile = await this.getProfile(name)
    const [to, from] = [profile, await this.getProfile(this.requestFrom)]
    if (this.canDeactivatePlugin(from, to)) {
      if (profile.methods.includes('deactivate')) {
        try {
          await this.call(name, 'deactivate')
        } catch (e) {
          console.log(e)
        }
      }
      await this.toggleActive(name)
    }else{
      console.log('cannot deactivate', name)
    }
  }

  async canCall(from, to, method, message) {
    const isSensitiveCall = sensitiveCalls[to] && sensitiveCalls[to].includes(method)
    // Make sure the caller of this methods is the target plugin
    if (to !== this.currentRequest.from) {
      return false
    }
    // skipping native plugins' requests
    if (isNative(from)) {
      return true
    }

    // skipping partner plugins' requests
    if (partnerPlugins[from]) {
      return true
    }

    // ask the user for permission
    return await this.call('permissionhandler', 'askPermission', this.profiles[from], this.profiles[to], method, message, isSensitiveCall)
  }

  onPluginActivated(plugin) {
    this.pluginLoader.set(
      plugin,
      this.actives.filter((plugin) => !this.isDependent(plugin))
    )
    this.event.emit('activate', plugin)
    this.emit('activate', plugin)
    if (!this.isRequired(plugin.name)) _paq.push(['trackEvent', 'pluginManager', 'activate', plugin.name])
  }

  getAll() {
    return Object.keys(this.profiles).map((p) => {
      return this.profiles[p]
    })
  }

  getIds() {
    return Object.keys(this.profiles)
  }

  onPluginDeactivated(plugin) {
    this.pluginLoader.set(
      plugin,
      this.actives.filter((plugin) => !this.isDependent(plugin))
    )
    this.event.emit('deactivate', plugin)
    _paq.push(['trackEvent', 'pluginManager', 'deactivate', plugin.name])
  }

  isDependent(name) {
    return dependentModules.includes(name)
  }

  isRequired(name) {
    // excluding internal use plugins
    return requiredModules.includes(name) || isInjectedProvider(name) || isVM(name) || isScriptRunner(name)
  }

  async registeredPlugins() {
    let plugins
    try {
      const res = await fetch(this.pluginsDirectory)
      plugins = await res.json()
      plugins = plugins.filter((plugin) => {
        if (plugin.name === 'dgit') return false
        if (plugin.targets && Array.isArray(plugin.targets) && plugin.targets.length > 0) {
          return plugin.targets.includes('remix')
        }
        return true
      })
      localStorage.setItem('plugins-directory', JSON.stringify(plugins))
    } catch (e) {
      console.log('getting plugins list from localstorage...')
      const savedPlugins = localStorage.getItem('plugins-directory')
      if (savedPlugins) {
        try {
          plugins = JSON.parse(savedPlugins)
        } catch (e) {
          console.error(e)
        }
      }
    }
    const testPluginName = localStorage.getItem('test-plugin-name')
    const testPluginUrl = localStorage.getItem('test-plugin-url')

    for (let plugin of loadLocalPlugins) {
      // fetch the profile from the local plugin
      try {
        const profile = await fetch(`plugins/${plugin}/profile.json`)
        const profileJson = await profile.json()
        // remove duplicates
        plugins = plugins.filter((p) => p.name !== profileJson.name && p.displayName !== profileJson.displayName)
        // change url
        profileJson.url = `plugins/${plugin}/index.html`
        // add the local plugin
        plugins.push(profileJson)
      } catch (e) {
        console.log(e)
      }
    }

    return plugins.map(plugin => {
      if (plugin.name === 'dgit' && Registry.getInstance().get('platform').api.isDesktop()) { plugin.url = 'https://dgit4-76cc9.web.app/' }
      if (plugin.name === testPluginName) plugin.url = testPluginUrl
      return new IframePlugin(plugin)
    })
  }

  async registerContextMenuItems() {
    await this.call('filePanel', 'registerContextMenuItem', {
      id: 'contractflattener',
      name: 'flattenAContract',
      label: 'Flatten',
      type: [],
      extension: ['.sol'],
      path: [],
      pattern: [],
      sticky: true,
      group: 5,
    })
    await this.call('filePanel', 'registerContextMenuItem', {
      id: 'nahmii-compiler',
      name: 'compileCustomAction',
      label: 'Compile for Nahmii',
      type: [],
      extension: ['.sol'],
      path: [],
      pattern: [],
      sticky: true,
      group: 6,
    })
    await this.call('filePanel', 'registerContextMenuItem', {
      id: 'solidityumlgen',
      name: 'generateCustomAction',
      label: 'Generate UML',
      type: [],
      extension: ['.sol'],
      path: [],
      pattern: [],
      sticky: true,
      group: 7,
    })
    await this.call('filePanel', 'registerContextMenuItem', {
      id: 'doc-gen',
      name: 'generateDocsCustomAction',
      label: 'Generate Docs',
      type: [],
      extension: ['.sol'],
      path: [],
      pattern: [],
      sticky: true,
      group: 7,
    })
    await this.call('filePanel', 'registerContextMenuItem', {
      id: 'vyper',
      name: 'vyperCompileCustomAction',
      label: 'Compile for Vyper',
      type: [],
      extension: ['.vy'],
      path: [],
      pattern: [],
      sticky: true,
      group: 7,
    })
    if (Registry.getInstance().get('platform').api.isDesktop()) {
      await this.call('filePanel', 'registerContextMenuItem', {
        id: 'fs',
        name: 'revealInExplorer',
        label: navigator.userAgentData.platform.indexOf('mac') > -1 ? 'Reveal in Finder' : 'Reveal in Explorer',
        type: ['folder', 'file'],
        extension: [],
        path: [],
        pattern: [],
        sticky: true,
        group: 8,
      })
      await this.call('filePanel', 'registerContextMenuItem', {
        id: 'fs',
        name: 'openInVSCode',
        label: 'Open in VSCode',
        type: ['folder', 'file'],
        extension: [],
        path: [],
        pattern: [],
        sticky: true,
        group: 8,
      })
    }
  }
}

/** @class Reference loaders.
 *  A loader is a get,set based object which load a workspace from a defined sources.
 *  (localStorage, queryParams)
 **/
class PluginLoader {
  get currentLoader() {
    return this.loaders[this.current]
  }

  constructor() {
    const queryParams = new QueryParams()
    // some plugins should not be activated at page load.
    this.donotAutoReload = [
      'remixd',
      'environmentExplorer',
      'templateSelection',
      'compilationDetails',
      'vyperCompilationDetails',
      'walletconnect',
      'dapp-draft',
      'solidityumlgen',
      'remixGuide',
      'doc-viewer',
      'UIScriptRunner'
    ]
    this.loaders = {}
    this.loaders.localStorage = {
      set: (plugin, actives) => {
        const saved = actives.filter((name) => !this.donotAutoReload.includes(name))
        localStorage.setItem('workspace', JSON.stringify(saved))
      },
      get: () => {
        return JSON.parse(localStorage.getItem('workspace'))
      },
    }

    this.loaders.queryParams = {
      set: () => {
        /* Do nothing. */
      },
      get: () => {
        const {activate} = queryParams.get()
        if (!activate) return []
        return activate.split(',')
      },
    }

    this.current = queryParams.get().activate ? 'queryParams' : 'localStorage'
  }

  set(plugin, actives) {
    this.currentLoader.set(plugin, actives)
  }

  get() {
    return this.currentLoader.get()
  }
}
