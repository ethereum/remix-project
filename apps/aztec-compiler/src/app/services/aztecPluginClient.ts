import { PluginClient } from '@remixproject/plugin'
import { createClient } from '@remixproject/plugin-webview'
import EventManager from 'events'

export class AztecPluginClient extends PluginClient {
  public internalEvents: EventManager

  constructor() {
    super()
    createClient(this)
    this.internalEvents = new EventManager()
    this.onload()
  }

  init(): void {
    console.log('[aztec-plugin] Initialized!')
  }

  onActivation(): void {
    this.internalEvents.emit('aztec_activated')
  }
}
