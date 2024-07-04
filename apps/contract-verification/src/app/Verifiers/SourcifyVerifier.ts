import { CompilerAbstract, SourcesCode } from '@remix-project/remix-solidity'
import { AbstractVerifier } from './AbstractVerifier'
import { SourcifyReceipt } from '../Receipts/SourcifyReceipt'
import { SourcifyVerificationError, SourcifyVerificationResponse } from '../types/VerificationTypes'

export class SourcifyVerifier extends AbstractVerifier {
  async verify(chainId: string, address: string, compilerAbstract: CompilerAbstract, selectedContractFileAndName: string) {
    const [_triggerFileName, selectedFilePath, selectedContractName] = selectedContractFileAndName.split(':')
    const metadataStr = compilerAbstract.data.contracts[selectedFilePath][selectedContractName].metadata
    const sources = compilerAbstract.source.sources
    console.log('selectedFilePath:', selectedFilePath)
    console.log('selectedContractName:', selectedContractName)
    console.log('compilerAbstract:', compilerAbstract)
    console.log('selectedContractMetadataStr:', metadataStr)
    console.log('chainId:', chainId)
    console.log('address:', address)

    // from { "filename.sol": {content: "contract MyContract { ... }"} }
    // to { "filename.sol": "contract MyContract { ... }" }
    const formattedSources = Object.entries(sources).reduce((acc, [fileName, { content }]) => {
      acc[fileName] = content
      return acc
    }, {})
    const body = {
      chainId,
      address,
      files: {
        'metadata.json': metadataStr,
        ...formattedSources,
      },
    }

    console.log(body)

    const response = await fetch(new URL('verify', this.apiUrl).href, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorResponse: SourcifyVerificationError = await response.json()
      console.error('Error on Sourcify verification at', this.apiUrl, 'Status:', response.status, 'Response:', JSON.stringify(errorResponse))
      throw new Error(errorResponse.error)
    }

    const jsonResponse: SourcifyVerificationResponse = await response.json()
    return jsonResponse
  }

  async lookup(): Promise<any> {
    // Implement the lookup logic here
    console.log('Sourcify lookup started')
    // Placeholder logic for lookup
    const lookupResult = {} // Replace with actual lookup logic
    console.log('Sourcify lookup completed')
    return lookupResult
  }
}
