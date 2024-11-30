interface Currency {
  name: string
  symbol: string
  decimals: number
}
// types for https://chainid.network/chains.json (i.e. https://github.com/ethereum-lists/chains)
export interface Chain {
  name: string
  title?: string
  chainId: number
  shortName?: string
  network?: string
  networkId?: number
  nativeCurrency?: Currency
  rpc: Array<string>
  faucets?: string[]
  infoURL?: string
}

export type VerifierIdentifier = 'Sourcify' | 'Etherscan' | 'Blockscout' | 'Routescan'
export const VERIFIERS: VerifierIdentifier[] = ['Sourcify', 'Etherscan', 'Blockscout', 'Routescan']

export interface VerifierInfo {
  name: VerifierIdentifier
  apiUrl: string
}

export interface VerificationReceipt {
  receiptId?: string
  verifierInfo: VerifierInfo
  status: VerificationStatus
  message?: string
  lookupUrl?: string
  contractId: string
  isProxyReceipt: boolean
  failedChecks: number
}

export interface SubmittedContract {
  id: string
  filePath: string
  contractName: string
  chainId: string
  address: string
  abiEncodedConstructorArgs?: string
  date: string
  receipts: VerificationReceipt[]
  // Only present if the contract is behind a proxy
  proxyAddress?: string
  proxyReceipts?: VerificationReceipt[]
}

// This and all nested subtypes should be pure interfaces, so they can be converted to JSON easily
export interface SubmittedContracts {
  [id: string]: SubmittedContract
}

type SourcifyStatus = 'fully verified' | 'partially verified'
type EtherscanStatus = 'verified' | 'already verified'
export type VerificationStatus = SourcifyStatus | EtherscanStatus | 'failed' | 'pending' | 'awaiting implementation verification' | 'not verified' | 'lookup failed' | 'unknown'

export interface VerificationResponse {
  status: VerificationStatus
  receiptId: string | null
  message?: string
  lookupUrl?: string
}

export interface SourceFile {
  // Should be in the correct format for creating the files in Remix
  path: string
  content: string
}

export interface LookupResponse {
  status: VerificationStatus
  lookupUrl?: string
  sourceFiles?: SourceFile[]
  targetFilePath?: string
}
