import * as WS from 'ws' // eslint-disable-line
import { PluginClient } from '@remixproject/plugin'
const { spawn } = require('child_process')
const gitRegex = '^git\\s[^&|;]*$'

export class GitClient extends PluginClient {
  methods: ['command']
  websocket: WS
  currentSharedFolder: string
  readOnly: boolean

  setWebSocket (websocket: WS): void {
    this.websocket = websocket
  }

  sharedFolder (currentSharedFolder: string, readOnly: boolean): void {
    this.currentSharedFolder = currentSharedFolder
    this.readOnly = readOnly
  }

  command (cmd: string) {
    return new Promise((resolve, reject) => {
      try {
        try {
          validateCommand(cmd, gitRegex)
        } catch (e) {
          return reject(e)
        }
        const options = { cwd: this.currentSharedFolder, shell: true }
        const child = spawn(cmd, options)
        let result = ''
        let error = ''
        child.stdout.on('data', (data) => {
          result += data.toString()
        })
        child.stderr.on('data', (err) => {
          error += err.toString()
        })
        child.on('close', (exitCode) => {
          if (exitCode !== 0) {
            reject(error)
          } else {
            resolve(result + error)
          }
        })
      } catch (e) {
        reject(e)
      }
    })
  }
}

/**
 * Validate that command can be run by service
 * @param cmd
 * @param regex
 */
function validateCommand (cmd, regex) {
  if (!RegExp(regex).test(cmd)) { // git then space and then everything else
    throw new Error('Invalid command for service!')
  }
}
