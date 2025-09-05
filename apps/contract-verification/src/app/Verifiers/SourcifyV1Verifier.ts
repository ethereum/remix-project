import { CompilerAbstract, SourcesCode } from '@remix-project/remix-solidity'
import { AbstractVerifier } from './AbstractVerifier'
import type { LookupResponse, SourceFile, SubmittedContract, VerificationResponse, VerificationStatus } from '../types'
import { getAddress } from 'ethers'

interface SourcifyV1VerificationRequest {
  address: string
  chain: string
  files: Record<string, string>
  creatorTxHash?: string
  chosenContract?: string
}

type SourcifyV1VerificationStatus = 'perfect' | 'full' | 'partial' | null

interface SourcifyV1VerificationResponse {
  result: [
    {
      address: string
      chainId: string
      status: SourcifyV1VerificationStatus
      libraryMap: {
        [key: string]: string
      }
      message?: string
    }
  ]
}

interface SourcifyV1ErrorResponse {
  error: string
}

interface SourcifyV1File {
  name: string
  path: string
  content: string
}

interface SourcifyV1LookupResponse {
  status: Exclude<SourcifyV1VerificationStatus, null>
  files: SourcifyV1File[]
}

export class SourcifyV1Verifier extends AbstractVerifier {
  LOOKUP_STORE_DIR = 'sourcify-verified'

  async verify(submittedContract: SubmittedContract, compilerAbstract: CompilerAbstract): Promise<VerificationResponse> {
    const metadataStr = compilerAbstract.data.contracts[submittedContract.filePath][submittedContract.contractName].metadata
    const sources = compilerAbstract.source.sources

    // from { "filename.sol": {content: "contract MyContract { ... }"} }
    // to { "filename.sol": "contract MyContract { ... }" }
    const formattedSources = Object.entries(sources).reduce((acc, [fileName, { content }]) => {
      acc[fileName] = content
      return acc
    }, {})
    const body: SourcifyV1VerificationRequest = {
      chain: submittedContract.chainId,
      address: submittedContract.address,
      files: {
        'metadata.json': metadataStr,
        ...formattedSources,
      },
    }

    const response = await fetch(new URL(this.apiUrl + '/verify').href, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorResponse: SourcifyV1ErrorResponse = await response.json()
      console.error('Error on Sourcify verification at ' + this.apiUrl + '\nStatus: ' + response.status + '\nResponse: ' + JSON.stringify(errorResponse))
      throw new Error(errorResponse.error)
    }

    const verificationResponse: SourcifyV1VerificationResponse = await response.json()

    if (verificationResponse.result[0].status === null) {
      console.error('Error on Sourcify verification at ' + this.apiUrl + '\nStatus: ' + response.status + '\nResponse: ' + verificationResponse.result[0].message)
      throw new Error(verificationResponse.result[0].message)
    }

    // Map to a user-facing status message
    let status: VerificationStatus = 'unknown'
    let lookupUrl: string | undefined = undefined
    if (verificationResponse.result[0].status === 'perfect' || verificationResponse.result[0].status === 'full') {
      status = 'exactly verified'
      lookupUrl = this.getContractCodeUrl(submittedContract.address, submittedContract.chainId, true)
    } else if (verificationResponse.result[0].status === 'partial') {
      status = 'verified'
      lookupUrl = this.getContractCodeUrl(submittedContract.address, submittedContract.chainId, false)
    }

    return { status, receiptId: null, lookupUrl }
  }

  async lookup(contractAddress: string, chainId: string): Promise<LookupResponse> {
    const url = new URL(this.apiUrl + `/files/any/${chainId}/${contractAddress}`)

    const response = await fetch(url.href, { method: 'GET' })

    if (!response.ok) {
      const errorResponse: SourcifyV1ErrorResponse = await response.json()

      if (errorResponse.error === 'Files have not been found!') {
        return { status: 'not verified' }
      }

      console.error('Error on Sourcify lookup at ' + this.apiUrl + '\nStatus: ' + response.status + '\nResponse: ' + JSON.stringify(errorResponse))
      throw new Error(errorResponse.error)
    }

    const lookupResponse: SourcifyV1LookupResponse = await response.json()

    let status: VerificationStatus = 'unknown'
    let lookupUrl: string | undefined = undefined
    if (lookupResponse.status === 'perfect' || lookupResponse.status === 'full') {
      status = 'exactly verified'
      lookupUrl = this.getContractCodeUrl(contractAddress, chainId, true)
    } else if (lookupResponse.status === 'partial') {
      status = 'verified'
      lookupUrl = this.getContractCodeUrl(contractAddress, chainId, false)
    }

    const { sourceFiles, targetFilePath } = this.processReceivedFiles(lookupResponse.files, contractAddress, chainId)

    return { status, lookupUrl, sourceFiles, targetFilePath }
  }

  getContractCodeUrl(address: string, chainId: string, fullMatch: boolean): string {
    const url = new URL(this.explorerUrl + `/contracts/${fullMatch ? 'full_match' : 'partial_match'}/${chainId}/${address}/`)
    return url.href
  }

  processReceivedFiles(files: SourcifyV1File[], contractAddress: string, chainId: string): { sourceFiles: SourceFile[]; targetFilePath?: string } {
    const result: SourceFile[] = []
    let targetFilePath: string
    const filePrefix = `/${this.LOOKUP_STORE_DIR}/${chainId}/${contractAddress}`

    for (const file of files) {
      let filePath: string
      for (const a of [contractAddress, getAddress(contractAddress)]) {
        const matching = file.path.match(`/${a}/(.*)$`)
        if (matching) {
          filePath = matching[1]
          break
        }
      }

      if (filePath && !filePath.startsWith('..')) {
        result.push({ path: `${filePrefix}/${filePath}`, content: file.content })
      }

      if (file.name === 'metadata.json') {
        const metadata = JSON.parse(file.content)
        const compilationTarget = metadata.settings.compilationTarget
        const contractPath = Object.keys(compilationTarget)[0]
        targetFilePath = `${filePrefix}/sources/${contractPath}`
      }
    }

    return { sourceFiles: result, targetFilePath }
  }
}
