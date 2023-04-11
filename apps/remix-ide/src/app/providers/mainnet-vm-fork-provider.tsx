import * as packageJson from '../../../../../package.json'
import { BasicVMProvider } from './vm-provider'

export class MainnetForkVMProvider extends BasicVMProvider {
  nodeUrl: string
  blockNumber: number | 'latest'
  constructor (blockchain) {
    super({
      name: 'vm-mainnet-fork',
      displayName: 'Mainet fork -Remix VM (London)',
      kind: 'provider',
      description: 'Remix VM (London)',
      methods: ['sendAsync', 'init'],
      version: packageJson.version
    }, blockchain)
    this.blockchain = blockchain
    this.fork = 'merge'
    this.nodeUrl = 'https://mainnet.infura.io/v3/08b2a484451e4635a28b3d8234f24332'
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
