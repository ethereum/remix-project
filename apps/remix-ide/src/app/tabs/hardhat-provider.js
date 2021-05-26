import * as packageJson from '../../../../../package.json'
import { Plugin } from '@remixproject/engine'
import Web3 from 'web3'
const yo = require('yo-yo')
const modalDialogCustom = require('../ui/modal-dialog-custom')

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
    this.provider = null
    this.blockchain = blockchain
  }

  onDeactivation () {
    this.provider = null
  }

  hardhatProviderDialogBody () {
    return yo`
      <div class="">
        Hardhat JSON-RPC Endpoint
      </div>
    `
  }

  sendAsync (data) {
    return new Promise((resolve, reject) => {
      if (!this.provider) {
        modalDialogCustom.prompt('Hardhat node request', this.hardhatProviderDialogBody(), 'http://127.0.0.1:8545', (target) => {
          this.provider = new Web3.providers.HttpProvider(target)
          sendAsyncInternal(this.provider, data, resolve, reject)
        }, () => {
          sendAsyncInternal(this.provider, data, resolve, reject)
        })
      } else {
        sendAsyncInternal(this.provider, data, resolve, reject)
      }
    })
  }
}

const sendAsyncInternal = (provider, data, resolve, reject) => {
  if (provider) {
    provider[provider.sendAsync ? 'sendAsync' : 'send'](data, (error, message) => {
      if (error) return reject(error)
      resolve(message)
    })
  } else {
    const result = data.method === 'net_listening' ? 'canceled' : []
    resolve({ jsonrpc: '2.0', result: result, id: data.id })
  }
}

module.exports = HardhatProvider
