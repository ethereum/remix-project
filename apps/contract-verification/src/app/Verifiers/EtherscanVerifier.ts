import {CompilerAbstract} from '@remix-project/remix-solidity'
import {AbstractVerifier} from './AbstractVerifier'

export class EtherscanVerifier extends AbstractVerifier {
  apiKey: string

  constructor(apiUrl: string, name: string = 'Etherscan', apiKey: string) {
    super(apiUrl, name)
    this.apiKey = apiKey
  }

  async verify(chainId: string, address: string, compilationOutput: {[fileName: string]: CompilerAbstract}, selectedContractFileAndName: string) {
    const CODE_FORMAT = 'solidity-standard-json-input'

    const [selectedFileName, selectedContractName] = selectedContractFileAndName.split(':')
    const compilerAbstract = compilationOutput?.[selectedFileName || '']
    // TODO: Handle version Vyper contracts. This relies on Solidity metadata.
    const metadata = JSON.parse(compilerAbstract.data.contracts[selectedFileName][selectedContractName].metadata)
    const body = {
      chainId,
      codeformat: CODE_FORMAT,
      sourceCode: compilerAbstract.input,
      contractaddress: address,
      contractname: selectedContractFileAndName,
      compilerversion: metadata.compiler.version,
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
      throw new Error(`Error on Etherscan verification at ${this.apiUrl}: Status:${response.status} Response: ${await response.text()}`)
    }
    const data = await response.json()

    if (data.status !== '1' || data.message !== 'OK') {
      throw new Error(`Error on Etherscan verification at ${this.apiUrl}: ${data.message}`)
    }

    return data.result
  }
}
