import React from 'react' // eslint-disable-line
import * as packageJson from '../../../../../../../package.json'
import { BasicVMProvider } from './vm-provider'

export class MainnetForkVMProvider extends BasicVMProvider {
  nodeUrl: string
  blockNumber: number | 'latest'
  constructor(blockchain) {
    super(
      {
        name: 'vm-mainnet-fork',
        displayName: 'Mainnet fork - Remix VM (Osaka)',
        kind: 'provider',
        description: 'Remix VM (Osaka)',
        methods: ['sendAsync', 'init'],
        version: packageJson.version
      },
      blockchain
    )
    this.blockchain = blockchain
    this.fork = 'osaka'
    this.nodeUrl = 'https://shared.us-east-1.getblock.io/310dd70ae0fc41b780947c688b67c46d'
    this.blockNumber = 'latest'
  }

  async init() {
    return {
      fork: this.fork,
      nodeUrl: this.nodeUrl,
      blockNumber: this.blockNumber
    }
  }
}
