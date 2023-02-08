/* global ethereum */
import { Plugin } from '@remixproject/engine'
import { JsonDataRequest, RejectRequest, SuccessRequest } from './abstract-provider'
import Web3 from 'web3'

const noInjectedProviderMsg = 'No injected provider found. Make sure your provider (e.g. MetaMask) is active and running (when recently activated you may have to reload the page).'

export class InjectedProvider extends Plugin {
  provider: any

  constructor (profile) {
    super(profile)
    if ((window as any).ethereum) {
      this.provider = new Web3((window as any).ethereum)
    }
  }

  askPermission (throwIfNoInjectedProvider) {
    if (typeof (window as any).ethereum !== "undefined" && typeof (window as any).request === "function") {
      (window as any).request({ method: "eth_requestAccounts" })
    } else if (throwIfNoInjectedProvider) {
      throw new Error(noInjectedProviderMsg)
    }
  }

  async init () {
    const injectedProvider = (window as any).ethereum
    if (injectedProvider === undefined) {
      throw new Error(noInjectedProviderMsg)
    } else {
      if (injectedProvider && injectedProvider._metamask && injectedProvider._metamask.isUnlocked) {
        if (!await injectedProvider._metamask.isUnlocked()) throw new Error('Please make sure the injected provider is unlocked (e.g Metamask).')
      }
      this.askPermission(true)
    }
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
      return reject(new Error('no injected provider found.'))
    }
    try {
      if ((window as any) && typeof (window as any).ethereum.request === "function") (window as any).ethereum.request({ method: "eth_requestAccounts" });
      if (!await (window as any).ethereum._metamask.isUnlocked()) this.call('notification', 'toast', 'Please make sure the injected provider is unlocked (e.g Metamask).')
      const resultData = await this.provider.currentProvider.send(data.method, data.params)
      resolve({ jsonrpc: '2.0', result: resultData.result, id: data.id })
    } catch (error) {
      reject(error)
    }
  }
}
