import { PluginClient } from '@remixproject/plugin'
import { CompilationResult, SourceWithTarget } from '@remixproject/plugin-api'
import { createClient } from '@remixproject/plugin-webview'
import EventEmitter from 'events'
import { Config, defaults } from './docgen/config'
import { Build, buildSite } from './docgen/site'
import { loadTemplates } from './docgen/templates'
import { SolcInput, SolcOutput } from 'solidity-ast/solc'
import { render } from './docgen/render'
import { normalizeContractPath } from './docgen/utils/normalizeContractPath'

export class DocGenClient extends PluginClient {
  private currentTheme
  public eventEmitter: EventEmitter
  private build: Build
  public docs: string[] = []
  private fileName: string = ''
  
  constructor() {
    super()
    this.eventEmitter = new EventEmitter()
    this.methods = ['generateDocs', 'openDocs']
    createClient(this)
    this.onload().then(async () => {
      await this.setListeners()
    })
  }

  async setListeners() {
    this.currentTheme = await this.call('theme', 'currentTheme')
    
    this.on('theme', 'themeChanged', (theme: any) => {
      this.currentTheme = theme
      this.eventEmitter.emit('themeChanged', this.currentTheme)
    });
    this.eventEmitter.emit('themeChanged', this.currentTheme)

    this.on('solidity', 'compilationFinished', (fileName: string, source: SourceWithTarget, languageVersion: string, data: CompilationResult) => {
      const input: SolcInput = {
        sources: source.sources
      }
      const output: SolcOutput = {
        sources: data.sources as any
      }
      this.build = {
        input: input,
        output: output
      }
      const test = normalizeContractPath(fileName)
      console.log({ test })
      this.fileName = test
      this.eventEmitter.emit('compilationFinished', this.build, test)
    })
  }

  async docgen(builds: Build[], userConfig?: Config): Promise<void> {
    console.log('docgen called')
    const config = { ...defaults, ...userConfig }
    console.log({ config })
    const templates = await loadTemplates(config.theme, config.root, config.templates)
    console.log({ templates })
    const site = buildSite(builds, config, templates.properties ?? {})
    console.log({ site })
    const renderedSite = render(site, templates, config.collapseNewlines)
    const docs: string[] = []
    console.log('docs created!!')
    console.log({ renderedSite })
    for (const { id, contents } of renderedSite) {
      const pathArray = this.fileName.split('/')
      console.log({ pathArray })
      const temp = `${pathArray[pathArray.length - 1]}.${id.split('.')[1]}`
      console.log(temp)
      const newFileName = `docs/${temp}`
      await this.call('fileManager', 'setFile', newFileName , contents)
      docs.push(newFileName)
    }
    this.eventEmitter.emit('docsGenerated', docs)
    this.emit('docgen' as any, 'docsGenerated', docs)
    this.docs = docs
    await this.openDocs(docs)
  }

  async openDocs(docs: string[]) {
    await this.call('manager', 'activatePlugin', 'doc-viewer')
    await this.call('tabs' as any, 'focus', 'doc-viewer')
    await this.call('doc-viewer' as any, 'viewDocs', docs)
  }

  async generateDocs() {
    const builds = [this.build]
    console.log({ builds })
    this.docgen(builds)
  }
}
