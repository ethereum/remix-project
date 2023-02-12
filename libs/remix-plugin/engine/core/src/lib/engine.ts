import type { PluginApi, Profile, PluginOptions } from '@remixproject/plugin-utils'
import { listenEvent } from '@remixproject/plugin-utils'
import { BasePluginManager } from "./manager"
import { Plugin } from './abstract'

export class Engine {
  private plugins: Record<string, Plugin> = {}
  private events: Record<string, any> = {}
  private listeners: Record<string, any> = {}
  private eventMemory: Record<string, any> = {}
  private manager: BasePluginManager

  onRegistration?(plugin: Plugin): void
  /** Update the options of the plugin when being registered */
  setPluginOption?(profile: Profile): PluginOptions


  /**
   * Broadcast an event to the plugin listening
   * @param emitter Plugin name that emits the event
   * @param event The name of the event
   * @param payload The content of the event
   */
  private broadcast(emitter: string, event: string, ...payload: any[]) {
    const eventName = listenEvent(emitter, event)
    if (!this.listeners[eventName]) return // Nobody is listening
    const listeners = this.listeners[eventName] || []
    listeners.forEach((listener: string) => {
      if (!this.events[listener][eventName]) {
        throw new Error(`Plugin ${listener} should be listening on event ${event} from ${emitter}. But no callback have been found`)
      }
      this.events[listener][eventName](...payload)
    })
    // Add event memory
    this.eventMemory[emitter]
      ? this.eventMemory[emitter][event] = payload
      : this.eventMemory[emitter] = { [event]: payload }
  }

  /**
   * Start listening on an event from another plugin
   * @param listener The name of the plugin that listen on the event
   * @param emitter The name of the plugin that emit the event
   * @param event The name of the event
   * @param cb Callback function to trigger when the event is trigger
   */
  private addListener(listener: string, emitter: string, event: string, cb: any) {
    const eventName = listenEvent(emitter, event)
    // If not already listening
    if (!this.events[listener][eventName]) {
      this.events[listener][eventName] = cb
    }
    // Record that "listener" is listening on "emitter"
    if (!this.listeners[eventName]) this.listeners[eventName] = []
    // If not already recorded
    if (!this.listeners[eventName].includes(listener)) {
      this.listeners[eventName].push(listener)
    }
    // If engine has memory of this event emit previous value
    if (emitter in this.eventMemory && event in this.eventMemory[emitter]) {
      cb(...this.eventMemory[emitter][event])
    }
  }

  /**
   * Remove an event from the list of a listener's events
   * @param listener The name of the plugin that was listening on the event
   * @param emitter The name of the plugin that emitted the event
   * @param event The name of the event
   */
  private removeListener(listener: string, emitter: string, event: string) {
    const eventName = listenEvent(emitter, event)
    // Remove listener
    this.listeners[eventName] = this.listeners[eventName].filter(name => name !== listener)
    // Remove callback
    delete this.events[listener][eventName]
  }

  /**
   * Create a listener that listen only once on an event
   * @param listener The name of the plugin that listen on the event
   * @param emitter The name of the plugin that emitted the event
   * @param event The name of the event
   * @param cb Callback function to trigger when event is triggered
   */
  private listenOnce(listener: string, emitter: string, event: string, cb: any) {
    this.addListener(listener, emitter, event, (...args: any[]) => {
      cb(...args)
      this.removeListener(listener, emitter, event)
    })
  }


  /**
   * Call a method of a plugin from another
   * @param caller The name of the plugin that calls the method
   * @param path The path of the plugin that manages the method
   * @param method The name of the method
   * @param payload The argument to pass to the method
   */
  private async callMethod(caller: string, path: string, method: string, ...payload: any[]) {
    const target = path.split('.').shift()
    if (!this.plugins[target]) {
      throw new Error(`Cannot call ${target} from ${caller}, because ${target} is not registered`)
    }

    // Get latest version of the profiles
    const [to, from] = await Promise.all([
      this.manager.getProfile(target),
      this.manager.getProfile(caller),
    ])

    // Check if plugin FROM can activate plugin TO
    const isActive = await this.manager.isActive(target)
    
    if (!isActive) {
      const managerCanActivate = await this.manager.canActivatePlugin(from, to, method)
      const pluginCanActivate = await this.plugins[to.name]?.canActivate(to, method)
      if (managerCanActivate && pluginCanActivate) {
        await this.manager.toggleActive(target)
      } else {
        throw new Error(`${from.name} cannot call ${method} of ${target}, because ${target} is not activated yet`)
      }
    }

    // Check if method is exposed
    // note: native methods go here
    const methods = [...(to.methods || []), 'canDeactivate']
    if (!methods.includes(method)) {
      const notExposedMsg = `Cannot call method "${method}" of "${target}" from "${caller}", because "${method}" is not exposed.`
      const exposedMethodsMsg = `Here is the list of exposed methods: ${methods.map(m => `"${m}"`).join(',')}`
      throw new Error(`${notExposedMsg} ${exposedMethodsMsg}`)
    }

    const request = { from: caller, path }
    return this.plugins[target]['addRequest'](request, method, payload)
  }

  /**
   * Cancels calls from a plugin to another
   * @param caller The name of the plugin that calls the method
   * @param path The path of the plugin that manages the method
   * @param method The name of the method to be cancelled, if is empty cancels all calls from plugin
   */
  private async cancelMethod(caller: string, path: string, method: string) {
    const target = path.split('.').shift()
    if (!this.plugins[target]) {
      throw new Error(`Cannot cancel ${method} on ${target} from ${caller}, because ${target} is not registered`)
    }

    // Get latest version of the profiles
    const [to, from] = await Promise.all([
      this.manager.getProfile(target),
      this.manager.getProfile(caller),
    ])

    // Check if plugin FROM can activate plugin TO
    const isActive = await this.manager.isActive(target)
    
    if (!isActive) {
        throw new Error(`${from.name} cannot cancel ${method?`${method} of `:'calls on'}${target}, because ${target} is not activated`)
    }

    // Check if method is exposed
    // note: native methods go here
    const methods = [...(to.methods || []), 'canDeactivate']
    if (!methods.includes(method) && method) {
      const notExposedMsg = `Cannot cancel "${method}" of "${target}" from "${caller}", because "${method}" is not exposed.`
      const exposedMethodsMsg = `Here is the list of exposed methods: ${methods.map(m => `"${m}"`).join(',')}`
      throw new Error(`${notExposedMsg} ${exposedMethodsMsg}`)
    }

    const request = { from: caller, path }
    return this.plugins[target]['cancelRequests'](request, method)
  }

  /**
   * Create an object to easily access any registered plugin
   * @param name Name of the caller plugin
   * @note This method creates a snapshot at the time of activation
   */
  private async createApp(name: string): Promise<PluginApi<any>> {
    const getProfiles = Object.keys(this.plugins).map(key => this.manager.getProfile(key))
    const profiles = await Promise.all(getProfiles)
    return profiles.reduce((app, target) => {
      app[target.name] = (target.methods || []).reduce((methods, method) => {
        methods[method] = (...payload: any[]) => this.callMethod(name, target.name, method, ...payload)
        return methods
      }, {
        on: (event: string, cb: (...payload: any[]) => void) => this.addListener(name, target.name, event, cb),
        once: (event: string, cb: (...payload: any[]) => void) => this.listenOnce(name, target.name, event, cb),
        off: (event: string) => this.removeListener(name, target.name, event),
        profile: target
      })
      return app
    }, {})
  }

  /**
   * Activate a plugin by making its method and event available
   * @param name The name of the plugin
   * @note This method is trigger by the plugin manager when a plugin has been activated
   */
  private async activatePlugin(name: string) {
    if (!this.plugins[name]) {
      throw new Error(`Cannot active plugin ${name} because it's not registered yet`)
    }
    const isActive = await this.manager.isActive(name)
    if (isActive) return

    const plugin = this.plugins[name]
    this.events[name] = {}
    plugin['on'] = (emitter: string, event: string, cb: (...payload: any[]) => void) => {
      this.addListener(name, emitter, event, cb)
    }
    plugin['once'] = (emitter: string, event: string, cb: (...payload: any[]) => void) => {
      this.listenOnce(name, emitter, event, cb)
    }
    plugin['off'] = (emitter: string, event: string) => {
      this.removeListener(name, emitter, event)
    }
    plugin['emit'] = (event: string, ...payload: any[]) => {
      this.broadcast(name, event, ...payload)
    }
    plugin['call'] = (target: string, method: string, ...payload: any[]): Promise<any> => {
      return this.callMethod(name, target, method, ...payload)
    }
    plugin['cancel'] = (target: string, method: string): Promise<any> => {
      return this.cancelMethod(name, target, method)
    }

    // GIVE ACCESS TO APP
    plugin['app'] = await this.createApp(name)
    plugin['createApp'] = () => this.createApp(name)

    // Call hooks
    await plugin.activate()
  }

  /**
   * Deactivate a plugin by removing all its event listeners and making it inaccessible
   * @param name The name of the plugin
   * @note This method is trigger by the plugin manager when a plugin has been deactivated
   */
  private async deactivatePlugin(name: string) {
    if (!this.plugins[name]) {
      throw new Error(`Cannot deactive plugin ${name} because it's not registered yet`)
    }
    const isActive = await this.manager.isActive(name)
    if (!isActive) return

    const plugin = this.plugins[name]
    // Call hooks
    await plugin.deactivate()

    this.updateErrorHandler(plugin)

    // REMOVE PLUGIN APP
    delete plugin['app']
    delete plugin['createApp']

    // REMOVE LISTENER
    // Note : We don't remove the listeners of this plugin.
    // Because we would keep track of them to reactivate them on reactivation. Which doesn't make sense
    delete this.events[name]

    // Remove event memory from this plugin
    delete this.eventMemory[name]

    // REMOVE EVENT RECORD
    Object.keys(this.listeners).forEach(eventName => {
      this.listeners[eventName].forEach((listener: string, i: number) => {
        if (listener === name) this.listeners[eventName].splice(i, 1)
      })
    })

  }

  /**
   * Update error message when trying to call a method when not activated
   * @param plugin The deactivated plugin to update the methods from
   */
  private updateErrorHandler(plugin: Plugin) {
    const name = plugin.name
    // SET ERROR MESSAGE FOR call, on, once, off, emit
    const deactivatedWarning = (message: string) => {
      return `Plugin "${name}" is currently deactivated. ${message}. Activate "${name}" first.`
    }
    plugin['call'] = (target: string, key: string, ...payload: any[]) => {
      throw new Error(deactivatedWarning(`It cannot call method ${key} of plugin ${target}.`))
    }
    plugin['cancel'] = (target: string, key: string, ...payload: any[]) => {
      throw new Error(deactivatedWarning(`It cannot cancel method ${key} of plugin ${target}.`))
    }
    plugin['on'] = (target: string, event: string) => {
      throw new Error(deactivatedWarning(`It cannot listen on event ${event} of plugin ${target}.`))
    }
    plugin['once'] = (target: string, event: string) => {
      throw new Error(deactivatedWarning(`It cannot listen on event ${event} of plugin ${target}.`))
    }
    plugin['off'] = (target: string, event: string) => {
      throw new Error(deactivatedWarning('All event listeners are already removed.'))
    }
    plugin['emit'] = (event: string, ...payload: any[]) => {
      throw new Error(deactivatedWarning(`It cannot emit the event ${event}`))
    }
  }

  /**
   * Register a plugin to the engine and update the manager
   * @param plugin The plugin
   */
  register(plugins: Plugin | Plugin[]) {
    const register = (plugin: Plugin) => {
      if (this.plugins[plugin.name]) {
        throw new Error(`Plugin ${plugin.name} is already register.`)
      }
      if (plugin.name === 'manager') {
        this.registerManager(plugin as BasePluginManager)
      }
      this.plugins[plugin.name] = plugin
      this.manager?.addProfile(plugin.profile)
      // Update Error Handling for better debug
      this.updateErrorHandler(plugin)
      // SetPluginOption is before onRegistration to let plugin update it's option inside onRegistration
      if (this.setPluginOption) {
        const options = this.setPluginOption(plugin.profile)
        plugin.setOptions(options)
      }
      if (plugin.onRegistration) plugin.onRegistration()
      if (this.onRegistration) this.onRegistration(plugin)
      return plugin.name
    }
    return Array.isArray(plugins) ? plugins.map(register) : register(plugins);
  }

  /** Register the manager */
  private registerManager(manager: BasePluginManager) {
    this.manager = manager
    // Activate the Engine & start listening on activation and deactivation
    this.manager['engineActivatePlugin'] = (name: string) => this.activatePlugin(name)
    this.manager['engineDeactivatePlugin'] = (name: string) => this.deactivatePlugin(name)
    // Add all previous profiles
    const profiles = Object.values(this.plugins).map(p => p.profile)
    this.manager.addProfile(profiles)
  }

  /** Remove plugin(s) from engine */
  remove(names: string | string[]) {
    const remove = async (name: string) => {
      await this.manager.deactivatePlugin(name)
      delete this.listeners[name]
      delete this.plugins[name]
    }
    return Array.isArray(names)
      ? Promise.all(names.map(remove))
      : remove(names);
  }

  /**
   * Check is a name is already registered
   * @param name Name of the plugin
   */
  isRegistered(name: string) {
    return !!this.plugins[name]
  }
}