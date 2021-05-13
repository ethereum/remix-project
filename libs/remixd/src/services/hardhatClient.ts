import * as WS from 'ws' // eslint-disable-line
import { PluginClient } from '@remixproject/plugin'
const { spawn } = require('child_process')

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
  }

  compile (configPath: string) {
    return new Promise((resolve, reject) => {
      if (this.readOnly) {
        const errMsg = '[Hardhat Compilation]: Cannot compile in read-only mode'
        console.log('\x1b[31m%s\x1b[0m', `${errMsg}`)
        return reject(new Error(errMsg))
      }
      const cmd = `npx hardhat compile --config ${configPath}`
      const options = { cwd: this.currentSharedFolder, shell: true }
      const child = spawn(cmd, options)
      let result = ''
      let error = ''
      child.stdout.on('data', (data) => {
        console.log('\x1b[32m%s\x1b[0m', `[Hardhat Compilation]: ${data.toString()}`)
        result += data.toString()
      })
      child.stderr.on('data', (err) => {
        console.log('\x1b[31m%s\x1b[0m', `[Hardhat Compilation]: ${err.toString()}`)
        error += err.toString()
      })
      child.on('close', () => {
        if (error) reject(error)
        else resolve(result)
      })
    })
  }
}
