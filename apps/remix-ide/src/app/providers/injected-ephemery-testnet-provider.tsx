import * as packageJson from '../../../../../package.json'
import {InjectedL2Provider} from './injected-L2-provider'

const profile = {
  name: 'injected-ephemery-testnet-provider',
  displayName: 'Injected Ephemery Testnet Provider',
  kind: 'provider',
  description: 'Injected Ephemery Testnet Provider',
  methods: ['sendAsync', 'init'],
  version: packageJson.version
}

export class InjectedEphemeryTestnetProvider extends InjectedL2Provider {
  constructor() {
    super(profile, 'Optimism', '0x259C709', [
      'https://otter.bordel.wtf/erigon',
      'https://eth.ephemeral.zeus.fyi'
    ])
  }
}
