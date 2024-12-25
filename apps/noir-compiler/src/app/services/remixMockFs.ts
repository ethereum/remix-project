import type { FileSystem } from './noirFileManager'
import { PluginClient } from '@remixproject/plugin'

export class NoirFS implements FileSystem {
  plugin: PluginClient

  constructor (plugin: PluginClient) {
    this.plugin = plugin
  }

  existsSync: (path: string) => boolean

  async readdir (path: string, options?: { recursive: boolean }): Promise<string[]> {
    console.log('readdir: ', path)
    // @ts-ignore
    return await this.plugin.call('fileManager', 'readdir', path, options)
  }

  async rename (oldPath: string, newPath: string): Promise<void> {
    // @ts-ignore
    return await this.plugin.call('fileManager', 'rename', oldPath, newPath)
  }

  async readFile (path: string, encoding?: 'utf-8'): Promise<Uint8Array | string> {
    // @ts-ignore
    return await this.plugin.call('fileManager', 'readFile', path, { encoding: null })
  }

  async writeFile (path: string, data: Uint8Array): Promise<void> {
    // @ts-ignore
    return await this.plugin.call('fileManager', 'writeFile', path, data, { encoding: null })
  }

  async mkdir (dir: string, opts?: { recursive: boolean }): Promise<void> {
    // @ts-ignore
    return await this.plugin.call('fileManager', 'mkdir', dir, opts)
  }
}