import { CompilerAbstract } from '@remix-project/remix-solidity'
import { LookupResponse, SubmittedContract, VerificationResponse, VerificationStatus } from '../types/VerificationTypes'

export interface AbstractVerifier {
  checkVerificationStatus?(receiptId: string): Promise<VerificationStatus>
}

export abstract class AbstractVerifier {
  // TODO remove prop
  enabled = true

  constructor(public apiUrl: string, public explorerUrl: string) {}

  abstract verify(submittedContract: SubmittedContract, compilerAbstract: CompilerAbstract): Promise<VerificationResponse>
  abstract lookup(contractAddress: string, chainId: string): Promise<LookupResponse>
}
