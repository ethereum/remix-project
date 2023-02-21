import * as packageJson from '../../../../../package.json'
import { InjectedL2Provider } from './injected-L2-provider'

const profile = {
  name: 'injected-optimism-provider',
  displayName: 'Injected Optimism Provider',
  kind: 'provider',
  description: 'injected Optimism Provider',
  methods: ['sendAsync', 'init'],
  version: packageJson.version
}

export class Injected0ptimismProvider extends InjectedL2Provider {
    
  constructor () {
    super(profile, 'Optimism', '0xa', ['https://mainnet.optimism.io'])
  }
}