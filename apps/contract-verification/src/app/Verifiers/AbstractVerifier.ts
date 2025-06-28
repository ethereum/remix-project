import { CompilerAbstract } from '@remix-project/remix-solidity'
import type { LookupResponse, SubmittedContract, VerificationResponse } from '../types'

// Optional function definitions
export interface AbstractVerifier {
  verifyProxy?(submittedContract: SubmittedContract): Promise<VerificationResponse>
  checkVerificationStatus?(receiptId: string, chainId: string): Promise<VerificationResponse>
  checkProxyVerificationStatus?(receiptId: string, chainId: string): Promise<VerificationResponse>
}

export abstract class AbstractVerifier {
  constructor(public apiUrl: string, public explorerUrl: string) {}

  abstract verify(submittedContract: SubmittedContract, compilerAbstract: CompilerAbstract): Promise<VerificationResponse>
  abstract lookup(contractAddress: string, chainId: string): Promise<LookupResponse>
}
