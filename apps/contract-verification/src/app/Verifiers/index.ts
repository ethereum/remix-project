import type { VerifierIdentifier, VerifierSettings } from '../types'
import { AbstractVerifier } from './AbstractVerifier'
import { BlockscoutVerifier } from './BlockscoutVerifier'
import { EtherscanVerifier } from './EtherscanVerifier'
import { SourcifyVerifier } from './SourcifyVerifier'
import { RoutescanVerifier } from './RoutescanVerifier'

export { AbstractVerifier } from './AbstractVerifier'
export { BlockscoutVerifier } from './BlockscoutVerifier'
export { SourcifyVerifier } from './SourcifyVerifier'
export { EtherscanVerifier } from './EtherscanVerifier'
export { RoutescanVerifier } from './RoutescanVerifier'

export function getVerifier(identifier: VerifierIdentifier, settings: VerifierSettings): AbstractVerifier {
  switch (identifier) {
  case 'Sourcify':
    if (!settings?.explorerUrl) {
      throw new Error('The Sourcify verifier requires an explorer URL.')
    }
    return new SourcifyVerifier(settings.apiUrl, settings.explorerUrl)
  case 'Etherscan':
    if (!settings?.explorerUrl) {
      throw new Error('The Etherscan verifier requires an explorer URL.')
    }
    if (!settings?.apiKey) {
      throw new Error('The Etherscan verifier requires an API key.')
    }
    return new EtherscanVerifier(settings.apiUrl, settings.explorerUrl, settings.apiKey)
  case 'Blockscout':
    return new BlockscoutVerifier(settings.apiUrl)
  case 'Routescan':
    return new RoutescanVerifier(settings.apiUrl, settings.explorerUrl, settings.apiKey)
  }
}
