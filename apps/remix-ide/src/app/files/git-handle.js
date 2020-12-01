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
}
