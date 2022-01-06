import * as packageJson from '../../../../../package.json'
import { Plugin } from '@remixproject/engine'
import { AppModal, AlertModal, ModalTypes } from '@remix-ui/app'
import React from 'react' // eslint-disable-line
import { Blockchain } from '../../blockchain/blockchain'
import { ethers } from 'ethers'

const profile = {
  name: 'hardhat-provider',
  displayName: 'Hardhat Provider',
  kind: 'provider',
  description: 'Hardhat provider',
  methods: ['sendAsync'],
  version: packageJson.version
}

type JsonDataRequest = {
  id: number,
  jsonrpc: string // version
  method: string,
  params: Array<any>,
}

type JsonDataResult = {
  id: number,
  jsonrpc: string // version
  result: any
}

type RejectRequest = (error: Error) => void
type SuccessRequest = (data: JsonDataResult) => void

export class HardhatProvider extends Plugin {
  provider: ethers.providers.JsonRpcProvider
  blocked: boolean
  blockchain: Blockchain
  target: String

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

  hardhatProviderDialogBody (): JSX.Element {
    return (<div> Note: To run Hardhat network node on your system, go to hardhat project folder and run command:
          <div className="border p-1">npx hardhat node</div>       
        For more info, visit: <a href="https://hardhat.org/getting-started/#connecting-a-wallet-or-dapp-to-hardhat-network" target="_blank">Hardhat Documentation</a>       
        Hardhat JSON-RPC Endpoint
      </div>)
  }

  sendAsync (data: JsonDataRequest): Promise<any> {
    return new Promise(async (resolve, reject) => {
      if (this.blocked) return reject(new Error('provider unable to connect'))
      // If provider is not set, allow to open modal only when provider is trying to connect
      if (!this.provider) {
        let value: string
        try {
          value = await ((): Promise<string> => {
            return new Promise((resolve, reject) => {
              const modalContent: AppModal = {
                id: 'hardhatprovider',
                title: 'Hardhat node request',
                message: this.hardhatProviderDialogBody(),
                modalType: ModalTypes.prompt,
                okLabel: 'OK',
                cancelLabel: 'Cancel',
                okFn: (value: string) => {
                  setTimeout(() => resolve(value), 0)
                },
                cancelFn: () => {
                  setTimeout(() => reject(new Error('Canceled')), 0)
                },
                hideFn: () => {
                  setTimeout(() => reject(new Error('Hide')), 0)
                },
                defaultValue: 'http://127.0.0.1:8545'
              }
              this.call('modal', 'modal', modalContent)
            })
          })()
        } catch (e) {
          // the modal has been canceled/hide
          return
        }        
        this.provider = new ethers.providers.JsonRpcProvider(value)
        this.sendAsyncInternal(data, resolve, reject)       
      } else {
        this.sendAsyncInternal(data, resolve, reject)
      }
    })
  }

  private async sendAsyncInternal (data: JsonDataRequest, resolve: SuccessRequest, reject: RejectRequest): Promise<void> {
    if (this.provider) {
      // Check the case where current environment is VM on UI and it still sends RPC requests
      // This will be displayed on UI tooltip as 'cannot get account list: Environment Updated !!'
      if (this.blockchain.getProvider() !== 'Hardhat Provider' && data.method !== 'net_listening') return reject(new Error('Environment Updated !!'))

      try {
        const result = await this.provider.send(data.method, data.params)
        resolve({ jsonrpc: '2.0', result, id: data.id })
      } catch (error) {
        this.blocked = true
        const modalContent: AlertModal = {
          id: 'hardhatprovider',
          title: 'Hardhat Provider',
          message: `Error while connecting to the hardhat provider: ${error.message}`,
        }
        this.call('modal', 'alert', modalContent)
        await this.call('udapp', 'setEnvironmentMode', { context: 'vm', fork: 'london' })
        this.provider = null
        setTimeout(_ => { this.blocked = false }, 1000) // we wait 1 second for letting remix to switch to vm
        reject(error)
      }
    } else {
      const result = data.method === 'net_listening' ? 'canceled' : []
      resolve({ jsonrpc: '2.0', result: result, id: data.id })
    }
  }
}