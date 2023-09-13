import * as packageJson from '../../../../../package.json'
import {InjectedCustomProvider} from './injected-custom-provider'

const profile = {
  name: 'injected-ephemery-testnet-provider',
  displayName: 'Injected Ephemery Testnet Provider',
  kind: 'provider',
  description: 'Injected Ephemery Testnet Provider',
  methods: ['sendAsync', 'init'],
  version: packageJson.version
}

export class InjectedEphemeryTestnetProvider extends InjectedCustomProvider {
  constructor() {
    super(profile, 
      'Ephemery Testnet',
      '',
      ['https://otter.bordel.wtf/erigon', 'https://eth.ephemeral.zeus.fyi'],
      {
        "name": "Ephemery ETH",
        "symbol": "ETH",
        "decimals": 18
      },
      [
        'https://otter.bordel.wtf/',
        'https://explorer.ephemery.dev/'
      ] 
    )
  }
}
