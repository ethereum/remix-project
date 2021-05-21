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
  constructor () {
    super(profile)
    this.provider = null
  }

  sendAsync (data) {
    return new Promise((resolve, reject) => {
      if (this.provider) {
        this.provider[this.provider.sendAsync ? 'sendAsync' : 'send'](data, (error, message) => {
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
