import * as WS from 'ws' // eslint-disable-line
import { PluginClient } from '@remixproject/plugin'
import * as chokidar from 'chokidar'
import * as utils from '../utils'
import * as fs from 'fs-extra'
const { spawn } = require('child_process') // eslint-disable-line

export class HardhatClient extends PluginClient {
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
      const watcher = chokidar.watch(buildPath, { depth: 0, ignorePermissionErrors: true })
      watcher.on('change', async (f: string) => {
        const content = await fs.readFile(f, { encoding: 'utf-8' })
        const compilationResult = JSON.parse(content)
        this.call('terminal', 'log', {type: 'info', value: 'received compilation result from hardhat'})
        this.emit('compilationFinished', '', compilationResult.input, 'soljson', compilationResult.output, compilationResult.solcVersion)
      })
    } catch (e) {
      console.log(e)
    }    
  }
}
