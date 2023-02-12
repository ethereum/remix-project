import type {
  Api,
  EventKey,
  EventParams,
  MethodKey,
  MethodParams,
  EventCallback,
  ApiMap,
  Profile,
  PluginRequest,
  PluginApi,
  PluginBase,
  IPluginService,
  PluginOptions,
} from '@remixproject/plugin-utils'

import {
  createService,
  activateService,
  getMethodPath,
  PluginQueueItem,
} from '@remixproject/plugin-utils'

export interface RequestParams {
  name: string
  key: string
  payload: any[]
}



export class Plugin<T extends Api = any, App extends ApiMap = any> implements PluginBase<T, App> {
  activateService: Record<string, () => Promise<any>> = {}
  protected currentRequest: PluginRequest
  /** Give access to all the plugins registered by the engine */
  protected app: PluginApi<App>
  protected options: PluginOptions = {}
  protected queue: PluginQueueItem[] = []
  // Lifecycle hooks
  onRegistration?(): void
  onActivation?(): void
  onDeactivation?(): void
  profile: Profile<T>

  constructor(profile: Profile<T>) {
    this.profile = profile
  }

  get name() {
    return this.profile.name
  }

  get methods() {
    return this.profile.methods
  }

  set methods(methods: Extract<keyof T['methods'], string>[]) {
    this.profile.methods = methods
  }

  activate(): any | Promise<any> {
    if (this.onActivation) this.onActivation()
  }
  deactivate(): any | Promise<any> {
    if (this.onDeactivation) this.onDeactivation()
  }

  setOptions(options: Partial<PluginOptions> = {}) {
    this.options = { ...this.options, ...options }
  }

  /** Call a method on this plugin */
  protected callPluginMethod(key: string, args: any[]) {
    const path = this.currentRequest?.path
    const method = getMethodPath(key, path)
    if (!(method in this)) {
      throw new Error(`Method ${method} is not implemented by ${this.profile.name}`)
    }
    return this[method](...args)
  }

  protected setCurrentRequest(request: PluginRequest) {
    this.currentRequest = request
  }

  protected letContinue() {
    delete this.currentRequest
    this.queue = this.queue.filter((value) => {
      return value.canceled === false && value.timedout === false && value.finished === false
    })
    const next = this.queue.find((value) => {
      return value.canceled === false && value.timedout === false && value.finished === false
    })
    if (next) next.run()
  }

  /** Add a request to the list of current requests */
  protected addRequest(request: PluginRequest, method: Profile<T>['methods'][number], args: any[]) {
    return new Promise((resolve, reject) => {
      const queue = new PluginQueueItem(resolve, reject, request, method, this.options, args)
      queue['setCurrentRequest'] = (request: PluginRequest) => this.setCurrentRequest(request)
      queue['callMethod'] = async (method: string, args: any[]) => this.callPluginMethod(method, args)
      queue['letContinue'] = () => this.letContinue()
      this.queue.push(queue)
      if (this.queue.length === 1)
        this.queue[0].run();
    }
    )
  }

  protected cancelRequests(request: PluginRequest, method: Profile<T>['methods'][number]) {
    for (const queue of this.queue) {
      if (queue.request.from == request.from && (method ? queue.method == method : true)) queue.cancel()
    }
  }


  /**
   * Ask the plugin manager if current request can call a specific method
   * @param method The method to call
   * @param message An optional message to show to the user
   */
  askUserPermission(method: MethodKey<T>, message?: string): Promise<boolean> {
    // Internal call
    if (!this.currentRequest) {
      return Promise.resolve(true)
    }
    // External call
    if (this.methods.includes(method)) {
      const from = this.currentRequest.from
      const to = this.name
      return (this as any).call('manager', 'canCall', from, to, method, message)
    } else {
      return Promise.resolve(false)
    }
  }

  /**
   * Called by the engine when a plugin try to activate it
   * @param from the profile of the plugin activating this plugin
   * @param method method used to activate this plugin if any
   */
  async canActivate(from: Profile, method?: string): Promise<boolean> {
    return true
  }

  /**
   * Called by the engine when a plugin try to deactivate it
   * @param from the profile of the plugin deactivating this plugin
   */
  async canDeactivate(from: Profile): Promise<boolean> {
    return true
  }

  /////////////
  // SERVICE //
  /////////////

  /**
   * Create a service under the client node
   * @param name The name of the service
   * @param service The service
   */
  async createService<S extends Record<string, any>>(name: string, service: S): Promise<IPluginService<S>> {
    if (this.methods && this.methods.includes(name as any)) {
      throw new Error('A service cannot have the same name as an exposed method')
    }
    const _service = createService(name, service)
    await activateService(this, _service)
    return _service
  }

  /**
   * Prepare a service to be lazy loaded
   * @param name The name of the subservice inside this service
   * @param factory A function to create the service on demand
   */
  prepareService<S extends Record<string, any>>(name: string, factory: () => S): () => Promise<IPluginService<S>> {
    return this.activateService[name] = async () => {
      if (this.methods && this.methods.includes(name as any)) {
        throw new Error('A service cannot have the same name as an exposed method')
      }
      const service = await factory()
      const _service = createService(name, service)
      await activateService(this as any, _service)
      delete this.activateService[name]
      return _service
    }
  }

  /** Listen on an event from another plugin */
  on<Name extends Extract<keyof App, string>, Key extends EventKey<App[Name]>>(
    name: Name,
    key: Key,
    cb: EventCallback<App[Name], Key>,
  ): void {
    throw new Error(`Cannot use method "on" from plugin "${this.name}". It is not registered in the engine yet.`)
  }

  /** Listen once an event from another plugin then remove event listener */
  once<Name extends Extract<keyof App, string>, Key extends EventKey<App[Name]>>(
    name: Name,
    key: Key,
    cb: EventCallback<App[Name], Key>,
  ): void {
    throw new Error(`Cannot use method "once" from plugin "${this.name}". It is not registered in the engine yet.`)
  }

  /** Stop listening on an event from another plugin */
  off<Name extends Extract<keyof App, string>, Key extends EventKey<App[Name]>>(
    name: Name,
    key: Key,
  ): void {
    throw new Error(`Cannot use method "off" from plugin "${this.name}". It is not registered in the engine yet.`)
  }

  /** Call a method of another plugin */
  async call<Name extends Extract<keyof App, string>, Key extends MethodKey<App[Name]>>(
    name: Name,
    key: Key,
    ...payload: MethodParams<App[Name], Key>
  ): Promise<ReturnType<App[Name]['methods'][Key]>> {
    throw new Error(`Cannot use method "call" from plugin "${this.name}". It is not registered in the engine yet.`)
  }

  /** Cancel a method of another plugin */
  async cancel<Name extends Extract<keyof App, string>, Key extends MethodKey<App[Name]>>(
    name: Name,
    key: Key,
  ): Promise<ReturnType<App[Name]['methods'][Key]>> {
    throw new Error(`Cannot use method "cancel" from plugin "${this.name}". It is not registered in the engine yet.`)
  }

  /** Emit an event */
  emit<Key extends EventKey<T>>(key: Key, ...payload: EventParams<T, Key>): void {
    throw new Error(`Cannot use method "emit" from plugin "${this.name}". It is not registered in the engine yet.`)
  }
}
