import React from 'react' // eslint-disable-line
import * as packageJson from '../../../../../package.json'
import { JsonDataRequest, RejectRequest, SuccessRequest } from '../providers/abstract-provider'
import { Plugin } from '@remixproject/engine'
import { IProvider } from './abstract-provider'

export class BasicVMProvider extends Plugin implements IProvider {
  blockchain
  fork: string
  options: { [id: string] : any } = {}
  constructor (profile, blockchain) {
    super(profile)
    this.blockchain = blockchain
    this.fork = ''
  }

  async init (): Promise<{ [id: string] : any }> { return {} }

  body (): JSX.Element {
    return (
      <div></div>
    )
  }

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

export class MergeVMProvider extends BasicVMProvider {
  constructor (blockchain) {
    super({
      name: 'vm-merge',
      displayName: 'Remix VM (Merge)',
      kind: 'provider',
      description: 'Remix VM (Merge)',
      methods: ['sendAsync', 'init'],
      version: packageJson.version
    }, blockchain)
    this.blockchain = blockchain
    this.fork = 'merge'
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

export class ShanghaiVMProvider extends BasicVMProvider {
  constructor (blockchain) {
    super({
      name: 'vm-shanghai',
      displayName: 'Remix VM (Shanghai)',
      kind: 'provider',
      description: 'Remix VM (Shanghai)',
      methods: ['sendAsync', 'init'],
      version: packageJson.version
    }, blockchain)
    this.blockchain = blockchain
    this.fork = 'shanghai'
  }
}