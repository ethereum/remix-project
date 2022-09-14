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

  constructor (private readOnly = false) {
    super()
    this.methods = ['compile']
  }

  setWebSocket (websocket: WS): void {
    this.websocket = websocket
    this.websocket.addEventListener('close', () => {
      this.warnlog = false
      if (this.watcher) this.watcher.close()
    })
  }

  sharedFolder (currentSharedFolder: string): void {
    this.currentSharedFolder = currentSharedFolder
    this.listenOnFoundryCompilation()
  }

  compile (configPath: string) {
    return new Promise((resolve, reject) => {
      if (this.readOnly) {
        const errMsg = '[Hardhat Compilation]: Cannot compile in read-only mode'
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

  listenOnFoundryCompilation () {
    try {
      const buildPath = utils.absolutePath('out', this.currentSharedFolder)
      this.watcher = chokidar.watch(buildPath, { depth: 3, ignorePermissionErrors: true, ignoreInitial: true })
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
          await this.readContract(join(buildPath, file), compilationResult)
        }
        if (!this.warnlog) {
          // @ts-ignore
          this.call('terminal', 'log', 'receiving compilation result from foundry')
          this.warnlog = true
        }
        this.emit('compilationFinished', '', compilationResult.input, 'soljson', compilationResult.output, compilationResult.solcVersion)      
      }
      this.watcher.on('change', async (f: string) => processArtifact())
      this.watcher.on('add', async (f: string) => processArtifact())
    } catch (e) {
      console.log(e)
    }    
  }

  async readContract (contractFolder, compilationResultPart) {
    const files = await fs.readdir(contractFolder)
    
    for (const file of files) {
      const content = await fs.readFile(join(contractFolder, file), { encoding: 'utf-8' })
      await this.feedContractArtifactFile(file, content, compilationResultPart)
    }
  }

  async feedContractArtifactFile (path, content, compilationResultPart) {
    const contentJSON = JSON.parse(content)
    if (path.endsWith('.metadata.json')) {
      // extract source and version
      compilationResultPart.solcVersion = contentJSON.compiler.version
      for (const path in contentJSON.sources) {
        const absPath = utils.absolutePath(path, this.currentSharedFolder)
        try {
          const content = await fs.readFile(absPath, { encoding: 'utf-8' })
          compilationResultPart.input[path] = { content }
        } catch (e) {
          compilationResultPart.input[path] = { content: '' }
        }        
      }
    } else {
      const contractName = basename(path).replace('.json', '')
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
          bytecode: contentJSON.bytecode,
          deployedBytecode: contentJSON.deployedBytecode,
          methodIdentifiers: contentJSON.methodIdentifiers
        }
      }
    }
  }
}
