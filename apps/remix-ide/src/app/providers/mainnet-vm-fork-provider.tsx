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
    this.nodeUrl = 'https://eth-mainnet.g.alchemy.com/v2/7ivXx83e4oFEWUZDZy6UB5xPdIBrtQyy'
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
