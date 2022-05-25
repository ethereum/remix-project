import * as packageJson from '../../../../../package.json'
import { Plugin } from '@remixproject/engine'
import { AppModal, AlertModal, ModalTypes } from '@remix-ui/app'
import React from 'react' // eslint-disable-line
import { Blockchain } from '../../blockchain/blockchain'
import { ethers } from 'ethers'
import { AbstractProvider } from './abstract-provider'

const profile = {
  name: 'ganache-provider',
  displayName: 'Ganache Provider',
  kind: 'provider',
  description: 'Ganache',
  methods: ['sendAsync'],
  version: packageJson.version
}

export class GanacheProvider extends AbstractProvider {
  constructor (blockchain) {
    super(profile, blockchain, 'http://127.0.0.1:8545')
  }

  body (): JSX.Element {
    return (
      <div> Note: To run Ganache on your system, run
        <div className="border p-1">yarn global add ganache</div> 
        <div className="border p-1">ganache</div>       
        For more info, visit: <a href="https://github.com/trufflesuite/ganache" target="_blank">Ganache Documentation</a>
        <div>Ganache JSON-RPC Endpoint:</div>
      </div>
    )
  }
}