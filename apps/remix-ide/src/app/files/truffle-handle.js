import { WebsocketPlugin } from '@remixproject/engine-web'
import * as packageJson from '../../../../../package.json'

const profile = {
  name: 'truffle',
  displayName: 'truffle',
  url: 'ws://127.0.0.1:65524',
  methods: ['compile'],
  description: 'Using Remixd daemon, allow to access truffle API',
  kind: 'other',
  version: packageJson.version
}

export class TruffleHandle extends WebsocketPlugin {
  constructor () {
    super(profile)
  }
}
