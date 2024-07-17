import { VerifierIdentifier, VerifierSettings } from '../types/VerificationTypes'
import { AbstractVerifier } from './AbstractVerifier'
import { EtherscanVerifier } from './EtherscanVerifier'
import { SourcifyVerifier } from './SourcifyVerifier'

export { AbstractVerifier } from './AbstractVerifier'
export { SourcifyVerifier } from './SourcifyVerifier'
export { EtherscanVerifier } from './EtherscanVerifier'

export function getVerifier(identifier: VerifierIdentifier, settings: VerifierSettings): AbstractVerifier {
  switch (identifier) {
  case 'Sourcify':
    return new SourcifyVerifier(settings.apiUrl, settings.explorerUrl)
  case 'Etherscan':
    if (!settings.apiKey) {
      throw new Error('The Etherscan verifier requires an API key.')
    }
    return new EtherscanVerifier(settings.apiUrl, settings.explorerUrl, settings.apiKey)
  case 'Blockscout':
    return new EtherscanVerifier(settings.apiUrl, settings.explorerUrl)
  }
}
