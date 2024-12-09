import { PluginClient } from '@remixproject/plugin'
import { createClient } from '@remixproject/plugin-webview'
import EventManager from 'events'

export class NoirPluginClient extends PluginClient {
  public internalEvents: EventManager

  constructor() {
    super()
    this.methods = ['init']
    createClient(this)
    this.internalEvents = new EventManager()
    this.onload()
  }

  init(): void {
    console.log('initializing noir plugin...')
  }

  onActivation(): void {
    this.internalEvents.emit('noir_activated')
  }
}
