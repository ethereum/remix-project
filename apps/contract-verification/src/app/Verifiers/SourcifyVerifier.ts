import { CompilerAbstract, SourcesCode } from '@remix-project/remix-solidity'
import { AbstractVerifier } from './AbstractVerifier'
import { SubmittedContract, VerificationResponse } from '../types/VerificationTypes'

interface SourcifyVerifyRequest {
  address: string
  chain: string
  files: Record<string, string>
  creatorTxHash?: string
  chosenContract?: string
}

type SourcifyVerificationStatus = 'perfect' | 'partial' | null

interface SourcifyVerificationResponse {
  result: [
    {
      address: string
      chainId: string
      status: SourcifyVerificationStatus
      libraryMap: {
        [key: string]: string
      }
      message?: string
    }
  ]
}

interface SourcifyVerificationError {
  error: 'string'
}

export class SourcifyVerifier extends AbstractVerifier {
  async verify(submittedContract: SubmittedContract, compilerAbstract: CompilerAbstract): Promise<VerificationResponse> {
    const metadataStr = compilerAbstract.data.contracts[submittedContract.filePath][submittedContract.contractName].metadata
    const sources = compilerAbstract.source.sources
    console.log('selectedFilePath:', submittedContract.filePath)
    console.log('selectedContractName:', submittedContract.contractName)
    console.log('compilerAbstract:', compilerAbstract)
    console.log('selectedContractMetadataStr:', metadataStr)
    console.log('chainId:', submittedContract.chainId)
    console.log('address:', submittedContract.address)

    // from { "filename.sol": {content: "contract MyContract { ... }"} }
    // to { "filename.sol": "contract MyContract { ... }" }
    const formattedSources = Object.entries(sources).reduce((acc, [fileName, { content }]) => {
      acc[fileName] = content
      return acc
    }, {})
    const body: SourcifyVerifyRequest = {
      chain: submittedContract.chainId,
      address: submittedContract.address,
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
      console.error('Error on Sourcify verification at ' + this.apiUrl + '\nStatus: ' + response.status + '\nResponse: ' + JSON.stringify(errorResponse))
      throw new Error(errorResponse.error)
    }

    const verificationResponse: SourcifyVerificationResponse = await response.json()

    if (verificationResponse.result[0].status === null) {
      console.error('Error on Sourcify verification at ' + this.apiUrl + '\nStatus: ' + response.status + '\nResponse: ' + verificationResponse.result[0].message)
      throw new Error(verificationResponse.result[0].message)
    }

    // Map to a user-facing status message
    let status = 'unknown'
    if (verificationResponse.result[0].status === 'perfect') {
      status = 'fully verified'
    } else if (verificationResponse.result[0].status === 'partial') {
      status = 'partially verified'
    }

    return { status, receiptId: null }
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
