import * as packageJson from '../../../../../package.json'
import { BasicVMProvider } from './vm-provider'

export class MainnetForkVMProvider extends BasicVMProvider {
  nodeUrl: string
  blockNumber: number | 'latest'
  constructor(blockchain) {
    super(
      {
        name: 'vm-mainnet-fork',
        displayName: 'Mainnet fork - Remix VM (Cancun)',
        kind: 'provider',
        description: 'Remix VM (Cancun)',
        methods: ['sendAsync', 'init'],
        version: packageJson.version
      },
      blockchain
    )
    this.blockchain = blockchain
    this.fork = 'prague'
    this.nodeUrl = 'https://go.getblock.io/56f8bc5187aa4ac696348f67545acf38'
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
