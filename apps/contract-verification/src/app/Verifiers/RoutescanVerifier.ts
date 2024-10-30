import { EtherscanVerifier } from './EtherscanVerifier'

export class RoutescanVerifier extends EtherscanVerifier {
  LOOKUP_STORE_DIR = 'routescan-verified'

  // Routescan does not support proxy verification
  verifyProxy = undefined
  checkProxyVerificationStatus = undefined

  getContractCodeUrl(address: string, chainId: string): string {
    const url = new URL(this.explorerUrl + `/address/${address}/contract/${chainId}/code`)
    return url.href
  }
}
