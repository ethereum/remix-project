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
  logTimeout: NodeJS.Timeout
  processingTimeout: NodeJS.Timeout

  constructor(private readOnly = false) {
    super()
    this.methods = ['compile', 'sync']
    this.onActivation = () => {
      console.log('Truffle plugin activated')
      this.call('terminal', 'log', { type: 'log', value: 'Truffle plugin activated' })
      this.startListening()
    }
  }

  setWebSocket(websocket: WS): void {
    this.websocket = websocket
    this.websocket.addEventListener('close', () => {
      this.warnLog = false
      if (this.watcher) this.watcher.close()
    })
  }

  sharedFolder(currentSharedFolder: string): void {
    this.currentSharedFolder = currentSharedFolder
    this.buildPath = utils.absolutePath('build/contracts', this.currentSharedFolder)

  }

  startListening() {
    if (fs.existsSync(this.buildPath)) {
      this.listenOnTruffleCompilation()
    }
    else {
      this.listenOnTruffleFolder()
    }
  }

  listenOnTruffleFolder() {
    console.log('Truffle build folder doesn\'t exist... waiting for the compilation.')
    try {
      if (this.watcher) this.watcher.close()
      this.watcher = chokidar.watch(this.currentSharedFolder, { depth: 2, ignorePermissionErrors: true, ignoreInitial: true })
      // watch for new folders
      this.watcher.on('addDir', () => {
        if (fs.existsSync(this.buildPath)) {
          this.listenOnTruffleCompilation()
        }
      })
    } catch (e) {
      console.log(e)
    }
  }

  compile(configPath: string) {
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

  checkPath() {
    if (!fs.existsSync(this.buildPath)) {
      this.listenOnTruffleFolder()
      return false
    }
    return true
  }


  private async processArtifact() {
    if (!this.checkPath()) return
    const folderFiles = await fs.readdir(this.buildPath)
    const filesFound = folderFiles.filter(file => file.endsWith('.json'))
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
    clearTimeout(this.logTimeout)
    this.logTimeout = setTimeout(() => {
      if (filesFound.length === 0) {
        // @ts-ignore
        this.call('terminal', 'log', { value: 'No contract found in the Truffle build folder', type: 'log' })
      } else {
        // @ts-ignore
        this.call('terminal', 'log', { value: 'receiving compilation result from Truffle', type: 'log' })
        console.log('Syncing compilation result from Truffle')
      }
    }, 1000)
  }

  async triggerProcessArtifact() {
    // prevent multiple calls
    clearTimeout(this.processingTimeout)
    this.processingTimeout = setTimeout(async () => await this.processArtifact(), 1000)
  }

  listenOnTruffleCompilation() {
    try {
      if (this.watcher) this.watcher.close()
      this.watcher = chokidar.watch(this.buildPath, { depth: 3, ignorePermissionErrors: true, ignoreInitial: true })
      this.watcher.on('change', async () => await this.triggerProcessArtifact())
      this.watcher.on('add', async () => await this.triggerProcessArtifact())
      // process the artifact on activation
      this.triggerProcessArtifact()
    } catch (e) {
      console.log(e)
    }
  }

  async feedContractArtifactFile(path, content, compilationResultPart) {
    const contentJSON = JSON.parse(content)
    const contractName = basename(path).replace('.json', '')
    compilationResultPart.solcVersion = contentJSON.compiler.version
    // file name in artifacts starts with `project:/`
    const filepath = contentJSON.ast.absolutePath.startsWith('project:/') ? contentJSON.ast.absolutePath.replace('project:/', '') : contentJSON.ast.absolutePath
    compilationResultPart.compilationTarget = filepath
    compilationResultPart.input[path] = { content: contentJSON.source }
    // extract data
    const relPath = utils.relativePath(filepath, this.currentSharedFolder)
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

  async sync() {
    this.processArtifact()
  }
}
