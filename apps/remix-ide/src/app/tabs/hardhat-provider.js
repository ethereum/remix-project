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
          console.log('cancel clicked', this.provider)
          console.log('inside if--->', this.blockchain.getProvider())
          console.log('inside if-2-->', this.blockchain.getCurrentProvider())
          this.call('udapp', 'setEnvironmentMode', this.blockchain.getProvider())
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
    resolve({ jsonrpc: '2.0', result: [], id: data.id })
  }
}

module.exports = HardhatProvider
