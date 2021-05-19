import { WebsocketPlugin } from '@remixproject/engine-web'
import * as packageJson from '../../../../../package.json'

const profile = {
  name: 'hardhat',
  displayName: 'Hardhat',
  url: 'ws://127.0.0.1:65522',
  methods: ['compile'],
  description: 'Using Remixd daemon, allow to access hardhat API',
  kind: 'other',
  version: packageJson.version
}

export class HardhatHandle extends WebsocketPlugin {
  constructor () {
    super(profile)
  }
}
