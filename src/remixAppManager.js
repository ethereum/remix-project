/* global localStorage, fetch */
import { PluginManager, IframePlugin } from '@remixproject/engine'
import { EventEmitter } from 'events'
import QueryParams from './lib/query-params'
import { PermissionHandler } from './app/ui/persmission-handler'

const requiredModules = [ // services + layout views + system views
  'manager', 'compilerArtefacts', 'compilerMetadata', 'contextualListener', 'editor', 'offsetToLineColumnConverter', 'network', 'theme', 'fileManager', 'contentImport', 'web3Provider', 'scriptRunner', 'fetchAndCompile',
  'mainPanel', 'hiddenPanel', 'sidePanel', 'menuicons', 'fileExplorers',
  'terminal', 'settings', 'pluginManager']

export function isNative (name) {
  const nativePlugins = ['vyper', 'workshops']
  return nativePlugins.includes(name) || requiredModules.includes(name)
}

export function canActivate (name) {
  return ['manager', 'debugger'].includes(name)
}

export class RemixAppManager extends PluginManager {

  constructor (plugins) {
    super()
    this.event = new EventEmitter()
    this.pluginsDirectory = 'https://raw.githubusercontent.com/ethereum/remix-plugins-directory/master/build/metadata.json'
    this.pluginLoader = new PluginLoader()
    this.permissionHandler = new PermissionHandler()
  }

  async canActivate (from, to) {
    return canActivate(from.name)
  }

  async canDeactivate (from, to) {
    return from.name === 'manager'
  }

  async canCall (from, to, method, message) {
    // Make sure the caller of this methods is the target plugin
    if (to !== this.currentRequest.from) {
      return false
    }
    // skipping native plugins' requests
    if (isNative(from)) {
      return true
    }
    // ask the user for permission
    return await this.permissionHandler.askPermission(this.profiles[from], this.profiles[to], method, message)
  }

  onPluginActivated (plugin) {
    this.pluginLoader.set(plugin, this.actives)
    this.event.emit('activate', plugin)
  }

  getAll () {
    return Object.keys(this.profiles).map((p) => {
      return this.profiles[p]
    })
  }

  getIds () {
    return Object.keys(this.profiles)
  }

  onPluginDeactivated (plugin) {
    this.pluginLoader.set(plugin, this.actives)
    this.event.emit('deactivate', plugin)
  }

  onRegistration (plugin) {
    this.event.emit('added', plugin.name)
  }

  async ensureActivated (apiName) {
    await this.activatePlugin(apiName)
    this.event.emit('ensureActivated', apiName)
  }

  async ensureDeactivated (apiName) {
    await this.deactivatePlugin(apiName)
    this.event.emit('ensureDeactivated', apiName)
  }

  deactivatePlugin (name) {
    if (requiredModules.includes(name)) return
    super.deactivatePlugin(name)
  }

  isRequired (name) {
    return requiredModules.includes(name)
  }

  async registeredPlugins () {
    const res = await fetch(this.pluginsDirectory)
    const plugins = await res.json()
    return plugins.map(plugin => new IframePlugin(plugin))
  }
}

/** @class Reference loaders.
 *  A loader is a get,set based object which load a workspace from a defined sources.
 *  (localStorage, queryParams)
 **/
class PluginLoader {
  get currentLoader () {
    return this.loaders[this.current]
  }

  constructor () {
    const queryParams = new QueryParams()
    this.donotAutoReload = ['remixd'] // that would be a bad practice to force loading some plugins at page load.
    this.loaders = {}
    this.loaders['localStorage'] = {
      set: (plugin, actives) => {
        if (!this.donotAutoReload.includes(plugin.name)) {
          localStorage.setItem('workspace', JSON.stringify(actives))
        }
      },
      get: () => { return JSON.parse(localStorage.getItem('workspace')) }
    }

    this.loaders['queryParams'] = {
      set: () => {},
      get: () => {
        const { plugins } = queryParams.get()
        if (!plugins) return []
        return plugins.split(',')
      }
    }

    this.current = queryParams.get()['plugins'] ? 'queryParams' : 'localStorage'
  }

  set (plugin, actives) {
    this.currentLoader.set(plugin, actives)
  }

  get () {
    return this.currentLoader.get()
  }
}
