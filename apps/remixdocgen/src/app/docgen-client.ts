import { PluginClient } from '@remixproject/plugin'
import { IRemixApi } from '@remixproject/plugin-api'
import { Api, PluginApi } from '@remixproject/plugin-utils'
import { createClient } from '@remixproject/plugin-webview'

export class DocGenClient extends PluginClient {
  private client
  
  constructor() {
    super()
    this.client = createClient(this)
    this.methods = ['generateDocs', 'publishDocs']

    this.client.onload(async () => {
      await this.client.activate()
    })
  }

  async generateDocs() {
    console.log('docgen client generateDocs')
    // await this.client.call('docgen', 'docgen', [])
  }

  async publishDocs() {
    console.log('docgen client publishDocs')
    // await this.client.call('docgen', 'docgen', [])
  }
}