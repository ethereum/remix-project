import * as packageJson from '../../../../../package.json'
import React from 'react' // eslint-disable-line
import { AbstractProvider } from './abstract-provider'

const profile = {
  name: 'foundry-provider',
  displayName: 'Foundry Provider',
  kind: 'provider',
  description: 'Foundry Anvil provider',
  methods: ['sendAsync', 'init'],
  version: packageJson.version
}

export class FoundryProvider extends AbstractProvider {
  constructor (blockchain) {
    super(profile, blockchain, 'http://127.0.0.1:8545')
  }

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
}