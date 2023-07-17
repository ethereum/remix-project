import { PluginClient } from '@remixproject/plugin'
import { createClient } from '@remixproject/plugin-webview'
import { parse_circuit_browser, main_browser } from 'apps/circuit-compiler/pkg/circom'
import { generate_witness } from 'apps/circuit-compiler/pkg/generate_witness'
import EventManager from 'events'

const pathModule = require('path')

export class CircomPluginClient extends PluginClient {
    private connected: boolean
    public internalEvents: EventManager

    constructor() {
        super()
        createClient(this)
        this.internalEvents = new EventManager()
        this.methods = ["init", "compile"]
        this.onload()
    }

    init (): void {
        console.log('initializing circom plugin...')
    }

    async compile (path: string) {
        const fileContent = await this.call('fileManager', 'readFile', path)
        let buildFiles = {
            [path]: fileContent
        }

        buildFiles = await this.resolveDependencies(path, fileContent, buildFiles)
        const compilationResult = main_browser(path, buildFiles, { prime: "bn128" })

        console.log('compilation result: ' + compilationResult)

        generate_witness(compilationResult, '{ "a": "3", "b": "11" }')
        generate_witness(compilationResult, '{ "a": "5", "b": "77" }')
    }

    async parse (path: string) {
        const fileContent = await this.call('fileManager', 'readFile', path)
        let buildFiles = {
            [path]: fileContent
        }

        buildFiles = await this.resolveDependencies(path, fileContent, buildFiles)
        const parsingResult = parse_circuit_browser(path, buildFiles, { prime: "bn128" })

        console.log('parsing result: ' + parsingResult)
    }

    async resolveDependencies (filePath: string, fileContent: string, output = {}, depPath: string = '', blackPath: string[] = []) {
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
