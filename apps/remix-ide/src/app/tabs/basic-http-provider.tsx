import * as packageJson from '../../../../../package.json'
import React from 'react' // eslint-disable-line
import { ExternalHttpProvider } from './external-http-provider'
import { ethers } from 'ethers'

const profile = {
  name: 'basic-http-provider',
  displayName: 'External Http Provider',
  kind: 'provider',
  description: 'External Http Provider',
  methods: ['sendAsync', 'displayName'],
  version: packageJson.version
}

export class BasicHttpProvider extends ExternalHttpProvider {
  constructor (blockchain) {
    super(profile, blockchain)
  }

  displayName () { return profile.displayName }

  body (): JSX.Element {
    return (
      <div> Note: To run Anvil on your system, run:
        <div className="p-1 pl-3"><b>curl -L https://foundry.paradigm.xyz | bash</b></div>
        <div className="p-1 pl-3"><b>anvil</b></div>
        <div className="pt-2 pb-4">
          For more info, visit: <a href="https://github.com/foundry-rs/foundry" target="_blank">Foundry Documentation</a>
        </div>
        <div>Anvil JSON-RPC Endpoint:</div>
      </div>
    )
  }

  instanciateProvider (value): any {
    return new ethers.providers.JsonRpcProvider(value)
  }
}