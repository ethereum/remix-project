import * as packageJson from '../../../../../package.json'
import { BasicVMProvider } from './vm-provider'

export class SepoliaForkVMProvider extends BasicVMProvider {
  nodeUrl: string
  blockNumber: number | 'latest'
  constructor(blockchain) {
    super(
      {
        name: 'vm-sepolia-fork',
        displayName: 'Sepolia fork - Remix VM (Cancun)',
        kind: 'provider',
        description: 'Remix VM (London)',
        methods: ['sendAsync', 'init'],
        version: packageJson.version
      },
      blockchain
    )
    this.blockchain = blockchain
    this.fork = 'prague'
    this.nodeUrl = 'https://go.getblock.io/ee42d0a88f314707be11dd799b122cb9'
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
