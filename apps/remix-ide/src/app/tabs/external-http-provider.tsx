import * as packageJson from '../../../../../package.json'
import React from 'react' // eslint-disable-line
import { AppModal, AlertModal, ModalTypes } from '@remix-ui/app'
import { AbstractProvider } from './abstract-provider'
import { ethers } from 'ethers'

export class ExternalHttpProvider extends AbstractProvider {
  constructor (profile, blockchain) {
    super(profile, blockchain)
  }
  
  displayName () { return '' }

  instanciateProvider (value): any {
    return new ethers.providers.JsonRpcProvider(value)
  }

  async init() {
    let value = await ((): Promise<string> => {
      return new Promise((resolve, reject) => {
        const modalContent: AppModal = {
          id: this.profile.name,
          title: this.profile.displayName,
          message: this.body(),
          modalType: ModalTypes.prompt,
          okLabel: 'OK',
          cancelLabel: 'Cancel',
          validationFn: (value) => {
            if (!value) return { valid: false, message: "value is empty" }
            if (value.startsWith('https://') || value.startsWith('http://')) {
              return { 
                valid: true, 
                message: ''
              }
            } else {
              return {
                valid: false, 
                message: 'the provided value should contain the protocol ( e.g starts with http:// or https:// )'
              }
            }
          },
          okFn: (value: string) => {
            setTimeout(() => resolve(value), 0)
          },
          cancelFn: () => {
            setTimeout(() => reject(new Error('Canceled')), 0)
          },
          hideFn: () => {
            setTimeout(() => reject(new Error('Hide')), 0)
          },
          defaultValue: 'http://127.0.0.1:8545'
        }
        this.call('notification', 'modal', modalContent)
      })
    })()
    if (value) {
      this.provider = this.instanciateProvider(value)
    } else
      throw new Error('value cannot be empty')
  }

  body (): JSX.Element {
    const thePath = '<path/to/local/folder/for/test/chain>'
    return (
      <>
        <div className="">
            Note: To use Geth & https://remix.ethereum.org, configure it to allow requests from Remix:(see <a href="https://geth.ethereum.org/docs/rpc/server" target="_blank" rel="noreferrer">Geth Docs on rpc server</a>)
          <div className="border p-1">geth --http --http.corsdomain https://remix.ethereum.org</div>
          <br />
          To run Remix & a local Geth test node, use this command: (see <a href="https://geth.ethereum.org/getting-started/dev-mode" target="_blank" rel="noreferrer">Geth Docs on Dev mode</a>)
          <div className="border p-1">geth --http --http.corsdomain="{window.origin}" --http.api web3,eth,debug,personal,net --vmdebug --datadir {thePath} --dev console</div>
          <br />
          <br />
          <b>WARNING:</b> It is not safe to use the --http.corsdomain flag with a wildcard: <b>--http.corsdomain *</b>
          <br />
          <br />For more info: <a href="https://remix-ide.readthedocs.io/en/latest/run.html#more-about-web3-provider" target="_blank" rel="noreferrer">Remix Docs on External HTTP Provider</a>
          <br />
          <br />
          External HTTP Provider Endpoint
        </div>
      </>
    )
  } 
}