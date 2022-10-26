import * as WS from 'ws' // eslint-disable-line
import { PluginClient } from '@remixproject/plugin'
import * as chokidar from 'chokidar'
import * as utils from '../utils'
import * as fs from 'fs-extra'
import { join } from 'path'
const { spawn } = require('child_process') // eslint-disable-line

export class HardhatClient extends PluginClient {
  methods: Array<string>
  websocket: WS
  currentSharedFolder: string
  watcher: chokidar.FSWatcher
  warnLog: boolean
  buildPath: string

  constructor(private readOnly = false) {
    super()
    this.methods = ['compile', 'sync']
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
    this.buildPath = utils.absolutePath('artifacts/contracts', this.currentSharedFolder)
    this.listenOnHardhatCompilation()
  }

  compile(configPath: string) {
    return new Promise((resolve, reject) => {
      if (this.readOnly) {
        const errMsg = '[Hardhat Compilation]: Cannot compile in read-only mode'
        return reject(new Error(errMsg))
      }
      const cmd = `npx hardhat compile --config ${configPath}`
      const options = { cwd: this.currentSharedFolder, shell: true }
      const child = spawn(cmd, options)
      let result = ''
      let error = ''
      child.stdout.on('data', (data) => {
        const msg = `[Hardhat Compilation]: ${data.toString()}`
        console.log('\x1b[32m%s\x1b[0m', msg)
        result += msg + '\n'
      })
      child.stderr.on('data', (err) => {
        error += `[Hardhat Compilation]: ${err.toString()} \n`
      })
      child.on('close', () => {
        if (error && result) resolve(error + result)
        else if (error) reject(error)
        else resolve(result)
      })
    })
  }

  private async processArtifact() {
    // resolving the files
    const folderFiles = await fs.readdir(this.buildPath)
    const targetsSynced = []
    // name of folders are file names
    for (const file of folderFiles) { // ["artifacts/contracts/Greeter.sol/"]
      const contractFilePath = join(this.buildPath, file)
      const stat = await fs.stat(contractFilePath)
      if (!stat.isDirectory()) continue
      const files = await fs.readdir(contractFilePath)
      const compilationResult = {
        input: {},
        output: {
          contracts: {},
          sources: {}
        },
        solcVersion: null,
        target: null
      }
      for (const file of files) {
        if (file.endsWith('.dbg.json')) { // "artifacts/contracts/Greeter.sol/Greeter.dbg.json"
          const stdFile = file.replace('.dbg.json', '.json')
          const contentStd = await fs.readFile(join(contractFilePath, stdFile), { encoding: 'utf-8' })
          const contentDbg = await fs.readFile(join(contractFilePath, file), { encoding: 'utf-8' })
          const jsonDbg = JSON.parse(contentDbg)
          const jsonStd = JSON.parse(contentStd)
          compilationResult.target = jsonStd.sourceName

          targetsSynced.push(compilationResult.target)
          const path = join(contractFilePath, jsonDbg.buildInfo)
          const content = await fs.readFile(path, { encoding: 'utf-8' })

          await this.feedContractArtifactFile(content, compilationResult)
        }
        if (compilationResult.target) {
          // we are only interested in the contracts that are in the target of the compilation
          compilationResult.output = {
            ...compilationResult.output,
            contracts: { [compilationResult.target]: compilationResult.output.contracts[compilationResult.target] }
          }
          this.emit('compilationFinished', compilationResult.target, { sources: compilationResult.input }, 'soljson', compilationResult.output, compilationResult.solcVersion)
        }
      }
    }
    if (!this.warnLog) {
      this.call('terminal', 'log', { value: 'receiving compilation result from Hardhat', type: 'info'} )
      this.warnLog = true
    }
    if (targetsSynced.length) {
      console.log(`Processing artifacts for files: ${[...new Set(targetsSynced)].join(', ')}`)
      this.call('terminal', 'log', { type: 'info', value: `synced with Hardhat: ${[...new Set(targetsSynced)].join(', ')}` })
    }
  }

  listenOnHardhatCompilation() {
    try {
      this.watcher = chokidar.watch(this.buildPath, { depth: 1, ignorePermissionErrors: true, ignoreInitial: true })

      this.watcher.on('change', () => this.processArtifact())
      this.watcher.on('add', () => this.processArtifact())
      // process the artifact on activation
      setTimeout(() => this.processArtifact(), 1000)
    } catch (e) {
      console.log(e)
    }
  }

  async sync() {
    console.log('syncing from Hardhat')
    this.processArtifact()
  }

  async feedContractArtifactFile(artifactContent, compilationResultPart) {
    const contentJSON = JSON.parse(artifactContent)
    compilationResultPart.solcVersion = contentJSON.solcVersion
    for (const file in contentJSON.input.sources) {
      const source = contentJSON.input.sources[file]
      const absPath = join(this.currentSharedFolder, file)
      if (fs.existsSync(absPath)) { // if not that is a lib
        const contentOnDisk = await fs.readFile(absPath, { encoding: 'utf-8' })
        if (contentOnDisk === source.content) {
          compilationResultPart.input[file] = source
          compilationResultPart.output['sources'][file] = contentJSON.output.sources[file]
          compilationResultPart.output['contracts'][file] = contentJSON.output.contracts[file]
          if (contentJSON.output.errors && contentJSON.output.errors.length) {
            compilationResultPart.output['errors'] = contentJSON.output.errors.filter(error => error.sourceLocation.file === file)
          }
        }
      }
    }
  }
}
