import { PluginClient } from '@remixproject/plugin'
import { createClient } from '@remixproject/plugin-webview'
import EventManager from 'events'
// @ts-ignore
import { compile_program, createFileManager } from '@noir-lang/noir_wasm/default'
import type { FileManager } from '@noir-lang/noir_wasm/dist/node/main'
import { DEFAULT_TOML_CONFIG } from '../actions/constants'
export class NoirPluginClient extends PluginClient {
  public internalEvents: EventManager
  public fm: FileManager

  constructor() {
    super()
    this.methods = ['init', 'parse', 'compile']
    createClient(this)
    this.internalEvents = new EventManager()
    this.fm = createFileManager('/')
    this.onload()
  }

  init(): void {
    console.log('initializing noir plugin...')
  }

  onActivation(): void {
    this.internalEvents.emit('noir_activated')
    this.setup()
  }

  async setup(): Promise<void> {
    // @ts-ignore
    const nargoTomlExists = await this.call('fileManager', 'exists', 'Nargo.toml')

    if (!nargoTomlExists) {
      await this.call('fileManager', 'writeFile', 'Nargo.toml', DEFAULT_TOML_CONFIG)
      const fileBytes = new TextEncoder().encode(DEFAULT_TOML_CONFIG)

      this.fm.writeFile('Nargo.toml', new Blob([fileBytes]).stream())
    } else {
      const nargoToml = await this.call('fileManager', 'readFile', 'Nargo.toml')
      const fileBytes = new TextEncoder().encode(nargoToml)

      this.fm.writeFile('Nargo.toml', new Blob([fileBytes]).stream())
    }
  }

  async compile(path: string): Promise<void> {
    try {
      this.internalEvents.emit('noir_compiling_start')
      this.emit('statusChanged', { key: 'loading', title: 'Compiling Noir Circuit...', type: 'info' })
      // @ts-ignore
      this.call('terminal', 'log', { type: 'log', value: 'Compiling ' + path })
      const program = await compile_program(this.fm)

      console.log('program: ', program)
      this.internalEvents.emit('noir_compiling_done')
      this.emit('statusChanged', { key: 'succeed', title: 'Noir circuit compiled successfully', type: 'success' })
    } catch (e) {
      this.emit('statusChanged', { key: 'error', title: e.message, type: 'error' })
      this.internalEvents.emit('noir_compiling_errored', e)
      console.error(e)
    }
  }

  async parse(path: string, content?: string): Promise<void> {
    if (!content) {
      // @ts-ignore
      content = await this.call('fileManager', 'readFile', path)
    }
    const depImports = Array.from(content.matchAll(/mod\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(=\s*["'](.*?)["'])?\s*;/g), match => match[3] || match[1]);
    console.log('depImports: ', depImports)
    const fileBytes = new TextEncoder().encode(content)

    this.fm.writeFile(`src/${path}`, new Blob([fileBytes]).stream())
  }
}
