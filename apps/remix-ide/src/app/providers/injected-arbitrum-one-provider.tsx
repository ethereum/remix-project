import * as packageJson from '../../../../../package.json'
import { InjectedL2Provider } from './injected-L2-provider'

const profile = {
  name: 'injected-arbitrum-one-provider',
  displayName: 'Injected Arbitrum One Provider',
  kind: 'provider',
  description: 'injected Arbitrum One Provider',
  methods: ['sendAsync', 'init'],
  version: packageJson.version
}

export class InjectedArbitrumOneProvider extends InjectedL2Provider {
  
  constructor () {
    super(profile, 'Arbitrum One', '0xa4b1', ['https://arb1.arbitrum.io/rpc'])
  }
}