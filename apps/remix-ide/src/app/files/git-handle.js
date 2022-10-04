import { WebsocketPlugin } from '@remixproject/engine-web'
import * as packageJson from '../../../../../package.json'

const profile = {
  name: 'git',
  displayName: 'Git',
  url: 'ws://127.0.0.1:65521',
  methods: ['execute'],
  description: 'Using Remixd daemon, allow to access git API',
  kind: 'other',
  version: packageJson.version
}

export class GitHandle extends WebsocketPlugin {
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
