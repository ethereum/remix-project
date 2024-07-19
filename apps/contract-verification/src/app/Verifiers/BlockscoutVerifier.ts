import { EtherscanVerifier } from './EtherscanVerifier'

export class BlockscoutVerifier extends EtherscanVerifier {
  constructor(apiUrl: string) {
    // apiUrl and explorerUrl are the same for Blockscout
    super(apiUrl, apiUrl, undefined)
  }

  getContractCodeUrl(address: string): string {
    const url = new URL(this.explorerUrl + `/address/${address}`)
    // url.searchParams.append('tab', 'contract')
    return url.href
  }
}
