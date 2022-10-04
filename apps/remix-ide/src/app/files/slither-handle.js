import { WebsocketPlugin } from '@remixproject/engine-web'
import * as packageJson from '../../../../../package.json'

const profile = {
  name: 'slither',
  displayName: 'Slither',
  url: 'ws://127.0.0.1:65523',
  methods: ['analyse'],
  description: 'Using Remixd daemon, run slither static analysis',
  kind: 'other',
  version: packageJson.version,
  documentation: 'https://remix-ide.readthedocs.io/en/latest/slither.html'
}

export class SlitherHandle extends WebsocketPlugin {
  constructor () {
    super(profile)
  }

  callPluginMethod(key, payload = []) {
    if (this.socket.readyState !== this.socket.OPEN) {
      console.log(`${this.profile.name} connection is not opened.`)
      return false
    }
    return super.callPluginMethod(key, payload)
  }
}
