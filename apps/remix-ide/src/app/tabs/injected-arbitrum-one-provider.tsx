import * as packageJson from '../../../../../package.json'
import { InjectedProvider } from './injected-provider'

const profile = {
  name: 'injected-arbitrum-one-provider',
  displayName: 'Injected Arbitrum One Provider',
  kind: 'provider',
  description: 'injected Arbitrum One Provider',
  methods: ['sendAsync'],
  version: packageJson.version
}

export class InjectedArbitrumOneProvider extends InjectedProvider {
  
  constructor () {
    super(profile)
    this.chainName = 'Arbitrum One'
    this.chainId = '0xa4b1'
    this.rpcUrls = ['https://arb1.arbitrum.io/rpc']
  }
}