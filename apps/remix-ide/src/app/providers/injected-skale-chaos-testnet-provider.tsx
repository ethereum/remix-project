import * as packageJson from '../../../../../package.json'
import { InjectedL2Provider } from './injected-L2-provider'

const profile = {
  name: 'injected-skale-chaos-testnet-provider',
  displayName: 'Injected SKALE Chaos Testnet',
  kind: 'provider',
  description: 'Injected SKALE Chaos Testnet Provider',
  methods: ['sendAsync', 'init'],
  version: packageJson.version
}

export class InjectedSKALEChaosTestnetProvider extends InjectedL2Provider {

  constructor () {
    super(profile, 'SKALE Chaos Testnet', '0x50877ed6', ['https://staging-v3.skalenodes.com/v1/staging-fast-active-bellatrix'])
  }
}
