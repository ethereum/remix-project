import { CompilerAbstract } from '@remix-project/remix-solidity'
import { SubmittedContract, VerifierIdentifier } from '../types/VerificationTypes'

export abstract class AbstractVerifier {
  apiUrl: string
  enabled: boolean

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl
    this.enabled = true
  }

  abstract verify(submittedContract: SubmittedContract, compilerAbstract: CompilerAbstract): Promise<any>
  abstract lookup(): Promise<any>
}
