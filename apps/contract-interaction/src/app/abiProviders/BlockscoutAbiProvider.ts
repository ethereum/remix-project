import { ABICategories, SourceFile } from '../types'
import { EtherscanAbiProvider } from './EtherscanAbiProvider'

// Etherscan and Blockscout return different objects from the getsourcecode method
interface BlockscoutSource {
  AdditionalSources: Array<{ SourceCode: string; Filename: string }>
  ConstructorArguments: string
  OptimizationRuns: number
  IsProxy: string
  SourceCode: string
  ABI: string
  ContractName: string
  CompilerVersion: string
  OptimizationUsed: string
  Runs: string
  EVMVersion: string
  FileName: string
  Address: string
}

export class BlockscoutAbiProvider extends EtherscanAbiProvider {
  LOOKUP_STORE_DIR = 'blockscout-verified'

  constructor(apiUrl: string) {
    // apiUrl and explorerUrl are the same for Blockscout
    super(apiUrl, apiUrl, undefined)
  }

  getContractCodeUrl(address: string): string {
    const url = new URL(this.explorerUrl + `/address/${address}`)
    url.searchParams.append('tab', 'contract')
    return url.href
  }

  /**
   * Get the blockexplorer specific URL for fetching the smart contract ABI.
   *
   * @param ABICategory - The sub type of the ABI (one of the values: 'read' | 'write' | 'readProxy' | 'writeProxy').
   * @returns The url to fetch the ABI data.
   */
  getAbiURL(contractAddress: string, ABICategory: ABICategories): string {
    const url = new URL(this.explorerUrl + `/api/v2/smart-contracts/${contractAddress}/${ABICategory}`)
    return url.href
  }

  processReceivedFiles(source: unknown, contractAddress: string, chainId: string): { sourceFiles: SourceFile[]; targetFilePath?: string } {
    const blockscoutSource = source as BlockscoutSource

    const result: SourceFile[] = []
    const filePrefix = `/${this.LOOKUP_STORE_DIR}/${chainId}/${contractAddress}`

    const targetFilePath = `${filePrefix}/${blockscoutSource.FileName}`
    result.push({ content: blockscoutSource.SourceCode, path: targetFilePath })

    for (const additional of blockscoutSource.AdditionalSources ?? []) {
      result.push({ content: additional.SourceCode, path: `${filePrefix}/${additional.Filename}` })
    }

    return { sourceFiles: result, targetFilePath }
  }
}
