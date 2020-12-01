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
    let result = ''
    let error = ''
    child.stdout.on('data', (data) => {
      result += data.toString()
    })
    child.stderr.on('data', (err) => {
      error += err.toString()
    })
    child.on('close', () => {
      if (error !== '') this.emit('error', error)
      else this.emit('log', result)
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
