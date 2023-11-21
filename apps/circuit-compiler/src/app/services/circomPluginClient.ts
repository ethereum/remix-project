import { PluginClient } from '@remixproject/plugin'
import { createClient } from '@remixproject/plugin-webview'
import EventManager from 'events'
import pathModule from 'path'
import { compiler_list } from 'circom_wasm'
import * as compilerV216 from 'circom_wasm/v2.1.6'
import * as compilerV215 from 'circom_wasm/v2.1.5'
import { extractNameFromKey, extractParentFromKey } from '@remix-ui/helper'
import { CompilationConfig, CompilerReport, PrimeValue, ResolverOutput } from '../types'

export class CircomPluginClient extends PluginClient {
  public internalEvents: EventManager
  private _compilationConfig: CompilationConfig = {
    version: "2.1.6",
    prime: "bn128"
  }
  private lastCompiledCircuitPath: string = ''
  private lastParsedFiles: Record<string, string> = {}
  private lastCompiledFile: string = ''
  private compiler: typeof compilerV215 | typeof compilerV216 = compilerV216

  constructor() {
    super()
    this.methods = ['init', 'parse', 'compile', 'generateR1cs']
    createClient(this)
    this.internalEvents = new EventManager()
    this.onload()
  }

  init(): void {
    console.log('initializing circom plugin...')
  }

  onActivation(): void {
    this.internalEvents.emit('circom_activated')
  }

  set compilerVersion (version: string) {
    if (!compiler_list.versions.includes(version)) throw new Error("Unsupported compiler version")
    this._compilationConfig.version = version
    if (version === '2.1.5') this.compiler = compilerV215
    else if (version === '2.1.6') this.compiler = compilerV216
  }

  set compilerPrime (prime: PrimeValue) {
    if ((prime !== "bn128") && (prime !== "bls12381") && (prime !== "goldilocks") && (this._compilationConfig.version === '2.1.5')) throw new Error('Invalid prime value')
    if ((prime !== "bn128") && (prime !== "bls12381") && (prime !== "goldilocks") && (prime !== "grumpkin") && (prime !== "pallas") && (prime !== "vesta") && (this._compilationConfig.version === '2.1.6')) throw new Error('Invalid prime value')
    this._compilationConfig.prime = prime
  }

  async parse(path: string, fileContent?: string): Promise<[CompilerReport[], Record<string, string>]> {
    if (!fileContent) {
      // @ts-ignore
      fileContent = await this.call('fileManager', 'readFile', path)
    }
    this.lastParsedFiles = await this.resolveDependencies(path, fileContent, { [path]: { content: fileContent, parent: null } })
    const parsedOutput = this.compiler.parse(path, this.lastParsedFiles)

    try {
      const result: CompilerReport[] = JSON.parse(parsedOutput.report())
      const mapReportFilePathToId: Record<string, string> = {}

      if (result.length === 0) {
        // @ts-ignore
        await this.call('editor', 'clearErrorMarkers', [path])
      } else {
        const markers = []

        for (const report of result) {
          for (const label in report.labels) {
            const file_id = report.labels[label].file_id

            mapReportFilePathToId[file_id] = parsedOutput.get_report_name(parseInt(file_id))
            if (file_id === '0') {
              // @ts-ignore
              const startPosition: { lineNumber: number; column: number } = await this.call(
                'editor',
                // @ts-ignore
                'getPositionAt',
                report.labels[label].range.start
              )
              // @ts-ignore
              const endPosition: { lineNumber: number; column: number } = await this.call(
                'editor',
                // @ts-ignore
                'getPositionAt',
                report.labels[label].range.end
              )

              markers.push({
                message: report.message,
                severity: report.type.toLowerCase(),
                position: {
                  start: {
                    line: startPosition.lineNumber,
                    column: startPosition.column,
                  },
                  end: {
                    line: endPosition.lineNumber,
                    column: endPosition.column,
                  },
                },
                file: path,
              })
            }
          }
        }

        if (markers.length > 0) {
          // @ts-ignore
          await this.call('editor', 'addErrorMarker', markers)
        } else {
          // @ts-ignore
          await this.call('editor', 'clearErrorMarkers', [path])
        }
      }

      return [result, mapReportFilePathToId]
    } catch (e) {
      throw new Error(e)
    }
  }

  async compile(path: string, compilationConfig?: CompilationConfig): Promise<void> {
    this.internalEvents.emit('circuit_compiling_start')
    const [parseErrors, filePathToId] = await this.parse(path)

    if (parseErrors && (parseErrors.length > 0)) {
      if (parseErrors[0].type === 'Error') {
        this.internalEvents.emit('circuit_parsing_errored', parseErrors)
        return
      } else if (parseErrors[0].type === 'Warning') {
        this.internalEvents.emit('circuit_parsing_warning', parseErrors)
      }
    } else {
      this.internalEvents.emit('circuit_parsing_done', parseErrors, filePathToId)
    }
    if (compilationConfig) {
      const { prime, version } = compilationConfig

      this.compilerVersion = version
      this.compilerPrime = prime
    }
    const circuitApi = this.compiler.compile(path, this.lastParsedFiles, { prime: this._compilationConfig.prime })
    const circuitProgram = circuitApi.program()

    if (circuitProgram.length < 1) {
      const circuitErrors = circuitApi.report()

      throw new Error(circuitErrors)
    } else {
      this.lastCompiledFile = path
      const fileName = extractNameFromKey(path)
      
      this.lastCompiledCircuitPath = extractParentFromKey(path) + "/.bin/" + fileName.replace('circom', 'wasm')
      // @ts-ignore
      await this.call('fileManager', 'writeFile', this.lastCompiledCircuitPath, circuitProgram, { encoding: null })
      const fileContent = this.lastParsedFiles[path]
      const searchComponentName = fileContent.match(/component\s+main\s*(?:{[^{}]*})?\s*=\s*([A-Za-z_]\w*)\s*\(.*\)/)

      if (searchComponentName) {
        const componentName = searchComponentName[1]
        const signals = circuitApi.input_signals(componentName)

        this.internalEvents.emit('circuit_compiling_done', signals)
      } else {
        this.internalEvents.emit('circuit_compiling_done', [])
      }
    }
  }

  async generateR1cs (path: string, compilationConfig?: CompilationConfig): Promise<void> {
    this.internalEvents.emit('circuit_generating_r1cs_start')
    const [parseErrors, filePathToId] = await this.parse(path)

    if (parseErrors && (parseErrors.length > 0)) {
      if (parseErrors[0].type === 'Error') {
        this.internalEvents.emit('circuit_parsing_errored', parseErrors)
        return
      } else if (parseErrors[0].type === 'Warning') {
        this.internalEvents.emit('circuit_parsing_warning', parseErrors)
      }
    } else {
      this.internalEvents.emit('circuit_parsing_done', parseErrors, filePathToId)
    }
    if (compilationConfig) {
      const { prime, version } = compilationConfig

      this.compilerVersion = version
      this.compilerPrime = prime
    }
    const r1csApi = this.compiler.generate_r1cs(path, this.lastParsedFiles, { prime: this._compilationConfig.prime })
    const r1csProgram = r1csApi.program()

    if (r1csProgram.length < 1) {
      const r1csErrors = r1csApi.report()

      throw new Error(r1csErrors)
    } else {
      this.internalEvents.emit('circuit_generating_r1cs_done')
      const fileName = extractNameFromKey(path)
      const writePath = extractParentFromKey(path) + "/.bin/" + fileName.replace('circom', 'r1cs')
  
      // @ts-ignore
      await this.call('fileManager', 'writeFile', writePath, r1csProgram, true)
    }
  }

  async computeWitness (input: string): Promise<void> {
    this.internalEvents.emit('circuit_computing_witness_start')
    const wasmPath = this.lastCompiledCircuitPath

    if (!wasmPath) throw new Error('No wasm file found')
    // @ts-ignore
    const buffer: any = await this.call('fileManager', 'readFile', wasmPath, { encoding: null })
    const dataRead = new Uint8Array(buffer)
    const witness = await this.compiler.generate_witness(dataRead, input)
    // @ts-ignore
    await this.call('fileManager', 'writeFile', wasmPath.replace('.wasm', '.wtn'), witness, true)
    this.internalEvents.emit('circuit_computing_witness_done')
  }

  async resolveDependencies(filePath: string, fileContent: string, output: ResolverOutput = {}, depPath: string = '', parent: string = ''): Promise<Record<string, string>> {
    // extract all includes
    const includes = (fileContent.match(/include ['"].*['"]/g) || []).map((include) => include.replace(/include ['"]/g, '').replace(/['"]/g, ''))

    await Promise.all(
      includes.map(async (include) => {
        // fix for endless recursive includes
        let dependencyContent = ''
        let path = include.replace(/(\.\.\/)+/g, '')
        // @ts-ignore
        const pathExists = await this.call('fileManager', 'exists', path)

        if (pathExists) {
          // fetch file content if include import (path) exists within same level as current file opened in editor
          dependencyContent = await this.call('fileManager', 'readFile', path)
        } else {
          // if include import (path) does not exist, try to construct relative path using the original file path (current file opened in editor)
          let relativePath = pathModule.resolve(filePath.slice(0, filePath.lastIndexOf('/')), include)
          if (relativePath.indexOf('/') === 0) relativePath = relativePath.slice(1)
          const relativePathExists = await this.call(
            'fileManager',
            // @ts-ignore
            'exists',
            relativePath
          )

          if (relativePathExists) {
            // fetch file content if include import exists as a relative path
            dependencyContent = await this.call('fileManager', 'readFile', relativePath)
          } else {
            if (include.startsWith('circomlib')) {
              // try to resolve include import from github if it is a circomlib dependency
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
              if (depPath) {
                // if depPath is provided, try to resolve include import from './deps' folder in remix
                path = pathModule.resolve(depPath.slice(0, depPath.lastIndexOf('/')), include)
                path = path.replace('https:/', 'https://')
                if (path.indexOf('/') === 0) path = path.slice(1)
                dependencyContent = await this.call('contentImport', 'resolveAndSave', path, null)
              } else {
                // If all import cases are not true, use the default import to try fetching from node_modules and unpkg
                dependencyContent = await this.call('contentImport', 'resolveAndSave', path, null)
              }
            }
          }
        }
        const fileNameToInclude = extractNameFromKey(include)
        const similarFile = Object.keys(output).find(path => {
          return path.indexOf(fileNameToInclude) > -1
        })
        const isDuplicateContent = similarFile && output[similarFile] ? output[similarFile].content === dependencyContent : false

        if (output[include] && output[include].parent) {
          // if include import already exists, remove the include import from the parent file
          const regexPattern = new RegExp(`include ['"]${include}['"];`, 'g')

          output[output[include].parent].content = output[output[include].parent].content.replace(regexPattern, "")
        } else if (isDuplicateContent) {
          // if include import has the same content as another file, replace the include import with the file name of the other file (similarFile)
          if (output[similarFile].parent) output[output[similarFile].parent].content = output[output[similarFile].parent].content.replace(similarFile, include)
          if (include !== similarFile) {
            output[include] = output[similarFile]
            delete output[similarFile]
          }
        } else {
          // extract all includes from the dependency content
          const dependencyIncludes = (dependencyContent.match(/include ['"].*['"]/g) || []).map((include) => include.replace(/include ['"]/g, '').replace(/['"]/g, ''))
          
          output[include] = {
            content: dependencyContent,
            parent
          }
          // recursively resolve all dependencies of the dependency
          if (dependencyIncludes.length > 0) await this.resolveDependencies(filePath, dependencyContent, output, path, include)
        }
      })
    )
    const result: Record<string, string> = {}

    Object.keys(output).forEach((key) => {
      result[key] = output[key].content
    })
    return result
  }

  async resolveReportPath (path: string): Promise<string> {
    // @ts-ignore
    const pathExists = await this.call('fileManager', 'exists', path)

    if (pathExists) return path
    else {
      // if include import (path) does not exist, try to construct relative path using the original file path (current file opened in editor)
      let relativePath = pathModule.resolve(this.lastCompiledFile.slice(0, this.lastCompiledFile.lastIndexOf('/')), path)
      if (relativePath.indexOf('/') === 0) relativePath = relativePath.slice(1)
      // @ts-ignore
      const relativePathExists = await this.call('fileManager', 'exists', relativePath)

      if (relativePathExists) return relativePath
      else {
        if (path.startsWith('circomlib')) {
          // try to resolve include import from github if it is a circomlib dependency
          const splitInclude = path.split('/')
          const version = splitInclude[1].match(/v[0-9]+.[0-9]+.[0-9]+/g)

          if (version && version[0]) {
            path = `/.deps/https/raw.githubusercontent.com/iden3/circomlib/${version[0]}/circuits/${splitInclude.slice(2).join('/')}`
          } else {
            path = `/.deps/https/raw.githubusercontent.com/iden3/circomlib/master/circuits/${splitInclude.slice(1).join('/')}`
          }
          // @ts-ignore
          const exists = await this.call('fileManager', 'exists', path)

          if (exists) return path
          else throw new Error(`Report path ${path} do no exist in the Remix FileSystem`)
        } else {
          throw new Error(`Report path ${path} do no exist in the Remix FileSystem`)
        }
      }
    }
  }
}
