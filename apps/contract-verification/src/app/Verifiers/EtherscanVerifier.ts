import {CompilerAbstract} from '@remix-project/remix-solidity'
import {AbstractVerifier} from './AbstractVerifier'
import {EtherscanReceipt} from '../Receipts/EtherscanReceipt'
import {EtherscanRequest, EtherscanResponse} from '../types/VerificationTypes'

export class EtherscanVerifier extends AbstractVerifier {
  apiKey: string

  constructor(apiUrl: string, name: string = 'Etherscan', apiKey: string) {
    super(apiUrl, name)
    this.apiKey = apiKey
  }

  async verify(chainId: string, address: string, compilerAbstract: CompilerAbstract, selectedContractFileAndName: string, abiEncodedConstructorArgs?: string) {
    const CODE_FORMAT = 'solidity-standard-json-input'

    const [_triggerFilePath, selectedFilePath, selectedContractName] = selectedContractFileAndName.split(':')
    // TODO: Handle version Vyper contracts. This relies on Solidity metadata.
    const metadata = JSON.parse(compilerAbstract.data.contracts[selectedFilePath][selectedContractName].metadata)
    const body: EtherscanRequest = {
      chainId,
      codeformat: CODE_FORMAT,
      sourceCode: JSON.stringify(compilerAbstract.input),
      contractaddress: address,
      contractname: selectedContractFileAndName,
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
