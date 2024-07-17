import { CompilerAbstract, SourcesCode } from '@remix-project/remix-solidity'
import { AbstractVerifier } from './AbstractVerifier'
import { LookupResponse, SubmittedContract, VerificationResponse, VerificationStatus } from '../types/VerificationTypes'

interface SourcifyVerificationRequest {
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

interface SourcifyErrorResponse {
  error: 'string'
}

interface SourcifyLookupResponse {
  address: string
  // Includes either chainIds or status key
  chainIds?: Array<{ chainId: string; status: Exclude<SourcifyVerificationStatus, null> }>
  status?: 'false'
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
    const body: SourcifyVerificationRequest = {
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
      const errorResponse: SourcifyErrorResponse = await response.json()
      console.error('Error on Sourcify verification at ' + this.apiUrl + '\nStatus: ' + response.status + '\nResponse: ' + JSON.stringify(errorResponse))
      throw new Error(errorResponse.error)
    }

    const verificationResponse: SourcifyVerificationResponse = await response.json()

    if (verificationResponse.result[0].status === null) {
      console.error('Error on Sourcify verification at ' + this.apiUrl + '\nStatus: ' + response.status + '\nResponse: ' + verificationResponse.result[0].message)
      throw new Error(verificationResponse.result[0].message)
    }

    // Map to a user-facing status message
    let status: VerificationStatus = 'unknown'
    if (verificationResponse.result[0].status === 'perfect') {
      status = 'fully verified'
    } else if (verificationResponse.result[0].status === 'partial') {
      status = 'partially verified'
    }

    return { status, receiptId: null }
  }

  async lookup(contractAddress: string, chainId: string): Promise<LookupResponse> {
    const url = new URL('check-all-by-addresses', this.apiUrl)
    url.searchParams.append('addresses', contractAddress)
    url.searchParams.append('chainIds', chainId)

    const response = await fetch(url.href, { method: 'GET' })

    if (!response.ok) {
      const errorResponse: SourcifyErrorResponse = await response.json()
      console.error('Error on Sourcify lookup at ' + this.apiUrl + '\nStatus: ' + response.status + '\nResponse: ' + JSON.stringify(errorResponse))
      throw new Error(errorResponse.error)
    }

    const lookupResponse: SourcifyLookupResponse = (await response.json())[0]

    let status: VerificationStatus = 'unknown'
    let lookupUrl: string | undefined = undefined
    if (lookupResponse.status === 'false') {
      status = 'not verified'
    } else if (lookupResponse.chainIds?.[0].status === 'perfect') {
      status = 'fully verified'
      lookupUrl = this.getContractCodeUrl(contractAddress, chainId, true)
    } else if (lookupResponse.chainIds?.[0].status === 'partial') {
      status = 'partially verified'
      lookupUrl = this.getContractCodeUrl(contractAddress, chainId, false)
    }

    return { status, lookupUrl }
  }

  getContractCodeUrl(address: string, chainId: string, fullMatch: boolean): string {
    const url = new URL(`contracts/${fullMatch ? 'full_match' : 'partial_match'}/${chainId}/${address}`, this.explorerUrl)
    return url.href
  }
}
