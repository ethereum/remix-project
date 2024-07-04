import { CompilerAbstract } from '@remix-project/remix-solidity'
import { VerifierIdentifier } from '../types/VerificationTypes'

export abstract class AbstractVerifier {
  apiUrl: string
  enabled: boolean

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl
    this.enabled = true
  }

  abstract verify(chainId: string, address: string, compilerAbstract: CompilerAbstract, selectedContractFileAndName: string): Promise<any>
  abstract lookup(): Promise<any>
}
