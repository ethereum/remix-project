import {CompilerAbstract} from '@remix-project/remix-solidity'

export abstract class AbstractVerifier {
  name: string
  apiUrl: string
  enabled: boolean

  constructor(apiUrl: string, name: string) {
    this.apiUrl = apiUrl
    this.name = name
    this.enabled = true
  }

  abstract verify(chainId: string, address: string, compilationOutput: {[fileName: string]: CompilerAbstract}, selectedContractFileAndName: string): Promise<any>
}
