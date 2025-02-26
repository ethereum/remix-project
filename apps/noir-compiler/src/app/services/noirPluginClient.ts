import { PluginClient } from '@remixproject/plugin'
import { createClient } from '@remixproject/plugin-webview'
import EventManager from 'events'
// @ts-ignore
import { compile_program, createFileManager } from '@noir-lang/noir_wasm/default'
import type { FileManager } from '@noir-lang/noir_wasm/dist/node/main'
import pathModule from 'path'
import { DEFAULT_TOML_CONFIG } from '../actions/constants'
import NoirParser from './noirParser'
import { extractNameFromKey } from '@remix-ui/helper'
export class NoirPluginClient extends PluginClient {
  public internalEvents: EventManager
  public fm: FileManager
  public parser: NoirParser

  constructor() {
    super()
    this.methods = ['init', 'parse', 'compile']
    createClient(this)
    this.internalEvents = new EventManager()
    this.fm = createFileManager('/')
    this.parser = new NoirParser()
    this.onload()
  }

  init(): void {
    console.log('initializing noir plugin...')
  }

  onActivation(): void {
    this.internalEvents.emit('noir_activated')
  }

  async setupNargoToml(): Promise<void> {
    // @ts-ignore
    const nargoTomlExists = await this.call('fileManager', 'exists', 'Nargo.toml')

    if (!nargoTomlExists) {
      await this.call('fileManager', 'writeFile', 'Nargo.toml', DEFAULT_TOML_CONFIG)
      const fileBytes = new TextEncoder().encode(DEFAULT_TOML_CONFIG)

      await this.fm.writeFile('Nargo.toml', new Blob([fileBytes]).stream())
    } else {
      const nargoToml = await this.call('fileManager', 'readFile', 'Nargo.toml')
      const fileBytes = new TextEncoder().encode(nargoToml)

      await this.fm.writeFile('Nargo.toml', new Blob([fileBytes]).stream())
    }
  }

  async compile(path: string): Promise<void> {
    try {
      this.internalEvents.emit('noir_compiling_start')
      this.emit('statusChanged', { key: 'loading', title: 'Compiling Noir Program...', type: 'info' })
      // @ts-ignore
      this.call('terminal', 'log', { type: 'log', value: 'Compiling ' + path })
      await this.setupNargoToml()
      const program = await compile_program(this.fm, null, this.logFn.bind(this), this.debugFn.bind(this))
      const filename = extractNameFromKey(path)
      const outputPath = `build/${filename.replace('.nr', '.json')}`

      this.call('fileManager', 'writeFile', outputPath, JSON.stringify(program, null, 2))
      this.internalEvents.emit('noir_compiling_done')
      this.emit('statusChanged', { key: 'succeed', title: 'Noir circuit compiled successfully', type: 'success' })
      // @ts-ignore
      this.call('terminal', 'log', { type: 'log', value: 'Compiled successfully' })
      // @ts-ignore
      await this.call('editor', 'clearErrorMarkers', [path])
    } catch (e) {
      const regex = /^\s*(\/[^:]+):(\d+):/gm;
      const pathContent = await this.call('fileManager', 'readFile', path)

      const markers = Array.from(e.message.matchAll(regex), (match) => {
        const errorPath = match[1]
        const line = parseInt(match[2])
        const start = { line, column: 1 }
        const end = { line, column: pathContent.split('\n')[line - 1].length + 1 }

        return {
          message: e.message,
          severity: 'error',
          position: { start, end },
          file: errorPath.slice(1)
        }
      })
      // @ts-ignore
      await this.call('editor', 'addErrorMarker', markers)
      this.emit('statusChanged', { key: markers.length, title: e.message, type: 'error' })
      this.internalEvents.emit('noir_compiling_errored', e)
      console.error(e)
    }
  }

  async parse(path: string, content?: string): Promise<void> {
    if (!content) content = await this.call('fileManager', 'readFile', path)
    const result = this.parser.parseNoirCode(content)

    if (result.length > 0) {
      const markers = []

      for (const error of result) {
        markers.push({
          message: error.message,
          severity: 'error',
          position: error.position,
          file: path,
        })
      }
      // @ts-ignore
      await this.call('editor', 'addErrorMarker', markers)
    } else {
      await this.resolveDependencies(path, content)
      const fileBytes = new TextEncoder().encode(content)

      await this.fm.writeFile(`${path}`, new Blob([fileBytes]).stream())
      // @ts-ignore
      await this.call('editor', 'clearErrorMarkers', [path])
    }
  }

  async resolveDependencies (filePath: string, fileContent: string, parentPath: string = '', visited: Record<string, string[]> = {}): Promise<void> {
    const imports = Array.from(fileContent.matchAll(/mod\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(=\s*["'](.*?)["'])?\s*;/g), match => match[3] || match[1]);

    for (let dep of imports) {
      if (!dep.endsWith('.nr')) dep += '.nr'
      if (visited[filePath] && visited[filePath].includes(parentPath)) return console.log('circular dependency detected')
      let dependencyContent = ''
      let path = dep.replace(/(\.\.\/)+/g, '')

      // @ts-ignore
      const pathExists = await this.call('fileManager', 'exists', path)

      if (pathExists) {
        dependencyContent = await this.call('fileManager', 'readFile', path)
      } else {
        let relativePath = pathModule.resolve(filePath.slice(0, filePath.lastIndexOf('/')), dep)

        if (relativePath.indexOf('/') === 0) relativePath = relativePath.slice(1)
        // @ts-ignore
        const relativePathExists = await this.call('fileManager', 'exists', relativePath)

        if (relativePathExists) {
          path = relativePath
          dependencyContent = await this.call('fileManager', 'readFile', relativePath)
          visited[filePath] = visited[filePath] ? [...visited[filePath], path] : [path]
          // extract all mod imports from the dependency content
          const depImports = Array.from(fileContent.matchAll(/mod\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(=\s*["'](.*?)["'])?\s*;/g), match => match[3] || match[1])

          if (depImports.length > 0 && dependencyContent.length > 0) {
            const fileBytes = new TextEncoder().encode(dependencyContent)
            const writePath = parentPath ? `${filePath.replace('.nr', '')}/${dep}` : path

            this.fm.writeFile(writePath, new Blob([fileBytes]).stream())
            await this.resolveDependencies(path, dependencyContent, filePath, visited)
          }
        } else {
          throw new Error(`Dependency ${dep} not found in Remix file system`)
        }
      }
    }
  }

  logFn(log) {
    this.call('terminal', 'log', { type: 'error', value: log })
  }

  debugFn(log) {
    this.call('terminal', 'log', { type: 'log', value: log })
  }
}
