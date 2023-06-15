import { PluginClient } from '@remixproject/plugin'
import { createClient } from '@remixproject/plugin-webview'
import EventEmitter from 'events'

export class DocViewer extends PluginClient {
  mdFile: string
  eventEmitter: EventEmitter
  constructor() {
    super()
    this.eventEmitter = new EventEmitter()
    this.methods = ['viewDocs']
    createClient(this)
    this.mdFile = ''
    this.onload()
  }

  async viewDocs(docs: string[]) {
    this.mdFile = docs[0]
    const contents = await this.call('fileManager', 'readFile', this.mdFile)
    this.eventEmitter.emit('contentsReady', contents)
  }
}