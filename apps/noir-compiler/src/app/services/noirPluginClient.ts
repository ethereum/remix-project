import { PluginClient } from '@remixproject/plugin'
import { createClient } from '@remixproject/plugin-webview'
import EventManager from 'events'
// @ts-ignore
import { compile_program, compile_contract, createFileManager } from '@noir-lang/noir_wasm/default'
import { NoirFS } from './remixMockFs'
import { FileManager } from './noirFileManager'

const DEFAULT_TOML_CONFIG = `[package]
name = "test"
authors = [""]
compiler_version = ">=0.18.0"
type = "bin"

[dependencies]
`
export class NoirPluginClient extends PluginClient {
  public internalEvents: EventManager
  public fs: NoirFS
  public fm: FileManager

  constructor() {
    super()
    this.methods = ['init', 'parse', 'compile']
    createClient(this)
    this.internalEvents = new EventManager()
    this.fs = new NoirFS(this)
    this.fm = new FileManager(this.fs, '/')
    this.onload()
  }

  init(): void {
    console.log('initializing noir plugin...')
  }

  onActivation(): void {
    this.internalEvents.emit('noir_activated')
  }

  compile(path: string): void {
    this.parse(path)
  }

  async parse(path: string): Promise<void> {
    // @ts-ignore
    const tomlFileExists = await this.call('fileManager', 'exists', '/Nargo.toml')
    // @ts-ignore
    const srcDirExists = await this.call('fileManager', 'exists', '/src')

    if (!tomlFileExists) {
      await this.call('fileManager', 'writeFile', '/Nargo.toml', DEFAULT_TOML_CONFIG)
    }
    if (!srcDirExists) {
      await this.call('fileManager', 'mkdir', '/src')
    }
    // @ts-ignore
    const program = await compile_program(this.fm)

    console.log('program: ', program)
  }
}
