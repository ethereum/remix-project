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
          Note: To run Hardhat network node on your system, go to hardhat project folder and run command:
          <div class="border p-1">npx hardhat node</div>
        <br>
        For more info, visit: <a href="https://hardhat.org/getting-started/#connecting-a-wallet-or-dapp-to-hardhat-network" target="_blank">Hardhat Documentation</a>
        <br><br>
        <b>Note:</b> Click on 'Cancel' if node is stopped.
        <br><br>
        Hardhat JSON-RPC Endpoint
      </div>
    `
  }

  sendAsync (data) {
    return new Promise((resolve, reject) => {
      // If provider is not set, allow to open modal only when provider is trying to connect
      if (!this.provider || data.method === 'net_listening') {
        modalDialogCustom.prompt('Hardhat node request', this.hardhatProviderDialogBody(), 'http://127.0.0.1:8545', (target) => {
          this.provider = new Web3.providers.HttpProvider(target)
          this.sendAsyncInternal(data, resolve, reject)
        }, () => {
          // If 'cancel' is clicked while trying to connect, handle it in custom manner
          if (data.method === 'net_listening') resolve({ jsonrpc: '2.0', result: 'canceled', id: data.id })
          else {
            // When node is abruptly stopped, modal will appear
            // On which clicking on 'Cancel' will set the Envrionment to VM
            this.blockchain.changeExecutionContext('vm')
            this.provider = this.blockchain.getCurrentProvider()
            reject(new Error('Connection canceled'))
          }
        })
      } else {
        this.sendAsyncInternal(data, resolve, reject)
      }
    })
  }

  sendAsyncInternal (data, resolve, reject) {
    if (this.provider) {
      // Check the case where current environment is VM on UI and it still sends RPC requests
      // This will be displayed on UI tooltip as 'cannot get account list: Environment Updated !!'
      if (this.blockchain.getProvider() !== 'Hardhat Provider' && data.method !== 'net_listening') return reject(new Error('Environment Updated !!'))
      this.provider[this.provider.sendAsync ? 'sendAsync' : 'send'](data, (error, message) => {
        if (error) {
          this.provider = null
          return reject(error)
        }
        resolve(message)
      })
    } else {
      resolve({ jsonrpc: '2.0', result: [], id: data.id })
    }
  }
}

module.exports = HardhatProvider
