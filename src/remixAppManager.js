/* global localStorage, fetch */
import { PluginEngine, IframePlugin } from '@remixproject/engine'
import { EventEmitter } from 'events'
import { PermissionHandler } from './app/ui/persmission-handler'
import QueryParams from './lib/query-params'

const requiredModules = [ // services + layout views + system views
  'compilerArtefacts', 'compilerMetadata', 'contextualListener', 'editor', 'offsetToLineColumnConverter', 'network', 'theme', 'fileManager', 'contentImport',
  'mainPanel', 'hiddenPanel', 'sidePanel', 'menuicons', 'fileExplorers',
  'terminal', 'settings', 'pluginManager']

const settings = {
  permissionHandler: new PermissionHandler(),
  autoActivate: false,
  natives: ['vyper', 'workshops', 'ethdoc', 'etherscan'] // Force iframe plugin to be seen as native
}

export class RemixAppManager extends PluginEngine {

  constructor (plugins) {
    super(plugins, settings)
    this.event = new EventEmitter()
    this.registered = {}
    this.pluginsDirectory = 'https://raw.githubusercontent.com/ethereum/remix-plugins-directory/master/build/metadata.json'
    this.pluginLoader = new PluginLoader()
  }

  onActivated (plugin) {
    this.pluginLoader.set(plugin, this.actives)
    this.event.emit('activate', plugin.name)
  }

  getAll () {
    return Object.keys(this.registered).map((p) => {
      return this.registered[p]
    })
  }

  getOne (name) {
    return this.registered[name]
  }

  getIds () {
    return Object.keys(this.registered)
  }

  onDeactivated (plugin) {
    this.pluginLoader.set(plugin, this.actives)
    this.event.emit('deactivate', plugin.name)
  }

  onRegistration (plugin) {
    if (!this.registered) this.registered = {}
    this.registered[plugin.name] = plugin
    this.event.emit('added', plugin.name)
  }

  // TODO check whether this can be removed
  ensureActivated (apiName) {
    if (!this.isActive(apiName)) this.activateOne(apiName)
    this.event.emit('ensureActivated', apiName)
  }

  // TODO check whether this can be removed
  ensureDeactivated (apiName) {
    if (this.isActive(apiName)) this.deactivateOne(apiName)
    this.event.emit('ensureDeactivated', apiName)
  }

  deactivateOne (name) {
    if (requiredModules.includes(name)) return
    super.deactivateOne(name)
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
