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
    this.fork = 'london'
    this.nodeUrl = 'https://rpc.archivenode.io/e50zmkroshle2e2e50zm0044i7ao04ym'
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
