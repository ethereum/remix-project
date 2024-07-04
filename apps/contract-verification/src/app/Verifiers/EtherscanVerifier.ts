import { CompilerAbstract } from '@remix-project/remix-solidity'
import { AbstractVerifier } from './AbstractVerifier'
import { EtherscanRequest, EtherscanResponse, SubmittedContract } from '../types/VerificationTypes'

export class EtherscanVerifier extends AbstractVerifier {
  apiKey?: string

  constructor(apiUrl: string, apiKey?: string) {
    super(apiUrl)
    this.apiKey = apiKey
  }

  async verify(submittedContract: SubmittedContract, compilerAbstract: CompilerAbstract, abiEncodedConstructorArgs?: string) {
    const CODE_FORMAT = 'solidity-standard-json-input'

    // TODO: Handle version Vyper contracts. This relies on Solidity metadata.
    const metadata = JSON.parse(compilerAbstract.data.contracts[submittedContract.filePath][submittedContract.contractName].metadata)
    const body: EtherscanRequest = {
      chainId: submittedContract.chainId,
      codeformat: CODE_FORMAT,
      sourceCode: JSON.stringify(compilerAbstract.input),
      contractaddress: submittedContract.address,
      contractname: submittedContract.filePath + ':' + submittedContract.contractName,
      compilerversion: metadata.compiler.version,
    }

    if (abiEncodedConstructorArgs) {
      body.constructorArguements = abiEncodedConstructorArgs
    }

    const url = new URL('api', this.apiUrl)
    url.searchParams.append('module', 'contract')
    url.searchParams.append('action', 'verifysourcecode')
    url.searchParams.append('apikey', this.apiKey)

    const response = await fetch(url.href, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`Request error Status:${response.status} Response: ${await response.text()}`)
    }

    const data: EtherscanResponse = await response.json()
    console.log(data)
    if (data.status !== '1' || data.message !== 'OK') {
      console.error(`Error on Etherscan verification at ${this.apiUrl}: ${data.result}`)
      throw new Error(data.result)
    }

    return data
  }

  async lookup(): Promise<any> {
    // Implement the lookup logic here
    console.log('Etherscan lookup started')
    // Placeholder logic for lookup
    const lookupResult = {} // Replace with actual lookup logic
    console.log('Etherscan lookup completed')
    return lookupResult
  }
}
