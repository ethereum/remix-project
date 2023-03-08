/* global ethereum */
import React from 'react' // eslint-disable-line
import { Plugin } from '@remixproject/engine'
import { JsonDataRequest, RejectRequest, SuccessRequest } from '../providers/abstract-provider'
import Web3 from 'web3'
import { IProvider } from './abstract-provider'

const noInjectedProviderMsg = 'No injected provider found. Make sure your provider (e.g. MetaMask) is active and running (when recently activated you may have to reload the page).'

export class InjectedProvider extends Plugin implements IProvider {
  provider: any
  options: { [id: string] : any } = {}

  constructor (profile) {
    super(profile)
    if ((window as any).ethereum) {
      this.provider = new Web3((window as any).ethereum)
    }
  }

  askPermission (throwIfNoInjectedProvider) {
    if ((typeof (window as any).ethereum) !== "undefined" && (typeof (window as any).ethereum.request) === "function") {
      (window as any).ethereum.request({ method: "eth_requestAccounts" })
    } else if (throwIfNoInjectedProvider) {
      throw new Error(noInjectedProviderMsg)
    }
  }

  body (): JSX.Element {
    return (
      <div></div>
    )
  }

  async init () {
    const injectedProvider = (window as any).ethereum
    if (injectedProvider === undefined) {
      this.call('notification', 'toast', noInjectedProviderMsg)
      throw new Error(noInjectedProviderMsg)
    } else {
      if (injectedProvider && injectedProvider._metamask && injectedProvider._metamask.isUnlocked) {
        if (!await injectedProvider._metamask.isUnlocked()) this.call('notification', 'toast', 'Please make sure the injected provider is unlocked (e.g Metamask).')
      }
      this.askPermission(true)
    }
    return {}
  }

  sendAsync (data: JsonDataRequest): Promise<any> {
    return new Promise((resolve, reject) => {
      this.sendAsyncInternal(data, resolve, reject)
    })
  }

  private async sendAsyncInternal (data: JsonDataRequest, resolve: SuccessRequest, reject: RejectRequest): Promise<void> {
    // Check the case where current environment is VM on UI and it still sends RPC requests
    // This will be displayed on UI tooltip as 'cannot get account list: Environment Updated !!'
    if (!this.provider) {
      this.call('notification', 'toast', 'No injected provider (e.g Metamask) has been found.')
      return resolve({ jsonrpc: '2.0', error: 'no injected provider found', id: data.id })
    }
    try {
      let resultData = await this.provider.currentProvider.send(data.method, data.params)
      if (resultData) {
        if (resultData.jsonrpc && resultData.jsonrpc === '2.0') {
          resultData = resultData.result
        }
        resolve({ jsonrpc: '2.0', result: resultData, id: data.id })
      } else {
        resolve({ jsonrpc: '2.0', error: 'no return data provided', id: data.id })
      }
    } catch (error) {
      resolve({ jsonrpc: '2.0', error: error.message, id: data.id })
    }
  }
}
