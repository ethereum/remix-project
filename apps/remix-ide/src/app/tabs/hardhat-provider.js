import * as packageJson from '../../../../../package.json'
import { Plugin } from '@remixproject/engine'
import Web3 from 'web3'

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
      this.provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545')
    }

    sendAsync (data) {
        return new Promise((resolve, reject) => {
          if (this.provider) {
            this.provider[this.provider.sendAsync ? 'sendAsync' : 'send'](data, (error, message) => {
              if (error) return reject(error)
              resolve(message)
            })
          } else {
            resolve({"jsonrpc": "2.0", "result": [], "id": data.id})
          }
        })
      }
}

module.exports = HardhatProvider