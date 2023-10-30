import * as packageJson from '../../../../../package.json'
import {BasicVMProvider} from './vm-provider'

export class MainnetForkVMProvider extends BasicVMProvider {
  nodeUrl: string
  blockNumber: number | 'latest'
  constructor(blockchain) {
    super(
      {
        name: 'vm-mainnet-fork',
        displayName: 'Mainet fork -Remix VM (London)',
        kind: 'provider',
        description: 'Remix VM (London)',
        methods: ['sendAsync', 'init'],
        version: packageJson.version
      },
      blockchain
    )
    this.blockchain = blockchain
    this.fork = 'shanghai'
    this.nodeUrl = 'https://mainnet.infura.io/v3/7eed077ab9ee45eebbb3f053af9ecb29'
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
