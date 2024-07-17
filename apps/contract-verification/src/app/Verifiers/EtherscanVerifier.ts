import { CompilerAbstract } from '@remix-project/remix-solidity'
import { AbstractVerifier } from './AbstractVerifier'
import { LookupResponse, SubmittedContract, VerificationResponse, VerificationStatus } from '../types/VerificationTypes'

interface EtherscanVerificationRequest {
  chainId?: string
  codeformat: 'solidity-single-file' | 'solidity-standard-json-input'
  sourceCode: string
  contractaddress: string
  contractname: string
  compilerversion: string
  constructorArguements?: string
}

interface EtherscanRpcResponse {
  status: '0' | '1'
  message: string
  result: string
}

interface EtherscanCheckStatusResponse {
  status: '0' | '1'
  message: string
  result: 'Pending in queue' | 'Pass - Verified' | 'Fail - Unable to verify' | 'Unknown UID'
}

export class EtherscanVerifier extends AbstractVerifier {
  constructor(apiUrl: string, explorerUrl: string, protected apiKey?: string) {
    super(apiUrl, explorerUrl)
  }

  async verify(submittedContract: SubmittedContract, compilerAbstract: CompilerAbstract): Promise<VerificationResponse> {
    // TODO: Handle version Vyper contracts. This relies on Solidity metadata.
    const metadata = JSON.parse(compilerAbstract.data.contracts[submittedContract.filePath][submittedContract.contractName].metadata)
    const body: EtherscanVerificationRequest = {
      chainId: submittedContract.chainId,
      codeformat: 'solidity-standard-json-input',
      sourceCode: JSON.stringify(compilerAbstract.input),
      contractaddress: submittedContract.address,
      contractname: submittedContract.filePath + ':' + submittedContract.contractName,
      compilerversion: metadata.compiler.version,
    }

    if (submittedContract.abiEncodedConstructorArgs) {
      body.constructorArguements = submittedContract.abiEncodedConstructorArgs
    }

    const url = new URL('api', this.apiUrl)
    url.searchParams.append('module', 'contract')
    url.searchParams.append('action', 'verifysourcecode')
    if (this.apiKey) {
      url.searchParams.append('apikey', this.apiKey)
    }

    const response = await fetch(url.href, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const responseText = await response.text()
      console.error('Error on Etherscan API verification at ' + this.apiUrl + '\nStatus: ' + response.status + '\nResponse: ' + responseText)
      throw new Error(responseText)
    }

    const verificationResponse: EtherscanRpcResponse = await response.json()

    if (verificationResponse.status !== '1' || verificationResponse.message !== 'OK') {
      console.error('Error on Etherscan API verification at ' + this.apiUrl + '\nStatus: ' + verificationResponse.status + '\nMessage: ' + verificationResponse.message + '\nResult: ' + verificationResponse.result)
      throw new Error(verificationResponse.result)
    }

    return { status: 'pending', receiptId: verificationResponse.result }
  }

  // TODO retry with backoff in case this throws error
  async checkVerificationStatus(receiptId: string): Promise<VerificationStatus> {
    const url = new URL('api', this.apiUrl)
    url.searchParams.append('module', 'contract')
    url.searchParams.append('action', 'checkverifystatus')
    url.searchParams.append('guid', receiptId)
    if (this.apiKey) {
      url.searchParams.append('apikey', this.apiKey)
    }

    const response = await fetch(url.href, { method: 'GET' })

    if (!response.ok) {
      const responseText = await response.text()
      console.error('Error on Etherscan API check verification status at ' + this.apiUrl + '\nStatus: ' + response.status + '\nResponse: ' + responseText)
      throw new Error(responseText)
    }

    const checkStatusResponse: EtherscanCheckStatusResponse = await response.json()

    if (checkStatusResponse.status !== '1' || !checkStatusResponse.message.startsWith('OK')) {
      console.error('Error on Etherscan API check verification status at ' + this.apiUrl + '\nStatus: ' + checkStatusResponse.status + '\nMessage: ' + checkStatusResponse.message + '\nResult: ' + checkStatusResponse.result)
      throw new Error(checkStatusResponse.result)
    }

    if (checkStatusResponse.result === 'Unknown UID') {
      console.error('Error on Etherscan API check verification status at ' + this.apiUrl + '\nStatus: ' + checkStatusResponse.status + '\nMessage: ' + checkStatusResponse.message + '\nResult: ' + checkStatusResponse.result)
      throw new Error(checkStatusResponse.result)
    }

    let status: VerificationStatus = 'unknown'
    if (checkStatusResponse.result === 'Fail - Unable to verify') {
      status = 'failed'
    }
    if (checkStatusResponse.result === 'Pending in queue') {
      status = 'pending'
    }
    if (checkStatusResponse.result === 'Pass - Verified') {
      status = 'verified'
    }

    return status
  }

  async lookup(contractAddress: string, chainId: string): Promise<LookupResponse> {
    const url = new URL('api', this.apiUrl)
    url.searchParams.append('module', 'contract')
    url.searchParams.append('action', 'getabi')
    url.searchParams.append('address', contractAddress)
    if (this.apiKey) {
      url.searchParams.append('apikey', this.apiKey)
    }

    const response = await fetch(url.href, { method: 'GET' })

    if (!response.ok) {
      const responseText = await response.text()
      console.error('Error on Etherscan API lookup at ' + this.apiUrl + '\nStatus: ' + response.status + '\nResponse: ' + responseText)
      throw new Error(responseText)
    }

    const lookupResponse: EtherscanRpcResponse = await response.json()

    const lookupUrl = this.getContractCodeUrl(contractAddress)

    if (lookupResponse.result === 'Contract source code not verified') {
      return { status: 'not verified', lookupUrl }
    } else if (lookupResponse.status !== '1' || !lookupResponse.message.startsWith('OK')) {
      console.error('Error on Etherscan API lookup at ' + this.apiUrl + '\nStatus: ' + lookupResponse.status + '\nMessage: ' + lookupResponse.message + '\nResult: ' + lookupResponse.result)
      throw new Error(lookupResponse.result)
    }

    return { status: 'verified', lookupUrl }
  }

  getContractCodeUrl(address: string): string {
    const url = new URL(`address/${address}#code`, this.explorerUrl)
    return url.href
  }
}
