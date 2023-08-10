import { PluginClient } from '@remixproject/plugin'
import { createClient } from '@remixproject/plugin-webview'
import EventManager from 'events'
import pathModule from 'path'
import { parse } from 'circom_wasm'

export class CircomPluginClient extends PluginClient {
  public internalEvents: EventManager

  constructor() {
    super()
    createClient(this)
    this.internalEvents = new EventManager()
    this.methods = ["init", "parse"]
    this.onload()
  }

  init (): void {
    console.log('initializing circom plugin...')
  }

  onActivation(): void {
    // @ts-ignore
    this.on('editor', 'contentChanged', (path: string, fileContent) => {
      if (path.endsWith('.circom')) {
        this.parse(path, fileContent)
      }
    })
  }

  async parse (path: string, fileContent: string): Promise<void> {
    let buildFiles = {
      [path]: fileContent
    }

    buildFiles = await this.resolveDependencies(path, fileContent, buildFiles)
    const parsedOutput = parse(path, buildFiles)

    try {
      const result = JSON.parse(parsedOutput)
      const markers = []

      for (const report of result) {
        for (const label in report.labels) {
          if (report.labels[label].file_id === '0') {
            // @ts-ignore
            const startPosition: { lineNumber: number, column: number } = await this.call('editor', 'getPositionAt', report.labels[label].range.start)
            // @ts-ignore
            const endPosition: { lineNumber: number, column: number } = await this.call('editor', 'getPositionAt', report.labels[label].range.end)

            markers.push({
              message: report.message,
              severity: report.type.toLowerCase(),
              position: {
                start: {
                  line: startPosition.lineNumber,
                  column: startPosition.column
                },
                end: {
                  line: endPosition.lineNumber,
                  column: endPosition.column
                }
              },
              file: path
            })
          }
        }
      }
      // @ts-ignore
      await this.call('editor', 'addErrorMarker', markers)
    } catch (e) {
      // @ts-ignore
      await this.call('editor', 'clearErrorMarkers', [path])
      console.log(parsedOutput)
    }
  }

  async resolveDependencies (filePath: string, fileContent: string, output = {}, depPath: string = '', blackPath: string[] = []): Promise<Record<string, string>> {
    const includes = (fileContent.match(/include ['"].*['"]/g) || []).map(include =>  include.replace(/include ['"]/g, '').replace(/['"]/g, ''))

    await Promise.all(includes.map(async include => {
      // fix for endless recursive includes
      if (blackPath.includes(include)) return
      let dependencyContent = ''
      let path = include
      // @ts-ignore
      const pathExists = await this.call('fileManager', 'exists', path)

      if (pathExists) {
        dependencyContent = await this.call('fileManager', 'readFile', path)
      } else {
        let relativePath = pathModule.resolve(filePath.slice(0, filePath.lastIndexOf('/')), include)
        if (relativePath.indexOf('/') === 0) relativePath = relativePath.slice(1)
        // @ts-ignore
        const relativePathExists = await this.call('fileManager', 'exists', relativePath)

        if (relativePathExists) {
          dependencyContent = await this.call('fileManager', 'readFile', relativePath)
        } else {
          if (depPath) {
            path = pathModule.resolve(depPath.slice(0, depPath.lastIndexOf('/')), include)
            if (path.indexOf('/') === 0) path = path.slice(1)
            dependencyContent = await this.call('contentImport', 'resolveAndSave', path, null)
          } else {
            if (include.startsWith('circomlib')) {
              const splitInclude = include.split('/')
              const version = splitInclude[1].match(/v[0-9]+.[0-9]+.[0-9]+/g)
            
              if (version && version[0]) {
                path = `https://raw.githubusercontent.com/iden3/circomlib/${version[0]}/circuits/${splitInclude.slice(2).join('/')}`
                dependencyContent = await this.call('contentImport', 'resolveAndSave', path, null)
              } else {
                path = `https://raw.githubusercontent.com/iden3/circomlib/master/circuits/${splitInclude.slice(1).join('/')}`
                dependencyContent = await this.call('contentImport', 'resolveAndSave', path, null)
              }
            } else {
              dependencyContent = await this.call('contentImport', 'resolveAndSave', path, null)
            }
          }
        }
      }
      const dependencyIncludes = (dependencyContent.match(/include ['"].*['"]/g) || []).map(include =>  include.replace(/include ['"]/g, '').replace(/['"]/g, ''))

      blackPath.push(include)
      if (dependencyIncludes.length > 0) {
        await this.resolveDependencies(filePath, dependencyContent, output, path, blackPath)
        output[include] = dependencyContent
      } else {
        output[include] = dependencyContent
      }
    }))
    return output
  }
}
