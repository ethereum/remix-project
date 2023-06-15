/* global ethereum */
import * as packageJson from '../../../../../package.json'
import { InjectedProvider } from './injected-provider'

const profile = {
  name: 'injected-trustwallet',
  displayName: 'Trust wallet',
  kind: 'provider',
  description: 'Trust wallet',
  methods: ['sendAsync', 'init'],
  version: packageJson.version
}

export class InjectedProviderTrustWallet extends InjectedProvider { 
  constructor () {
    super(profile)
  }

  getInjectedProvider () {
    return (window as any).trustwallet
  }

  notFound () {
    return 'Could not find Trust Wallet provider. Please make sure the Trust Wallet extension is active. Download the latest version from https://trustwallet.com/browser-extension'
  }
}
