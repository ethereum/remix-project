import { PluginClient } from '@remixproject/plugin'
import { createClient } from '@remixproject/plugin-webview'
import { DocGen } from './plugins/docgen'

export class DocGenClient extends PluginClient {
  private client
  private docgen
  
  constructor() {
    super()
    this.client = createClient(this)
    // this.docgen = new DocGen()
    this.methods = ['generateDocs', 'publishDocs']
  }
  loadClient() {
    this.client.onload()
  }
  async generateDocs() {
    console.log('docgen client generateDocs')
  }

  async publishDocs() {
    console.log('docgen client publishDocs')
  }
}