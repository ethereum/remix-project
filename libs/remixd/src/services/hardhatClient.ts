import * as WS from 'ws' // eslint-disable-line
import { PluginClient } from '@remixproject/plugin'
import * as chokidar from 'chokidar'
import * as utils from '../utils'
import * as fs from 'fs-extra'
import { basename, join } from 'path'
const { spawn } = require('child_process') // eslint-disable-line

export class HardhatClient extends PluginClient {
  methods: Array<string>
  websocket: WS
  currentSharedFolder: string
  watcher: chokidar.FSWatcher
  warnLog: boolean

  constructor (private readOnly = false) {
    super()
    this.methods = ['compile']
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
    this.listenOnHardhatCompilation()
  }

  compile (configPath: string) {
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

  listenOnHardhatCompilation () {
    try {
      const buildPath = utils.absolutePath('artifacts/build-info', this.currentSharedFolder)
      this.watcher = chokidar.watch(buildPath, { depth: 0, ignorePermissionErrors: true, ignoreInitial: true })

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
          if (file.endsWith('.json')) {
            console.log('processing hardhat artifact', file)
            const path = join(buildPath, file)
            const content = await fs.readFile(path, { encoding: 'utf-8' })
            await this.feedContractArtifactFile(content, compilationResult)
          }
        }
        if (!this.warnLog) {
          // @ts-ignore
          this.call('terminal', 'log', 'receiving compilation result from hardhat')
          this.warnLog = true
        }
        this.emit('compilationFinished', '', { sources: compilationResult.input }, 'soljson', compilationResult.output, compilationResult.solcVersion)      
      }

      this.watcher.on('change', () => processArtifact())
      this.watcher.on('add', () => processArtifact())
      // process the artifact on activation
      processArtifact()
    } catch (e) {
      console.log(e)
    }    
  }

  async feedContractArtifactFile (artifactContent, compilationResultPart) {
    const contentJSON = JSON.parse(artifactContent)
    compilationResultPart.solcVersion = contentJSON.solcVersion
    for (const file in contentJSON.input.sources) {
      const source = contentJSON.input.sources[file]
      const absPath = join(this.currentSharedFolder, file)
      if (fs.existsSync(absPath)) { // if not that is a lib
        const contentOnDisk = await fs.readFile(absPath, { encoding: 'utf-8' })
        if (contentOnDisk === source.content) {
          console.log('processing new hardhat artifact for', file)
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
