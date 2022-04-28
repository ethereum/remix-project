import * as packageJson from '../../../../../package.json'
import { Plugin } from '@remixproject/engine'
import { AppModal, AlertModal, ModalTypes } from '@remix-ui/app'
import React from 'react' // eslint-disable-line
import { Blockchain } from '../../blockchain/blockchain'
import { ethers } from 'ethers'
import { AbstractProvider } from './abstract-provider'

const profile = {
  name: 'hardhat-provider',
  displayName: 'Hardhat Provider',
  kind: 'provider',
  description: 'Hardhat provider',
  methods: ['sendAsync'],
  version: packageJson.version
}

export class HardhatProvider extends AbstractProvider {
  constructor (blockchain) {
    super(profile, blockchain, 'http://127.0.0.1:8545')
  }

  body (): JSX.Element {
    return (
      <div> Note: To run Hardhat network node on your system, go to hardhat project folder and run command:
        <div className="border p-1">npx hardhat node</div>       
        For more info, visit: <a href="https://hardhat.org/getting-started/#connecting-a-wallet-or-dapp-to-hardhat-network" target="_blank">Hardhat Documentation</a>
        <div>Hardhat JSON-RPC Endpoint:</div>
      </div>
    )
  }
}