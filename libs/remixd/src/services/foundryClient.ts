import * as WS from 'ws' // eslint-disable-line
import { PluginClient } from '@remixproject/plugin'
import * as chokidar from 'chokidar'
import * as utils from '../utils'
import * as fs from 'fs-extra'
import { basename, join } from 'path'
const { spawn } = require('child_process') // eslint-disable-line

export class FoundryClient extends PluginClient {
  methods: Array<string>
  websocket: WS
  currentSharedFolder: string
  watcher: chokidar.FSWatcher
  warnlog: boolean
  buildPath: string
  cachePath: string
  logTimeout: NodeJS.Timeout
  processingTimeout: NodeJS.Timeout

  constructor(private readOnly = false) {
    super()
    this.methods = ['compile', 'sync']
    this.onActivation = () => {
      console.log('Foundry plugin activated')
      this.call('terminal', 'log', { type: 'log', value: 'Foundry plugin activated' })
      this.startListening()
    }
  }

  setWebSocket(websocket: WS): void {
    this.websocket = websocket
    this.websocket.addEventListener('close', () => {
      this.warnlog = false
      if (this.watcher) this.watcher.close()
    })
  }

  sharedFolder(currentSharedFolder: string): void {
    this.currentSharedFolder = currentSharedFolder
    this.buildPath = utils.absolutePath('out', this.currentSharedFolder)
    this.cachePath = utils.absolutePath('cache', this.currentSharedFolder)
  }

  startListening() {
    if (fs.existsSync(this.buildPath) && fs.existsSync(this.cachePath)) {
      this.listenOnFoundryCompilation()
    } else {
      this.listenOnFoundryFolder()
    }
  }

  listenOnFoundryFolder() {
    console.log('Foundry out folder doesn\'t exist... waiting for the compilation.')
    try {
      if(this.watcher) this.watcher.close()
      this.watcher = chokidar.watch(this.currentSharedFolder, { depth: 1, ignorePermissionErrors: true, ignoreInitial: true })
      // watch for new folders
      this.watcher.on('addDir', () => {
        if (fs.existsSync(this.buildPath) && fs.existsSync(this.cachePath)) {
          this.listenOnFoundryCompilation()
        }
      })
    } catch (e) {
      console.log(e)
    }
  }

  compile() {
    return new Promise((resolve, reject) => {
      if (this.readOnly) {
        const errMsg = '[Foundry Compilation]: Cannot compile in read-only mode'
        return reject(new Error(errMsg))
      }
      const cmd = `forge build`
      const options = { cwd: this.currentSharedFolder, shell: true }
      const child = spawn(cmd, options)
      let result = ''
      let error = ''
      child.stdout.on('data', (data) => {
        const msg = `[Foundry Compilation]: ${data.toString()}`
        console.log('\x1b[32m%s\x1b[0m', msg)
        result += msg + '\n'
      })
      child.stderr.on('data', (err) => {
        error += `[Foundry Compilation]: ${err.toString()} \n`
      })
      child.on('close', () => {
        if (error && result) resolve(error + result)
        else if (error) reject(error)
        else resolve(result)
      })
    })
  }

  checkPath() {
    if (!fs.existsSync(this.buildPath) || !fs.existsSync(this.cachePath)) {
      this.listenOnFoundryFolder()
      return false
    }
    if (!fs.existsSync(join(this.cachePath, 'solidity-files-cache.json'))) return false
    return true
  }

  private async processArtifact() {
    if (!this.checkPath()) return
    const folderFiles = await fs.readdir(this.buildPath) // "out" folder
    try {
      const cache = JSON.parse(await fs.readFile(join(this.cachePath, 'solidity-files-cache.json'), { encoding: 'utf-8' }))
      // name of folders are file names
      for (const file of folderFiles) {
        const path = join(this.buildPath, file) // out/Counter.sol/
        const compilationResult = {
          input: {},
          output: {
            contracts: {},
            sources: {}
          },
          solcVersion: null,
          compilationTarget: null
        }
        await this.readContract(path, compilationResult, cache)
        this.emit('compilationFinished', compilationResult.compilationTarget, { sources: compilationResult.input }, 'soljson', compilationResult.output, compilationResult.solcVersion)
      }

      clearTimeout(this.logTimeout)
      this.logTimeout = setTimeout(() => {
        // @ts-ignore
        this.call('terminal', 'log', { type: 'log', value: `receiving compilation result from Foundry` })
        console.log('Syncing compilation result from Foundry')  
      }, 1000)

    } catch (e) {
      console.log(e)
    }
  }

  async triggerProcessArtifact() {
    // prevent multiple calls
    clearTimeout(this.processingTimeout)
    this.processingTimeout = setTimeout(async () => await this.processArtifact(), 1000)
  }

  listenOnFoundryCompilation() {
    try {
      if(this.watcher) this.watcher.close()
      this.watcher = chokidar.watch(this.cachePath, { depth: 0, ignorePermissionErrors: true, ignoreInitial: true })
      this.watcher.on('change', async () => await this.triggerProcessArtifact())
      this.watcher.on('add', async () => await this.triggerProcessArtifact())
      // process the artifact on activation
      this.triggerProcessArtifact()
    } catch (e) {
      console.log(e)
    }
  }

  async readContract(contractFolder, compilationResultPart, cache) {
    const files = await fs.readdir(contractFolder)

    for (const file of files) {
      const path = join(contractFolder, file)
      const content = await fs.readFile(path, { encoding: 'utf-8' })
      await this.feedContractArtifactFile(file, content, compilationResultPart, cache)
    }
  }

  async feedContractArtifactFile(path, content, compilationResultPart, cache) {
    const contentJSON = JSON.parse(content)
    const contractName = basename(path).replace('.json', '')

    const currentCache = cache.files[contentJSON.ast.absolutePath]
    if (!currentCache.artifacts[contractName]) return

    // extract source and version
    const metadata = contentJSON.metadata
    if (metadata.compiler && metadata.compiler.version) {
      compilationResultPart.solcVersion = metadata.compiler.version
    } else {
      compilationResultPart.solcVersion = ''
      console.log('\x1b[32m%s\x1b[0m', 'compiler version not found, please update Foundry to the latest version.')
    }

    if (metadata.sources) {
      for (const path in metadata.sources) {
        const absPath = utils.absolutePath(path, this.currentSharedFolder)
        try {
          const content = await fs.readFile(absPath, { encoding: 'utf-8' })
          compilationResultPart.input[path] = { content }
        } catch (e) {
          compilationResultPart.input[path] = { content: '' }
        }
      }
    } else {
      console.log('\x1b[32m%s\x1b[0m', 'sources input not found, please update Foundry to the latest version.')
    }


    compilationResultPart.compilationTarget = contentJSON.ast.absolutePath
    // extract data
    if (!compilationResultPart.output['sources'][contentJSON.ast.absolutePath]) compilationResultPart.output['sources'][contentJSON.ast.absolutePath] = {}
    compilationResultPart.output['sources'][contentJSON.ast.absolutePath] = {
      ast: contentJSON['ast'],
      id: contentJSON['id']
    }
    if (!compilationResultPart.output['contracts'][contentJSON.ast.absolutePath]) compilationResultPart.output['contracts'][contentJSON.ast.absolutePath] = {}

    contentJSON.bytecode.object = contentJSON.bytecode.object.replace('0x', '')
    contentJSON.deployedBytecode.object = contentJSON.deployedBytecode.object.replace('0x', '')
    compilationResultPart.output['contracts'][contentJSON.ast.absolutePath][contractName] = {
      abi: contentJSON.abi,
      evm: {
        bytecode: contentJSON.bytecode,
        deployedBytecode: contentJSON.deployedBytecode,
        methodIdentifiers: contentJSON.methodIdentifiers
      }
    }
  }

  async sync() {
    console.log('syncing Foundry with Remix...')
    this.processArtifact()
  }
}
