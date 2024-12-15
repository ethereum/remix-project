import * as packageJson from '../../../../../package.json'
import React, { useContext } from 'react' // eslint-disable-line
import { FormattedMessage } from 'react-intl'
import { AbstractProvider } from './abstract-provider'
import { AppContext, AppModal, ModalTypes } from '@remix-ui/app'
import { ethers } from 'ethers'

const profile = {
  name: 'remix-web-provider',
  displayName: 'Remix web & MetaMask',
  kind: 'provider',
  description: 'MetaMask',
  methods: ['sendAsync', 'init'],
  version: packageJson.version
}

export class RemixWebProvider extends AbstractProvider {
  
  constructor(blockchain) {
    super(profile, blockchain, 'http://127.0.0.1:8545')
  }

  async init() {

    const isConnected = await this.call('desktopHost', 'getIsConnected')

    if(isConnected) {
      this.provider = new ethers.providers.JsonRpcProvider(this.defaultUrl)
      return {
        nodeUrl: this.defaultUrl
      }
    }

    await ((): Promise<string> => {
      return new Promise((resolve, reject) => {
        const modalContent: AppModal = {
          id: this.profile.name,
          title: this.profile.displayName,
          message: this.body(),
          modalType: ModalTypes.confirm,
          okLabel: 'Connect',
          cancelLabel: 'Cancel',
         
          okFn: (value: string) => {
            setTimeout(() => resolve(value), 0)
          },
          cancelFn: () => {
            setTimeout(() => reject(new Error('Canceled')), 0)
          },
          hideFn: () => {
            setTimeout(() => reject(new Error('Hide')), 0)
          },
        }
        this.call('notification', 'modal', modalContent)
      })
    })()
    this.provider = new ethers.providers.JsonRpcProvider(this.defaultUrl)
    return {
      nodeUrl: this.defaultUrl
    }
  }

  body() {
    return (
      <>
        <div>You can deploy and run transactions in the environment of Remix on the web.</div>
        <div>This enables you to use MetaMask if you have it installed.</div>
        <div>Click here to open Remix in 'Desktop Connect Mode'</div>
        <div>And connect to any network there you want to use here.</div>
        
        <a className='mt-1 mb-1 btn btn-sm border-primary text-decoration-none' href="http://localhost:8080/?activate=udapp,desktopClient" target="_blank" rel="noreferrer">
          Remix on the web in Desktop Connect Mode
        </a>
        
        <div>After that click 'Connect'</div>
      </>
    )
  }
}
