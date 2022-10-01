import { WebsocketPlugin } from '@remixproject/engine-web'
import * as packageJson from '../../../../../package.json'

const profile = {
  name: 'foundry',
  displayName: 'Foundry',
  url: 'ws://127.0.0.1:65525',
  methods: ['sync'],
  description: 'Using Remixd daemon, allow to access foundry API',
  kind: 'other',
  version: packageJson.version
}

export class FoundryHandle extends WebsocketPlugin {
  constructor () {
    super(profile)
  }
}
