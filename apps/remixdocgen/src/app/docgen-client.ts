import { PluginClient } from '@remixproject/plugin'
import { CompilationResult, SourceWithTarget } from '@remixproject/plugin-api'
import { createClient } from '@remixproject/plugin-webview'
import EventEmitter from 'events'
import { Config, defaults } from './docgen/config'
import { Build, buildSite } from './docgen/site'
import { loadTemplates } from './docgen/templates'
import {SolcInput, SolcOutput} from 'solidity-ast/solc'
import { render } from './docgen/render'

export class DocGenClient extends PluginClient {
  private currentTheme
  public eventEmitter: EventEmitter
  private build: Build
  
  constructor() {
    super()
    this.eventEmitter = new EventEmitter()
    createClient(this)
    // this.docgen = new DocGen()
    this.methods = ['generateDocs', 'publishDocs', 'viewDocs']
    this.onload().then(async () => {
      console.log('docgen client loaded')
      await this.setListeners()
    })
  }

  async setListeners() {
    this.currentTheme = await this.call('theme', 'currentTheme')
    
    this.on("theme", "themeChanged", (theme: any) => {
      this.currentTheme = theme
      this.eventEmitter.emit('themeChanged', this.currentTheme)
    });
    this.eventEmitter.emit('themeChanged', this.currentTheme)

    this.on('solidity', 'compilationFinished', (fileName: string, source: SourceWithTarget, languageVersion: string, data: CompilationResult) => {
      console.log('docgen client compilationFinished', data, source)
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

      this.eventEmitter.emit('compilationFinished', this.build, fileName)

    })
  }

  async docgen(builds: Build[], userConfig?: Config): Promise<void> {
    const config = { ...defaults, ...userConfig }
    const templates = await loadTemplates(config.theme, config.root, config.templates)
    const site = buildSite(builds, config, templates.properties ?? {})
    const renderedSite = render(site, templates, config.collapseNewlines)
    const docs: string[] = []
    for (const { id, contents } of renderedSite) {
      await this.call('fileManager', 'setFile', id, contents)
      docs.push(id)
    }
    this.eventEmitter.emit('docsGenerated', docs)
  }

  async opendDocs() {
    console.log('docgen client openDocs')
    await this.call('manager', 'activatePlugin', 'docgenviewer')
    await this.call('tabs' as any, 'focus', 'docgenviewer')
    await this.call('docgenviewer' as any, 'viewDocs')
  }

  async viewDocs(docs: string[]) {
    console.log('docgen client viewDocs')
  }

  async generateDocs() {
    console.log('docgen client generateDocs')
    this.docgen([this.build])
  }

  async publishDocs() {
    console.log('docgen client publishDocs')
  }
}