import * as packageJson from '../../../../../package.json'
import { Plugin } from '@remixproject/engine'

const profile = {
  name: 'hardhat-provider',
  displayName: 'Hardhat Provider',
  kind: 'provider',
  description: 'Hardhat provider',
  methods: ['sendAsync'],
  version: packageJson.version
}

export default class HardhatProvider extends Plugin {
  constructor (blockchain) {
    super(profile)
    this.blockchain = blockchain
  }

  sendAsync (data) {
    return new Promise((resolve, reject) => {
      const provider = this.blockchain.web3().currentProvider
      if (provider) {
        provider[provider.sendAsync ? 'sendAsync' : 'send'](data, (error, message) => {
          if (error) return reject(error)
          resolve(message)
        })
      } else {
        resolve({ jsonrpc: '2.0', result: [], id: data.id })
      }
    })
  }
}

module.exports = HardhatProvider
