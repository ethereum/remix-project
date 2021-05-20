import * as packageJson from '../../../../../package.json'
import { Plugin } from '@remixproject/engine'
const yo = require('yo-yo')
const modalDialogCustom = require('../ui/modal-dialog-custom')
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
      this.provider = null
    }

    hardhatProviderDialogBody () {
      return yo`
        <div class="">
          Hardhat Provider Endpoint
        </div>
      `
    }

    sendAsync (data) {
      console.log('Inside sendAsync - modalDialogCustom', modalDialogCustom)
      modalDialogCustom.prompt('Hardhat node request', this.hardhatProviderDialogBody(), 'http://127.0.0.1:8545', (target) => {
        console.log('target--->', target)
        this.provider = new Web3.providers.HttpProvider(target)
        return new Promise((resolve, reject) => {
          console.log('inside sendAsync promise')
          if (this.provider) {
            this.provider[this.provider.sendAsync ? 'sendAsync' : 'send'](data, (error, message) => {
              if (error) return reject(error)
              resolve(message)
            })
          } else {
            resolve({"jsonrpc": "2.0", "result": [], "id": data.id})
          }
        })
      })
        
      }
}

module.exports = HardhatProvider