import { PluginClient } from '@remixproject/plugin'
import { createClient } from '@remixproject/plugin-webview'
import EventEmitter from 'events'

export class DocViewer extends PluginClient {
  mdFile: string
  fileContents: string
  eventEmitter: EventEmitter
  constructor() {
    super()
    this.eventEmitter = new EventEmitter()
    this.methods = ['viewDocs']
    createClient(this)
    this.mdFile = ''
    this.onload()
  }

  async setProperties() {
    console.log('inside setProperties')
    this.on('docgen' as any, 'docsGenerated', async (docs: string[]) => {
      console.log('docsGenerated', docs)
      this.mdFile = docs[0]
      const contents = await this.call('fileManager', 'readFile', this.mdFile)
      console.log({ contents })
      this.fileContents = contents
      this.eventEmitter.emit('docviewer', 'contentsReady', this.fileContents)
    })
  }

  async viewDocs(docs: string[]) {
    console.log('viewDocs', docs)
    console.log('docsGenerated', docs)
    this.mdFile = docs[0]
    const contents = await this.call('fileManager', 'readFile', this.mdFile)
    console.log({ contents })
    this.fileContents = contents
    this.eventEmitter.emit('contentsReady', contents)
  }
}