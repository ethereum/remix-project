/* global ethereum */
import * as packageJson from '../../../../../package.json'
import { InjectedProvider } from './injected-provider'

export class InjectedProviderDefaultBase extends InjectedProvider {  
  constructor (profile) {
    super(profile)
  }

  async init () {    
    const injectedProvider = this.getInjectedProvider()
    if (injectedProvider && injectedProvider._metamask && injectedProvider._metamask.isUnlocked) {
      if (!await injectedProvider._metamask.isUnlocked()) this.call('notification', 'toast', 'Please make sure the injected provider is unlocked (e.g Metamask).')
    }
    return super.init()
  }

  getInjectedProvider () {
    return (window as any).ethereum
  }

  notFound () {
    return 'No injected provider found. Make sure your provider (e.g. MetaMask, ...) is active and running (when recently activated you may have to reload the page).'
  }
}

const profile = {
  name: 'injected',
  displayName: 'Injected Provider',
  kind: 'provider',
  description: 'injected Provider',
  methods: ['sendAsync', 'init'],
  version: packageJson.version
}

export class InjectedProviderDefault extends InjectedProviderDefaultBase {
  constructor () {
    super(profile)
  }
}
