import type { Profile, Message } from '@remixproject/plugin-utils'
import { Plugin } from '@remixproject/engine';

export abstract class ElectronPlugin extends Plugin {
  protected loaded: boolean
  protected id = 0
  protected pendingRequest: Record<number, (result: any, error: Error | string) => void> = {}
  protected api: {
    send: (message: Partial<Message>) => void
    on: (cb: (event: any, message: any) => void) => void
  }
  profile: Profile
  constructor(profile: Profile) {
    super(profile)
    this.loaded = false

    if(!window.electronAPI) throw new Error('ElectronPluginConnector requires window.api')
    if(!window.electronAPI.plugins) throw new Error('ElectronPluginConnector requires window.api.plugins')

    window.electronAPI.plugins.find((plugin: any) => {
      if(plugin.name === profile.name){
        this.api = plugin
        return true
      }
    })

    this.api.on((event: any, message: any) => {
      this.getMessage(message)
    })
  }

  /**
   * Send a message to the external plugin
   * @param message the message passed to the plugin
   */
  protected send(message: Partial<Message>): void {
    if(this.loaded)
      this.api.send(message)
  }
  /**
   * Open connection with the plugin
   * @param name The name of the plugin should connect to
   */
  protected async connect(name: string) {
    if(await window.electronAPI.activatePlugin(name) && !this.loaded){
      this.handshake()
    }
  }
  /** Close connection with the plugin */
  protected disconnect(): any | Promise<any> {
    
  }

  async activate() {
    await this.connect(this.profile.name)
    return super.activate()
  }

  async deactivate() {
    this.loaded = false
    await this.disconnect()
    return super.deactivate()
  }

  /** Call a method from this plugin */
  protected callPluginMethod(key: string, payload: any[] = []): Promise<any> {
    const action = 'request'
    const id = this.id++
    const requestInfo = this.currentRequest
    const name = this.name
    const promise = new Promise((res, rej) => {
      this.pendingRequest[id] = (result: any[], error: Error | string) => error ? rej (error) : res(result)
    })
    this.send({ id, action, key, payload, requestInfo, name })
    return promise
  }

  /** Perform handshake with the client if not loaded yet */
  protected async handshake() {
    if (!this.loaded) {
      this.loaded = true
      let methods: string[];
      try {
        methods = await this.callPluginMethod('handshake', [this.profile.name])
      } catch (err) {
        this.loaded = false
        throw err;
      }
      this.emit('loaded', this.name)
      if (methods) {
        this.profile.methods = methods
        this.call('manager', 'updateProfile', this.profile)
      }
    } else {
      // If there is a broken connection we want send back the handshake to the plugin client
      return this.callPluginMethod('handshake', [this.profile.name])
    }
  }

  /**
   * React when a message comes from client
   * @param message The message sent by the client
   */
  protected async getMessage(message: Message) {
    // Check for handshake request from the client
    if (message.action === 'request' && message.key === 'handshake') {
      return this.handshake()
    }

    switch (message.action) {
      // Start listening on an event
      case 'on':
      case 'listen': {
        const { name, key } = message
        const action = 'notification'
        this.on(name, key, (...payload: any[]) => this.send({ action, name, key, payload }))
        break
      }
      case 'off': {
        const { name, key } = message
        this.off(name, key)
        break
      }
      case 'once': {
        const { name, key } = message
        const action = 'notification'
        this.once(name, key, (...payload: any) => this.send({ action, name, key, payload }))
        break
      }
      // Emit an event
      case 'emit':
      case 'notification': {
        if (!message.payload) break
        this.emit(message.key, ...message.payload)
        break
      }
      // Call a method
      case 'call':
      case 'request': {
        const action = 'response'
        try {
          const payload = await this.call(message.name, message.key, ...message.payload)
          const error: any = undefined
          this.send({ ...message, action, payload, error })
        } catch (err) {
          const payload: any = undefined
          const error = err.message || err
          this.send({ ...message, action, payload, error })
        }
        break
      }
      case 'cancel': {
        const payload = this.cancel(message.name, message.key)
        break;
      }
      // Return result from exposed method
      case 'response': {
        const { id, payload, error } = message
        this.pendingRequest[id](payload, error)
        delete this.pendingRequest[id]
        break
      }
      default: {
        throw new Error('Message should be a notification, request or response')
      }
    }
  }
}