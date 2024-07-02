import { CompilerAbstract } from '@remix-project/remix-solidity'
import { AbstractVerifier } from '../Verifiers/AbstractVerifier'
import { SourcifyVerifier } from '../Verifiers/SourcifyVerifier'
import { EtherscanVerifier } from '../Verifiers/EtherscanVerifier'

export type SourcifyVerificationStatus = 'perfect' | 'partial' | null

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

export interface VerificationReceipt {
  receiptId?: string
  verifier: AbstractVerifier
  status: SourcifyVerificationStatus | 'error' | null
  message?: string
}

export interface SubmittedContract {
  type: 'contract'
  id: string
  filePath: string
  contractName: string
  chainId: string
  address: string
  compilerAbstract: CompilerAbstract
  date: Date
  receipts: VerificationReceipt[]
}

export interface SubmittedProxyContract {
  type: 'proxy'
  id: string
  implementation: SubmittedContract
  proxy: SubmittedContract
}

export interface SubmittedContracts {
  [id: string]: SubmittedContract | SubmittedProxyContract
}

export function isProxy(contract: SubmittedContract | SubmittedProxyContract): contract is SubmittedProxyContract {
  return contract.type === 'proxy'
}

export function isContract(contract: SubmittedContract | SubmittedProxyContract): contract is SubmittedContract {
  return contract.type === 'contract'
}

export interface SourcifyVerificationResponse {
  result: [
    {
      address: string
      chainId: string
      status: SourcifyVerificationStatus
      libraryMap: {
        [key: string]: string
      }
    }
  ]
}

export interface SourcifyVerificationError {
  error: 'string'
}

export interface EtherscanRequest {
  chainId?: string
  codeformat: 'solidity-standard-json-input'
  sourceCode: string
  contractaddress: string
  contractname: string
  compilerversion: string
  constructorArguements?: string
}
export interface EtherscanResponse {
  status: '0' | '1'
  message: string
  result: string
}
