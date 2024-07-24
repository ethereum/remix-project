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

export type VerifierIdentifier = 'Sourcify' | 'Etherscan' | 'Blockscout'
export const VERIFIERS: VerifierIdentifier[] = ['Sourcify', 'Etherscan', 'Blockscout']

export interface VerifierInfo {
  name: VerifierIdentifier
  apiUrl: string
}

export interface VerificationReceipt {
  receiptId?: string
  verifierInfo: VerifierInfo
  status: VerificationStatus
  message?: string
  contractId: string
}

export interface SubmittedContract {
  type: 'contract'
  id: string
  filePath: string
  contractName: string
  chainId: string
  address: string
  abiEncodedConstructorArgs?: string
  date: string
  receipts: VerificationReceipt[]
}

export interface SubmittedProxyContract {
  type: 'proxy'
  id: string
  implementation: SubmittedContract
  proxy: SubmittedContract
}

// This and all nested subtypes should be pure interfaces, so they can be converted to JSON easily
export interface SubmittedContracts {
  // TODO implement Proxy verification
  // [id: string]: SubmittedContract | SubmittedProxyContract
  [id: string]: SubmittedContract
}

export function isProxy(contract: SubmittedContract | SubmittedProxyContract): contract is SubmittedProxyContract {
  return contract.type === 'proxy'
}

export function isContract(contract: SubmittedContract | SubmittedProxyContract): contract is SubmittedContract {
  return contract.type === 'contract'
}

type SourcifyStatus = 'fully verified' | 'partially verified'
type EtherscanStatus = 'verified'
export type VerificationStatus = SourcifyStatus | EtherscanStatus | 'failed' | 'pending' | 'not verified' | 'unknown' | 'lookup failed'

export interface VerificationResponse {
  status: VerificationStatus
  receiptId: string | null
  message?: string
}

export interface LookupResponse {
  status: VerificationStatus
  lookupUrl?: string
}
