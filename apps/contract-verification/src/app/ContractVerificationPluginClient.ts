import { PluginClient } from '@remixproject/plugin'
import { createClient } from '@remixproject/plugin-webview'
import EventManager from 'events'

export class ContractVerificationPluginClient extends PluginClient {
  public internalEvents: EventManager

  constructor() {
    super()
    this.internalEvents = new EventManager()
    createClient(this)
    this.onload()
  }
}
