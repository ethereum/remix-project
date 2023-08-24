import * as packageJson from '../../../../../package.json'
import {InjectedCustomProvider} from './injected-custom-provider'

const profile = {
  name: 'injected-optimism-provider',
  displayName: 'Injected Optimism Provider',
  kind: 'provider',
  description: 'injected Optimism Provider',
  methods: ['sendAsync', 'init'],
  version: packageJson.version
}

export class Injected0ptimismProvider extends InjectedCustomProvider {
  constructor() {
    super(profile, 'Optimism', '0xa', ['https://mainnet.optimism.io'])
  }
}
