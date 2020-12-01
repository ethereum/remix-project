import * as WS from 'ws' // eslint-disable-line
import { PluginClient } from '@remixproject/plugin'
const { spawn } = require('child_process')

export class GitClient extends PluginClient {
  methods: ['execute']
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

  execute (cmd: string) {
    assertCommand(cmd)
    const options = { cwd: this.currentSharedFolder, shell: true }
    const child = spawn(cmd, options)
    child.stdout.on('data', (data) => {
      this.emit('log', data.toString())
    })
    child.stderr.on('data', (err) => {
      this.emit('error', err.toString())
    })
    child.on('close', (exitCode) => {
      if (exitCode !== 0) {
        this.emit('error', 'exit with ' + exitCode)
      }
    })
  }
}

/**
 * Validate that command can be run by service
 * @param cmd
 */
function assertCommand (cmd) {
  const regex = '^git\\s[^&|;]*$'
  if (!RegExp(regex).test(cmd)) { // git then space and then everything else
    throw new Error('Invalid command for service!')
  }
}
