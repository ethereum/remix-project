import { PluginClient } from '@remixproject/plugin'
import { createClient } from '@remixproject/plugin-webview'
export class RemixPlugin extends PluginClient {
  constructor () {
    super()
    this.methods = ['testCommand']
    createClient(this)
  }

  async testCommand (data: any) {

  }
}
