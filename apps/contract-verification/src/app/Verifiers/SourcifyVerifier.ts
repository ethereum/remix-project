import {SourcesCode} from '@remix-project/remix-solidity'
import {AbstractVerifier} from './AbstractVerifier'

export class SourcifyVerifier extends AbstractVerifier {
  constructor(apiUrl: string, name: string = 'Sourcify') {
    super(apiUrl, name)
  }

  async verify(chainId: string, address: string, sources: SourcesCode, metadataStr: string): Promise<boolean> {
    // from { "filename.sol": {content: "contract MyContract { ... }"} }
    // to { "filename.sol": "contract MyContract { ... }" }
    const formattedSources = Object.entries(sources).reduce((acc, [fileName, {content}]) => {
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
      throw new Error(`Error on Sourcify verification at ${this.apiUrl}: Status:${response.status} Response: ${await response.text()}`)
    }

    const data = await response.json()
    console.log(data)

    return data.result
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
