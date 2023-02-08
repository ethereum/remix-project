import { Plugin } from '@remixproject/engine'
import { Blockchain } from '../../blockchain/blockchain'
import { ethers } from 'ethers'

export type JsonDataRequest = {
  id: number,
  jsonrpc: string // version
  method: string,
  params: Array<any>,
}

export type JsonDataResult = {
  id: number,
  jsonrpc: string // version
  result: any
}

export type RejectRequest = (error: Error) => void
export type SuccessRequest = (data: JsonDataResult) => void

export abstract class AbstractProvider extends Plugin {
  provider: ethers.providers.JsonRpcProvider
  blockchain: Blockchain

  constructor (profile, blockchain) {
    super(profile)
    this.provider = null
    this.blockchain = blockchain
  }

  abstract body(): JSX.Element
  abstract instanciateProvider(value: string): any
  abstract init()
  abstract displayName()

  onDeactivation () {
    this.provider = null
  }  

  sendAsync (data: JsonDataRequest): Promise<any> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      if (!this.provider) return reject(new Error('provider not set'))
      this.sendAsyncInternal(data, resolve, reject)
    })
  }

  private async sendAsyncInternal (data: JsonDataRequest, resolve: SuccessRequest, reject: RejectRequest): Promise<void> {
    if (this.provider) {
      // Check the case where current environment is VM on UI and it still sends RPC requests
      // This will be displayed on UI tooltip as 'cannot get account list: Environment Updated !!'
      if (this.blockchain.getProvider() !== this.profile.displayName && data.method !== 'net_listening') return reject(new Error('Environment Updated !!'))

      try {
        const result = await this.provider.send(data.method, data.params)
        resolve({ jsonrpc: '2.0', result, id: data.id })
      } catch (error) {
        reject(error)
      }
    } else {
      const result = data.method === 'net_listening' ? 'canceled' : []
      resolve({ jsonrpc: '2.0', result: result, id: data.id })
    }
  }
}
