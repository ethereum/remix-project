import * as WS from 'ws' // eslint-disable-line
import { PluginClient } from '@remixproject/plugin'
import * as chokidar from 'chokidar'
import * as utils from '../utils'
import * as fs from 'fs-extra'
import { basename, join } from 'path'
const { spawn } = require('child_process') // eslint-disable-line

export class TruffleClient extends PluginClient {
  methods: Array<string>
  websocket: WS
  currentSharedFolder: string

  constructor (private readOnly = false) {
    super()
    this.methods = ['compile']
  }

  setWebSocket (websocket: WS): void {
    this.websocket = websocket
  }

  sharedFolder (currentSharedFolder: string): void {
    this.currentSharedFolder = currentSharedFolder
    this.listenOnTruffleCompilation()
  }

  compile (configPath: string) {
    return new Promise((resolve, reject) => {
      if (this.readOnly) {
        const errMsg = '[Truffle Compilation]: Cannot compile in read-only mode'
        return reject(new Error(errMsg))
      }
      const cmd = `truffle compile --config ${configPath}`
      const options = { cwd: this.currentSharedFolder, shell: true }
      const child = spawn(cmd, options)
      let result = ''
      let error = ''
      child.stdout.on('data', (data) => {
        const msg = `[Truffle Compilation]: ${data.toString()}`
        console.log('\x1b[32m%s\x1b[0m', msg)
        result += msg + '\n'
      })
      child.stderr.on('data', (err) => {
        error += `[Truffle Compilation]: ${err.toString()} \n`
      })
      child.on('close', () => {
        if (error && result) resolve(error + result)
        else if (error) reject(error)
        else resolve(result)
      })
    })
  }

  listenOnTruffleCompilation () {
    try {
      const buildPath = utils.absolutePath('out', this.currentSharedFolder)
      const watcher = chokidar.watch(buildPath, { depth: 3, ignorePermissionErrors: true })
      const compilationResult = {
        input: {},
        output: {
          contracts: {},
          sources: {}
        },
        solcVersion: null
      }
      const processArtifact = async () => {
        const folderFiles = await fs.readdir(buildPath)
        // name of folders are file names
        for (const file of folderFiles) {
          const content = await fs.readFile(join(buildPath, file), { encoding: 'utf-8' })
          await this.feedContractArtifactFile(file, content, compilationResult)
        }
        // @ts-ignore
        this.call('terminal', 'log', 'updated compilation result from truffle')
        this.emit('compilationFinished', '', compilationResult.input, 'soljson', compilationResult.output, compilationResult.solcVersion)      
      }
      watcher.on('change', async (f: string) => processArtifact())
      watcher.on('add', async (f: string) => processArtifact())
    } catch (e) {
      console.log(e)
    }    
  }

  async feedContractArtifactFile (path, content, compilationResultPart) {
    const contentJSON = JSON.parse(content)
    const contractName = basename(path).replace('.json', '')
    compilationResultPart.solcVersion = contentJSON.compiler.version
    compilationResultPart.input[path] = { content: contentJSON.source }
    // extract data
    if (!compilationResultPart.output['sources'][contentJSON.ast.absolutePath]) compilationResultPart.output['sources'][contentJSON.ast.absolutePath] = {}
    compilationResultPart.output['sources'][contentJSON.ast.absolutePath] = {
      ast: contentJSON['ast'],
      id: contentJSON['id']
    }
    if (!compilationResultPart.output['contracts'][contentJSON.ast.absolutePath]) compilationResultPart.output['contracts'][contentJSON.ast.absolutePath] = {}
    // delete contentJSON['ast']
    compilationResultPart.output['contracts'][contentJSON.ast.absolutePath][contractName] = {
      abi: contentJSON.abi,
      evm: {
        bytecode: {
          object: contentJSON.bytecode,
          sourceMap: contentJSON.sourceMap,
          linkReferences: contentJSON.linkReferences
        },
        deployedBytecode: {
          object: contentJSON.deployedBytecode,
          sourceMap: contentJSON.deployedSourceMap,
          linkReferences: contentJSON.deployedLinkReferences
        }
      }
    }
  }
}
