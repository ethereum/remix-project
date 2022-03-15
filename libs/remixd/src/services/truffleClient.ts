import * as WS from 'ws' // eslint-disable-line
import { PluginClient } from '@remixproject/plugin'
const { spawn } = require('child_process') // eslint-disable-line

export class TruffleClient extends PluginClient {
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
        const errMsg = '[Truffle Compilation]: Cannot compile in read-only mode'
        return reject(new Error(errMsg))
      }
    })
  }
}
