import { RemixApi } from '@remixproject/plugin-api'
import { Api } from '@remixproject/plugin-utils'
import { createClient } from '@remixproject/plugin-webview'
import { PluginClient } from '@remixproject/plugin'
import EventEmitter from 'events'

export class RemixAiClient extends PluginClient {
  private client = createClient<Api, Readonly<RemixApi>>(this)
  eventEmitter = new EventEmitter()

  constructor() {
    super()
  }

  loaded() {
    return this.client.onload()
  }

  /** Emit an event when file changed */
  async onFileChange(cb: (contract: string) => any) {
    this.client.on('fileManager', 'currentFileChanged', async (name: string) => {
      cb(name)
    })
  }

  /** Emit an event when file changed */
  async onNoFileSelected(cb: () => any) {
    this.client.on('fileManager', 'noFileSelected', async () => {
      cb()
    })
  }

}

export const remixAiClient = new RemixAiClient()
