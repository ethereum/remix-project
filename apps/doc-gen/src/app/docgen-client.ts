/* eslint-disable @typescript-eslint/no-explicit-any */
import { PluginClient } from '@remixproject/plugin'
import { CompilationResult, SourceWithTarget, customAction } from '@remixproject/plugin-api'
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
  private contractPath: string = ''
  
  constructor() {
    super()
    this.eventEmitter = new EventEmitter()
    this.methods = ['generateDocs', 'openDocs', 'generateDocsCustomAction']
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
      const segmentedPathList = normalizeContractPath(fileName)
      this.fileName = segmentedPathList[segmentedPathList.length - 1]
      this.contractPath =  segmentedPathList[0]
      this.eventEmitter.emit('compilationFinished', this.build, this.fileName)
    })
  }

  async generateDocsCustomAction(action: customAction) {
    await this.call('solidity', 'compile', action.path[0])
    await this.generateDocs()
  }

  async docgen(builds: Build[], userConfig?: Config): Promise<void> {
    const config = { ...defaults, ...userConfig }
    config.sourcesDir = this.contractPath !== config.sourcesDir ? this.contractPath : config.sourcesDir
    const templates = await loadTemplates(config.theme, config.root, config.templates)
    const site = buildSite(builds, config, templates.properties ?? {})
    const renderedSite = render(site, templates, config.collapseNewlines)
    const docs: string[] = []
    for (const { id, contents } of renderedSite) {
      const temp = `${this.fileName.split('.')[0]}.${id.split('.')[1]}`
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
    this.eventEmitter.on('compilationFinished', async (build: Build, fileName: string) => {
      await this.docgen([build])
    })
  }
}
