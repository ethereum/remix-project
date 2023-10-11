import { PluginClient } from '@remixproject/plugin'
import { createClient } from '@remixproject/plugin-webview'
import EventManager from 'events'
import pathModule from 'path'
import { parse, compile, generate_witness, generate_r1cs, compiler_list } from 'circom_wasm'
import { extractNameFromKey, extractParentFromKey } from '@remix-ui/helper'
import { CompilationConfig } from '../types'

export class CircomPluginClient extends PluginClient {
  public internalEvents: EventManager
  private _compilationConfig: CompilationConfig = {
    version: "2.1.5",
    prime: "bn128"
  }
  public lastCompiledCircuitPath: string = ''

  constructor() {
    super()
    createClient(this)
    this.internalEvents = new EventManager()
    this.methods = ['init', 'parse', 'compile']
    this.onload()
  }

  init(): void {
    console.log('initializing circom plugin...')
  }

  onActivation(): void {
    // @ts-ignore
    this.on('editor', 'contentChanged', (path: string, fileContent) => {
      if (path.endsWith('.circom')) {
        this.parse(path, fileContent)
      }
    })

    this.internalEvents.emit('circom_activated')
  }

  async parse(path: string, fileContent: string): Promise<void> {
    let buildFiles = {
      [path]: fileContent,
    }

    buildFiles = await this.resolveDependencies(path, fileContent, buildFiles)
    const parsedOutput = parse(path, buildFiles)

    try {
      const result = JSON.parse(parsedOutput)

      console.log('result: ', result)

      if (result.length === 0) {
        // @ts-ignore
        await this.call('editor', 'clearErrorMarkers', [path])
      } else {
        const markers = []

        for (const report of result) {
          for (const label in report.labels) {
            if (report.labels[label].file_id === '0') {
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
    } catch (e) {
      console.log(e)
    }
  }

  async compile(path: string, compilationConfig?: CompilationConfig): Promise<void> {
    this.internalEvents.emit('circuit_compiling')
    if (compilationConfig) {
      const { prime, version } = compilationConfig

      if ((prime !== "bn128") && (prime !== "bls12381") && (prime !== "goldilocks")) throw new Error('Invalid prime value')
      if (!compiler_list.versions.includes(version)) throw new Error("Unsupported compiler version")
      this._compilationConfig.prime = prime
      this._compilationConfig.version = version
    }
    const fileContent = await this.call('fileManager', 'readFile', path)
    let buildFiles = {
      [path]: fileContent
    }

    buildFiles = await this.resolveDependencies(path, fileContent, buildFiles)
    const circuitApi = compile(path, buildFiles, { prime: this._compilationConfig.prime })
    const circuitProgram = circuitApi.program()

    if (circuitProgram.length < 1) {
      const circuitErrors = circuitApi.report()

      this.internalEvents.emit('circuit_errored', circuitErrors)
      throw new Error(circuitErrors)
    } else {
      const fileName = extractNameFromKey(path)
      
      this.lastCompiledCircuitPath = extractParentFromKey(path) + "/.bin/" + fileName.replace('circom', 'wasm')
      // @ts-ignore
      await this.call('fileManager', 'writeFile', this.lastCompiledCircuitPath, circuitProgram, true)
      const searchComponentName = fileContent.match(/component\s+main\s*(?:{[^{}]*})?\s*=\s*([A-Za-z_]\w*)\s*\(.*\)/)

      if (searchComponentName) {
        const componentName = searchComponentName[1]
        const signals = circuitApi.input_signals(componentName)

        this.internalEvents.emit('circuit_done', signals)
      } else {
        this.internalEvents.emit('circuit_done', [])
      }
    }
    // const witness = await generate_witness(compiledOutput, '{ "identityTrapdoor": "12656283236575022300303467601783819380815431272685589718060054649894766174337", "identityNullifier": "15178877681550417450385541477607788220584140707925739215609273992582659710290", "treePathIndices": "0", "treeSiblings": "1", "externalNullifier": "5df6e0e3480d6fbc32925076897ec6b9b935d75ae8f4d9f4858a426f8f6a4ab": "signalHash": "[85, 139, 239, 32, 221, 194, 165, 19, 20, 52, 104, 144, 41, 16, 40, 204, 171, 245, 198, 77, 94, 143, 30, 112, 105, 165, 33, 15, 62, 156, 18, 118]"}')

    // const ptau_final = "https://ipfs-cluster.ethdevops.io/ipfs/QmTiT4eiYz5KF7gQrDsgfCSTRv3wBPYJ4bRN1MmTRshpnW";
    // const r1cs_ipfs = "http://127.0.0.1:8081/ipfs/QmVzKPbmyuaTUjoLqWEA5wPAMkUqe4t6WYKHeeC9Dot4ds";
    // const r1cs_ipfs1 = "http://127.0.0.1:8081/ipfs/QmXP1BC2bc8n1zPnexPoRpFCEDoG9QZc3yZn5Wik5w2TAm";

    // const buff = await fetch(r1cs_ipfs1).then( function(res) {
    //   return res.arrayBuffer();
    // }).then(function (ab) {
    //   return new Uint8Array(ab);
    // });

    // console.log('r1cs_buff: ', buff)
    // // const wasm = "http://127.0.0.1:8081/ipfs/QmUbpEvHHKaHEqYLjhn93S8rEsUGeqiTYgRjGPk7g8tBbz";
    // const zkey_0 = { type: "mem" };
    // const zkey_1 = { type: "mem" };
    // const zkey_final = { type: "mem" };

    // console.log('newZkey')
    // // @ts-ignore
    // await snarkjs.zKey.newZKey(r1cs, ptau_final, zkey_0);

    // console.log('contribute')
    // // @ts-ignore
    // await snarkjs.zKey.contribute(zkey_0, zkey_1, "first_contribution", "entropy_QmbMk4ksBYLQzJ6TiZfzaALF8W11xvB8Wz6a2GrG9oDrXW");

    // console.log('beacon')
    // // @ts-ignore
    // await snarkjs.zKey.beacon(zkey_1, zkey_final, "B3", "0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20", 10);

    // console.log('verifyFromR1cs')
    // // @ts-ignore
    // const verifyFromR1csResult = await snarkjs.zKey.verifyFromR1cs(r1cs, ptau_final, zkey_final);
    // console.assert(verifyFromR1csResult);

    // console.log('verifyFromInit')
    // // @ts-ignore
    // const verifyFromInit = await snarkjs.zKey.verifyFromInit(zkey_0, ptau_final, zkey_final);
    // console.assert(verifyFromInit);

    // console.log('exportVerificationKey')
    // // @ts-ignore
    // const vKey = await snarkjs.zKey.exportVerificationKey(zkey_final)

    // console.log('vKey: ', vKey)
    
    // const templates = {
    //   groth16: await remix.call('fileManager', 'readFile', './zk/templates/groth16_verifier.sol.ejs')
    // }
    // const solidityContract = await snarkjs.zKey.exportSolidityVerifier(zkey_final, templates)
    
    // await remix.call('fileManager', 'writeFile', './zk/build/zk_verifier.sol', solidityContract)
    
    // console.log('buffer', (zkey_final as any).data.length)
    // await remix.call('fileManager', 'writeFile', './zk/build/zk_setup.txt', JSON.stringify(Array.from(((zkey_final as any).data))))
    
    // console.log('setup done.')
  }

  async generateR1cs (path: string, compilationConfig?: CompilationConfig): Promise<void> {
    this.internalEvents.emit('circuit_generating')
    if (compilationConfig) {
      const { prime, version } = compilationConfig

      if ((prime !== "bn128") && (prime !== "bls12381") && (prime !== "goldilocks")) throw new Error('Invalid prime value')
      if (!compiler_list.versions.includes(version)) throw new Error("Unsupported compiler version")
      this._compilationConfig.prime = prime
      this._compilationConfig.version = version
    }
    const fileContent = await this.call('fileManager', 'readFile', path)
    let buildFiles = {
      [path]: fileContent
    }

    buildFiles = await this.resolveDependencies(path, fileContent, buildFiles)
    const r1csApi = generate_r1cs(path, buildFiles, { prime: this._compilationConfig.prime })
    const r1csProgram = r1csApi.program()

    if (r1csProgram.length < 1) {
      const r1csErrors = r1csApi.report()

      this.internalEvents.emit('circuit_errored', r1csErrors)
      throw new Error(r1csErrors)
    } else {
      this.internalEvents.emit('circuit_done')
      const fileName = extractNameFromKey(path)
      const writePath = extractParentFromKey(path) + "/.bin/" + fileName.replace('circom', 'r1cs')
  
      // @ts-ignore
      await this.call('fileManager', 'writeFile', writePath, r1csProgram, true)
    }
  }

  async computeWitness (input: string, wasmPath?: string): Promise<void> {
    this.internalEvents.emit('circuit_computing')
    if (!wasmPath) wasmPath = this.lastCompiledCircuitPath
    if (!wasmPath) throw new Error('No wasm file found')

    // @ts-ignore
    const buffer: any = await this.call('fileManager', 'readFile', wasmPath, true)
    const dataRead = new Uint8Array(buffer)
    const witness = await generate_witness(dataRead, input)
  }

  async resolveDependencies(filePath: string, fileContent: string, output = {}, depPath: string = '', blackPath: string[] = []): Promise<Record<string, string>> {
    // extract all includes
    const includes = (fileContent.match(/include ['"].*['"]/g) || []).map((include) => include.replace(/include ['"]/g, '').replace(/['"]/g, ''))

    await Promise.all(
      includes.map(async (include) => {
        // fix for endless recursive includes
        if (blackPath.includes(include)) return
        let dependencyContent = ''
        let path = include
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
                if (path.indexOf('/') === 0) path = path.slice(1)
                dependencyContent = await this.call('contentImport', 'resolveAndSave', path, null)
              } else {
                // If all import cases are not true, use the default import to try fetching from node_modules and unpkg
                dependencyContent = await this.call('contentImport', 'resolveAndSave', path, null)
              }
            }
          }
        }
        // extract all includes from the dependency content
        const dependencyIncludes = (dependencyContent.match(/include ['"].*['"]/g) || []).map((include) => include.replace(/include ['"]/g, '').replace(/['"]/g, ''))

        blackPath.push(include)
        // recursively resolve all dependencies of the dependency
        if (dependencyIncludes.length > 0) {
          await this.resolveDependencies(filePath, dependencyContent, output, path, blackPath)
          output[include] = dependencyContent
        } else {
          output[include] = dependencyContent
        }
      })
    )
    return output
  }
}
