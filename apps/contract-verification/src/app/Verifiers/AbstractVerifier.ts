import { CompilerAbstract } from '@remix-project/remix-solidity'
import { SourcifyReceipt } from '../Receipts/SourcifyReceipt'
import { EtherscanReceipt } from '../Receipts/EtherscanReceipt'

export abstract class AbstractVerifier {
  name: string
  apiUrl: string
  enabled: boolean

  constructor(apiUrl: string, name: string) {
    this.apiUrl = apiUrl
    this.name = name
    this.enabled = true
  }

  abstract verify(chainId: string, address: string, compilerAbstract: CompilerAbstract, selectedContractFileAndName: string): Promise<any>
  abstract lookup(): Promise<any>
}
