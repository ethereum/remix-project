import type { Message, Profile, ExternalProfile, PluginOptions } from '@remixproject/plugin-utils'
import { PluginConnector } from '@remixproject/engine'

type WebworkerOptions = WorkerOptions & PluginOptions

export class WebWorkerPlugin extends PluginConnector {
  private worker: Worker
  protected options: WebworkerOptions
  public profile: Profile & ExternalProfile

  constructor(profile: Profile & ExternalProfile, options?: WebworkerOptions) {
    super(profile)
    this.profile = profile
    this.setOptions(options)
  }

  setOptions(options: Partial<WebworkerOptions>) {
    super.setOptions({ type: 'module', name: this.name, ...options })
  }

  connect(url: string) {
    if ('Worker' in window) {
      this.worker = new Worker(url, this.options)
      this.worker.onmessage = e => this.getEvent(e)
      return this.handshake()
    }
  }

  disconnect() {
    this.worker.terminate()
  }

  /** Get message from the iframe */
  private async getEvent(event: MessageEvent) {
    const message: Message = event.data
    this.getMessage(message)
  }

  /**
   * Post a message to the webview of this plugin
   * @param message The message to post
   */
  protected send(message: Partial<Message>) {
    if (!this.worker) {
      throw new Error('No worker attached to the plugin')
    }
    this.worker.postMessage(message)
  }
}
