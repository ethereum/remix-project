import * as WS from 'ws' // eslint-disable-line
import { PluginClient } from '@remixproject/plugin'
const { spawn } = require('child_process')

export class HardhatClient extends PluginClient {
  methods: Array<string>
  websocket: WS
  currentSharedFolder: string

  constructor (private readOnly = false) {
    super()
    console.log('this is HardhatClient constructor')
    this.methods = ['compile']
  }

  setWebSocket (websocket: WS): void {
    this.websocket = websocket
  }

  sharedFolder (currentSharedFolder: string): void {
    this.currentSharedFolder = currentSharedFolder
  }

  compile (configPath: string) {
    const cmd = `npx hardhat compile --config ${configPath}`
    const options = { cwd: this.currentSharedFolder, shell: true }
    const child = spawn(cmd, options)
    let result = ''
    let error = ''
    return new Promise((resolve, reject) => {
      child.stdout.on('data', (data) => {
        console.log('data in compile in HardhatClient', data)
        result += data.toString()
      })
      child.stderr.on('data', (err) => {
        error += err.toString()
      })
      child.on('close', () => {
        if (error) reject(error)
        else resolve(result)
      })
    })
  }
}
