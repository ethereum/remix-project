import type { ExternalProfile, Profile, Message, PluginOptions } from '@remixproject/plugin-utils'
import { Plugin } from './abstract'

/** List of available gateways for decentralised storage */
export const defaultGateways = {
  'ipfs://': (url, name) => `https://${name}.dyn.plugin.remixproject.org/ipfs/${url.replace('ipfs://', '')}`,
  'swarm://': (url, name) => `https://swarm-gateways.net/bzz-raw://${url.replace('swarm://', '')}`
}

/** Transform the URL to use a gateway if decentralised storage is specified */
export function transformUrl({ url, name }: Profile & ExternalProfile) {
  const network = Object.keys(defaultGateways).find(key => url.startsWith(key))
  return network ? defaultGateways[network](url, name) : url
}

export interface PluginConnectorOptions extends PluginOptions {
  /** Usally used to reload the plugin on changes */
  devMode?: boolean
  transformUrl?: (profile: Profile & ExternalProfile) => string
  engine?:string
}


export abstract class PluginConnector extends Plugin {
  protected loaded: boolean
  protected id = 0
  protected pendingRequest: Record<number, (result: any, error: Error | string) => void> = {}
  protected options: PluginConnectorOptions
  profile: Profile & ExternalProfile
  constructor(profile: Profile & ExternalProfile) {
    super(profile)
  }

  /**
   * Send a message to the external plugin
   * @param message the message passed to the plugin
   */
  protected abstract send(message: Partial<Message>): void
  /**
   * Open connection with the plugin
   * @param url The transformed url the plugin should connect to
   */
  protected abstract connect(url: string): any | Promise<any>
  /** Close connection with the plugin */
  protected abstract disconnect(): any | Promise<any>

  async activate() {
    const url = this.options.transformUrl
      ? this.options.transformUrl(this.profile)
      : transformUrl(this.profile)
    await this.connect(url)
    return super.activate()
  }

  async deactivate() {
    this.loaded = false
    await this.disconnect()
    return super.deactivate()
  }

  /** Set options for an external plugin */
  setOptions(options: Partial<PluginConnectorOptions> = {}) {
    super.setOptions(options)
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
        methods = await this.callPluginMethod('handshake', [this.profile.name, this.options?.engine])
      } catch (err) {
        this.loaded = false
        throw err;
      }
      if (methods) {
        this.profile.methods = methods
        this.call('manager', 'updateProfile', this.profile)
      }
    } else {
      // If there is a broken connection we want send back the handshake to the plugin client
      return this.callPluginMethod('handshake', [this.profile.name, this.options?.engine])
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
        this.once(name, key, (...payload) => this.send({ action, name, key, payload }))
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
          const error = undefined
          this.send({ ...message, action, payload, error })
        } catch (err) {
          const payload = undefined
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
