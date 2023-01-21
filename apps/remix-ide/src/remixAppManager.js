import { PluginManager } from '@remixproject/engine'
import { EventEmitter } from 'events'
import { QueryParams } from '@remix-project/remix-lib'
import { IframePlugin } from '@remixproject/engine-web'
const _paq = window._paq = window._paq || []

// requiredModule removes the plugin from the plugin manager list on UI
const requiredModules = [ // services + layout views + system views
  'manager', 'config', 'compilerArtefacts', 'compilerMetadata', 'contextualListener', 'editor', 'offsetToLineColumnConverter', 'network', 'theme', 'locale',
  'fileManager', 'contentImport', 'blockchain', 'web3Provider', 'scriptRunner', 'fetchAndCompile', 'mainPanel', 'hiddenPanel', 'sidePanel', 'menuicons',
  'filePanel', 'terminal', 'settings', 'pluginManager', 'tabs', 'udapp', 'dGitProvider', 'solidity', 'solidity-logic', 'gistHandler', 'layout',
  'notification', 'permissionhandler', 'walkthrough', 'storage', 'restorebackupzip', 'link-libraries', 'deploy-libraries', 'openzeppelin-proxy', 
  'hardhat-provider', 'ganache-provider', 'foundry-provider', 'basic-http-provider', 'injected-optimism-provider', 'injected-arbitrum-one-provider',
  'compileAndRun', 'search', 'recorder', 'fileDecorator', 'codeParser', 'codeFormatter', 'solidityumlgen']

// dependentModules shouldn't be manually activated (e.g hardhat is activated by remixd)
const dependentModules = ['foundry', 'hardhat', 'truffle', 'slither'] 

const sensitiveCalls = {
  'fileManager': ['writeFile', 'copyFile', 'rename', 'copyDir'],
  'contentImport': ['resolveAndSave'],
  'web3Provider': ['sendAsync'],
}

export function isNative(name) {
  // nativePlugin allows to bypass the permission request
  const nativePlugins = ['vyper', 'workshops', 'debugger', 'remixd', 'menuicons', 'solidity', 'solidity-logic', 'solidityStaticAnalysis', 'solidityUnitTesting', 
    'layout', 'notification', 'hardhat-provider', 'ganache-provider', 'foundry-provider', 'basic-http-provider', 'injected-optimism-provider',
    'tabs', 'injected-arbitrum-one-provider']
  return nativePlugins.includes(name) || requiredModules.includes(name)
}

/**
 * Checks if plugin caller 'from' is allowed to activate plugin 'to'
 * The caller can have 'canActivate' as a optional property in the plugin profile.
 * This is an array containing the 'name' property of the plugin it wants to call.
 * canActivate = ['plugin1-to-call','plugin2-to-call',....]
 * or the plugin is allowed by default because it is native
 *
 * @param {any, any}
 * @returns {boolean}
 */
export function canActivate(from, to) {
  return ['ethdoc'].includes(from.name) ||
    isNative(from.name) ||
    (to && from && from.canActivate && from.canActivate.includes(to.name))
}

export class RemixAppManager extends PluginManager {
  constructor() {
    super()
    this.event = new EventEmitter()
    this.pluginsDirectory = 'https://raw.githubusercontent.com/ethereum/remix-plugins-directory/master/build/metadata.json'
    this.pluginLoader = new PluginLoader()
  }

  async canActivatePlugin(from, to) {
    return canActivate(from, to)
  }

  async canDeactivatePlugin(from, to) {
    if (requiredModules.includes(to.name)) return false
    return isNative(from.name)
  }

  async canDeactivate(from, to) {
    return this.canDeactivatePlugin(from, to)
  }

  async deactivatePlugin(name) {
    const [to, from] = [
      await this.getProfile(name),
      await this.getProfile(this.requestFrom)
    ]
    if (this.canDeactivatePlugin(from, to)) {
      await this.toggleActive(name)
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

    // ask the user for permission
    return await this.call('permissionhandler', 'askPermission', this.profiles[from], this.profiles[to], method, message, isSensitiveCall)
  }

  onPluginActivated(plugin) {
    this.pluginLoader.set(plugin, this.actives.filter((plugin) => !this.isDependent(plugin)))
    this.event.emit('activate', plugin)
    this.emit('activate', plugin)
    if (!requiredModules.includes(plugin.name)) _paq.push(['trackEvent', 'pluginManager', 'activate', plugin.name])
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
    this.pluginLoader.set(plugin, this.actives.filter((plugin) => !this.isDependent(plugin)))
    this.event.emit('deactivate', plugin)
    _paq.push(['trackEvent', 'pluginManager', 'deactivate', plugin.name])
  }

  isDependent(name) {
    return dependentModules.includes(name)
  }

  isRequired(name) {
    // excluding internal use plugins
    return requiredModules.includes(name)
  }

  async registeredPlugins() {
    let plugins
    try {
      const res = await fetch(this.pluginsDirectory)
      plugins = await res.json()
      plugins = plugins.filter((plugin) => {
        if (plugin.targets && Array.isArray(plugin.targets) && plugin.targets.length > 0) {
          return (plugin.targets.includes('remix'))
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
    return plugins.map(plugin => {      
      if (plugin.name === testPluginName) plugin.url = testPluginUrl
      return new IframePlugin(plugin)
    })
  }

  async registerContextMenuItems() {
    await this.call('filePanel', 'registerContextMenuItem', {
      id: 'flattener',
      name: 'flattenFileCustomAction',
      label: 'Flatten',
      type: [],
      extension: ['.sol'],
      path: [],
      pattern: [],
      sticky: true
    })
    await this.call('filePanel', 'registerContextMenuItem', {
      id: 'nahmii-compiler',
      name: 'compileCustomAction',
      label: 'Compile for Nahmii',
      type: [],
      extension: ['.sol'],
      path: [],
      pattern: [],
      sticky: true
    })
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
    this.donotAutoReload = ['remixd'] // that would be a bad practice to force loading some plugins at page load.
    this.loaders = {}
    this.loaders.localStorage = {
      set: (plugin, actives) => {
        const saved = actives.filter((name) => !this.donotAutoReload.includes(name))
        localStorage.setItem('workspace', JSON.stringify(saved))
      },
      get: () => { return JSON.parse(localStorage.getItem('workspace')) }
    }

    this.loaders.queryParams = {
      set: () => {  /* Do nothing. */ },
      get: () => {
        const { activate } = queryParams.get()
        if (!activate) return []
        return activate.split(',')
      }
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
