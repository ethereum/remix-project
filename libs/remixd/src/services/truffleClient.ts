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
  watcher: chokidar.FSWatcher
  warnLog: boolean
  buildPath: string

  constructor (private readOnly = false) {
    super()
    this.methods = ['compile', 'sync']
  }

  setWebSocket (websocket: WS): void {
    this.websocket = websocket
    this.websocket.addEventListener('close', () => {
      this.warnLog = false
      if (this.watcher) this.watcher.close()
    })
  }

  sharedFolder (currentSharedFolder: string): void {
    this.currentSharedFolder = currentSharedFolder
    this.buildPath = utils.absolutePath('build/contracts', this.currentSharedFolder)
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

  private async processArtifact () {
    const folderFiles = await fs.readdir(this.buildPath)    
    // name of folders are file names
    for (const file of folderFiles) {
      if (file.endsWith('.json')) {
        const compilationResult = {
          input: {},
          output: {
            contracts: {},
            sources: {}
          },
          solcVersion: null,
          compilationTarget: null
        }
        const content = await fs.readFile(join(this.buildPath, file), { encoding: 'utf-8' })
        await this.feedContractArtifactFile(file, content, compilationResult)
        this.emit('compilationFinished', compilationResult.compilationTarget, { sources: compilationResult.input }, 'soljson', compilationResult.output, compilationResult.solcVersion)
  
      }
    }
    if (!this.warnLog) {
      // @ts-ignore
      this.call('terminal', 'log', 'receiving compilation result from Truffle')
      this.warnLog = true
    }
  }

  listenOnTruffleCompilation () {
    try {      
      this.watcher = chokidar.watch(this.buildPath, { depth: 3, ignorePermissionErrors: true, ignoreInitial: true })
     
      this.watcher.on('change', async (f: string) => this.processArtifact())
      this.watcher.on('add', async (f: string) => this.processArtifact())
      // process the artifact on activation
      setTimeout(() => this.processArtifact(), 1000)
    } catch (e) {
      console.log(e)
    }    
  }

  async feedContractArtifactFile (path, content, compilationResultPart) {
    const contentJSON = JSON.parse(content)
    const contractName = basename(path).replace('.json', '')
    compilationResultPart.solcVersion = contentJSON.compiler.version
    compilationResultPart.compilationTarget = contentJSON.ast.absolutePath
    compilationResultPart.input[path] = { content: contentJSON.source }
    // extract data
    const relPath = utils.relativePath(contentJSON.ast.absolutePath, this.currentSharedFolder)
    if (!compilationResultPart.output['sources'][relPath]) compilationResultPart.output['sources'][relPath] = {}
    
    const location = contentJSON.ast.src.split(':')
    const id = parseInt(location[location.length - 1])
    
    compilationResultPart.output['sources'][relPath] = {
      ast: contentJSON.ast,
      id
    }
    if (!compilationResultPart.output['contracts'][relPath]) compilationResultPart.output['contracts'][relPath] = {}
    // delete contentJSON['ast']
    compilationResultPart.output['contracts'][relPath][contractName] = {
      abi: contentJSON.abi,
      evm: {
        bytecode: {
          object: contentJSON.bytecode.replace('0x', ''),
          sourceMap: contentJSON.sourceMap,
          linkReferences: contentJSON.linkReferences
        },
        deployedBytecode: {
          object: contentJSON.deployedBytecode.replace('0x', ''),
          sourceMap: contentJSON.deployedSourceMap,
          linkReferences: contentJSON.deployedLinkReferences
        }
      }
    }
  }

  async sync () {
    console.log('syncing from Truffle')
    this.processArtifact()
    // @ts-ignore
    this.call('terminal', 'log', 'synced with Truffle')
  }
}
