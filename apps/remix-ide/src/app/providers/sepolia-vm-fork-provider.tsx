import * as packageJson from '../../../../../package.json'
import { BasicVMProvider } from './vm-provider'

export class SepoliaForkVMProvider extends BasicVMProvider {
  nodeUrl: string
  blockNumber: number | 'latest'
  constructor (blockchain) {
    super({
      name: 'vm-sepolia-fork',
      displayName: 'Sepolia fork - Remix VM (London)',
      kind: 'provider',
      description: 'Remix VM (London)',
      methods: ['sendAsync', 'init'],
      version: packageJson.version
    }, blockchain)
    this.blockchain = blockchain
    this.fork = 'merge'
    this.nodeUrl = 'https://remix-sepolia.ethdevops.io'
    this.blockNumber = 'latest'
  }

  async init () {
    return {
      'fork': this.fork,
      'nodeUrl': this.nodeUrl,
      'blockNumber': this.blockNumber
    }
  }
}
