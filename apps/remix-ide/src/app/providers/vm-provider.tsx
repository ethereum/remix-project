import * as packageJson from '../../../../../package.json'
import { JsonDataRequest, RejectRequest, SuccessRequest } from '../providers/abstract-provider'
import { Plugin } from '@remixproject/engine'

export class BasicVMProvider extends Plugin {
  blockchain
  fork: string
  constructor (profile, blockchain) {
    super(profile)
    this.blockchain = blockchain
    this.fork = null
  }

  init () {}

  sendAsync (data: JsonDataRequest): Promise<any> {
    return new Promise((resolve, reject) => {
      this.sendAsyncInternal(data, resolve, reject)
    })
  }

  private async sendAsyncInternal (data: JsonDataRequest, resolve: SuccessRequest, reject: RejectRequest): Promise<void> {
    try {
      await this.blockchain.providers.vm.provider.sendAsync(data, (error, result) => {
        if (error) return reject(error)
        else {
          resolve({ jsonrpc: '2.0', result, id: data.id })
        }
      })      
    } catch (error) {
      reject(error)
    }
  }
}

export class BerlinVMProvider extends BasicVMProvider {
  constructor (blockchain) {
    super({
      name: 'vm-berlin',
      displayName: 'Remix VM (Berlin)',
      kind: 'provider',
      description: 'Remix VM (Berlin)',
      methods: ['sendAsync', 'init'],
      version: packageJson.version
    }, blockchain)
    this.blockchain = blockchain
    this.fork = 'berlin'
  }
}

export class LondonVMProvider extends BasicVMProvider {
  constructor (blockchain) {
    super({
      name: 'vm-london',
      displayName: 'Remix VM (London)',
      kind: 'provider',
      description: 'Remix VM (London)',
      methods: ['sendAsync', 'init'],
      version: packageJson.version
    }, blockchain)
    this.blockchain = blockchain
    this.fork = 'london'
  }
}