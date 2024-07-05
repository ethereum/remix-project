import { CompilerAbstract } from '@remix-project/remix-solidity'
import { SubmittedContract, VerificationResponse } from '../types/VerificationTypes'

export abstract class AbstractVerifier {
  apiUrl: string
  enabled: boolean

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl
    this.enabled = true
  }

  abstract verify(submittedContract: SubmittedContract, compilerAbstract: CompilerAbstract): Promise<VerificationResponse>
  abstract lookup(): Promise<any>
}
