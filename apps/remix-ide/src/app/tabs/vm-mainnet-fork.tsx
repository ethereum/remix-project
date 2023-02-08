import * as packageJson from '../../../../../package.json'
import React from 'react' // eslint-disable-line
import { AppModal, AlertModal, ModalTypes } from '@remix-ui/app'
import { ethers } from 'ethers'
import { AbstractProvider } from './abstract-provider'

const profile = {
  name: 'vm-mainnet-fork',
  displayName: 'Mainnet fork - Remix VM',
  kind: 'provider',
  description: 'Mainnet fork - Remix VM',
  methods: ['sendAsync'],
  version: packageJson.version
}

export class VMMainnetFork extends AbstractProvider {
  urlInput: JSX.Element
  blockInput: JSX.Element
  forkInput: JSX.Element
  constructor (blockchain) {
    super(profile, blockchain)
  }

  displayName () { return profile.displayName }

  nodeUrl () {
    return 'https://rpc.archivenode.io/e50zmkroshle2e2e50zm0044i7ao04ym'
  }

  blockNumber ()  {
    return 'latest'
  }

  async init() {
    this.provider = this.blockchain.providers.vm.provider
  }

  body (): JSX.Element {
    return (
      <>
      </>
    )
  }

  instanciateProvider (value): any {
    return this.provider
  }
}