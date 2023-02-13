import * as packageJson from '../../../../../package.json'
import React from 'react' // eslint-disable-line
import { AbstractProvider } from './abstract-provider'

const profile = {
  name: 'ganache-provider',
  displayName: 'Ganache Provider',
  kind: 'provider',
  description: 'Truffle Ganache provider',
  methods: ['sendAsync', 'init'],
  version: packageJson.version
}

export class GanacheProvider extends AbstractProvider {
  constructor (blockchain) {
    super(profile, blockchain, 'http://127.0.0.1:8545')
  }

  body (): JSX.Element {
    return (
      <div> Note: To run Ganache on your system, run:
        <div className="p-1 pl-3"><b>yarn global add ganache</b></div> 
        <div className="p-1 pl-3"><b>ganache</b></div>       
        <div className="pt-2 pb-4">
          For more info, visit: <a href="https://github.com/trufflesuite/ganache" target="_blank">Ganache Documentation</a>
        </div>
        <div>Ganache JSON-RPC Endpoint:</div>
      </div>
    )
  }
}