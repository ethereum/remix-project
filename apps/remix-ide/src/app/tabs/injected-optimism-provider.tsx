import * as packageJson from '../../../../../package.json'
import { InjectedProvider } from './injected-provider'

const profile = {
  name: 'injected-optimism-provider',
  displayName: 'Injected Optimism Provider',
  kind: 'provider',
  description: 'injected Optimism Provider',
  methods: ['sendAsync'],
  version: packageJson.version
}

export class Injected0ptimismProvider extends InjectedProvider {
    
  constructor () {
    super(profile)
    this.chainName = 'Optimism'
    this.chainId = '0xa'
    this.rpcUrls = ['https://mainnet.optimism.io']
  }
}