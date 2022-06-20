import * as packageJson from '../../../../../package.json'
import { Plugin } from '@remixproject/engine'
import { AppModal, AlertModal, ModalTypes } from '@remix-ui/app'
import React from 'react' // eslint-disable-line
import { Blockchain } from '../../blockchain/blockchain'
import { ethers } from 'ethers'
import { AbstractProvider } from './abstract-provider'

const profile = {
  name: 'foundry-provider',
  displayName: 'Foundry Provider',
  kind: 'provider',
  description: 'Anvil',
  methods: ['sendAsync'],
  version: packageJson.version
}

export class FoundryProvider extends AbstractProvider {
  constructor (blockchain) {
    super(profile, blockchain, 'http://127.0.0.1:8545')
  }

  body (): JSX.Element {
    return (
      <div> Note: To run Anvil on your system, run
        <div className="border p-1">curl -L https://foundry.paradigm.xyz | bash</div> 
        <div className="border p-1">anvil</div>       
        For more info, visit: <a href="https://github.com/foundry-rs/foundry" target="_blank">Foundry Documentation</a>
        <div>Anvil JSON-RPC Endpoint:</div>
      </div>
    )
  }
}