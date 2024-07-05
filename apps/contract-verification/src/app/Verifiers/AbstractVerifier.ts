import { CompilerAbstract } from '@remix-project/remix-solidity'
import { SubmittedContract, VerificationResponse, VerificationStatus } from '../types/VerificationTypes'

export interface AbstractVerifier {
  checkVerificationStatus?(receiptId: string): Promise<VerificationStatus>
}

export abstract class AbstractVerifier {
  apiUrl: string
  // TODO remove prop
  enabled: boolean

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl
    this.enabled = true
  }

  abstract verify(submittedContract: SubmittedContract, compilerAbstract: CompilerAbstract): Promise<VerificationResponse>
  abstract lookup(): Promise<any>
}
