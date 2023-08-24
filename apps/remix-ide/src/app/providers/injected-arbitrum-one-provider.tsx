import * as packageJson from '../../../../../package.json'
import {InjectedCustomProvider} from './injected-custom-provider'

const profile = {
  name: 'injected-arbitrum-one-provider',
  displayName: 'Injected Arbitrum One Provider',
  kind: 'provider',
  description: 'injected Arbitrum One Provider',
  methods: ['sendAsync', 'init'],
  version: packageJson.version
}

export class InjectedArbitrumOneProvider extends InjectedCustomProvider {
  constructor() {
    super(profile, 'Arbitrum One', '0xa4b1', ['https://arb1.arbitrum.io/rpc'])
  }
}
