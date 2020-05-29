import { Plugin } from '@remixproject/engine'
import * as packageJson from '../../../package.json'

export const profile = {
  name: 'web3Provider',
  displayName: 'Global Web3 Provider',
  description: 'Represent the current web3 provider used by the app at global scope',
  methods: ['sendAsync'],
  version: packageJson.version,
  kind: 'provider'
}

export class Web3ProviderModule extends Plugin {
  constructor (blockchain) {
    super(profile)
    this.blockchain = blockchain
  }

  /*
    that is used by plugins to call the current ethereum provider.
    Should be taken carefully and probably not be release as it is now.
  */
  sendAsync (payload) {
    return new Promise((resolve, reject) => {
      this.blockchain.web3().currentProvider.sendAsync(payload, (error, message) => {
        if (error) return reject(error)
        resolve(message)
      })
    })
  }
}
