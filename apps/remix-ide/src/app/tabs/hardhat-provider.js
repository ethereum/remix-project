import * as packageJson from '../../../../../package.json'
import { Plugin } from '@remixproject/engine'
import Web3 from 'web3'
import React from 'react' // eslint-disable-line

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
    this.blocked = false // used to block any call when trying to recover after a failed connection.
    this.blockchain = blockchain
  }

  onDeactivation () {
    this.provider = null
    this.blocked = false
  }

  hardhatProviderDialogBody () {
    return <div>
          Note: To run Hardhat network node on your system, go to hardhat project folder and run command:
          <div class="border p-1">npx hardhat node</div>       
        For more info, visit: <a href="https://hardhat.org/getting-started/#connecting-a-wallet-or-dapp-to-hardhat-network" target="_blank">Hardhat Documentation</a>       
        Hardhat JSON-RPC Endpoint
      </div>
  }

  sendAsync (data) {
    return new Promise(async (resolve, reject) => {
      if (this.blocked) return reject(new Error('provider unable to connect'))
      // If provider is not set, allow to open modal only when provider is trying to connect
      if (!this.provider) {
        let value
        try {
          value = await (() => {
            return new Promise((resolve, reject) => {
              const modalContent = {
                id: 'harrhatprovider',
                title: 'Hardhat node request',
                message: this.hardhatProviderDialogBody(),
                modalType: 'prompt',
                okLabel: 'OK',
                cancelLabel: 'Cancel',
                okFn: (value) => {
                  setTimeout(() => resolve(value), 0)
                },
                cancelFn: (value) => {
                  setTimeout(() => reject(new Error('Canceled')), 0)
                },
                defaultValue: 'http://127.0.0.1:8545'
              }
              this.call('modal', 'modal', modalContent)
            })
          })()
        } catch (e) {
          // the modal has been canceled
          return
        }        
        this.provider = new Web3.providers.HttpProvider(target)
        this.sendAsyncInternal(data, resolve, reject)       
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
      this.provider[this.provider.sendAsync ? 'sendAsync' : 'send'](data, async (error, message) => {
        if (error) {
          this.blocked = true
          const modalContent = {
            id: 'harrhatprovider',
            title: 'Hardhat Provider',
            message: `Error while connecting to the hardhat provider: ${error.message}`,
            modalType: 'alert',
            okLabel: 'OK'
          }
          this.call('modal', 'modal', modalContent)    
          await this.call('udapp', 'setEnvironmentMode', { context: 'vm', fork: 'london' })
          this.provider = null
          setTimeout(_ => { this.blocked = false }, 1000) // we wait 1 second for letting remix to switch to vm
          return reject(error)
        }
        resolve(message)
      })
    } else {
      const result = data.method === 'net_listening' ? 'canceled' : []
      resolve({ jsonrpc: '2.0', result: result, id: data.id })
    }
  }
}

module.exports = HardhatProvider
