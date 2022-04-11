import { Plugin } from '@remixproject/engine'
import { AppModal, AlertModal, ModalTypes } from '@remix-ui/app'
import { Blockchain } from '../../blockchain/blockchain'
import { ethers } from 'ethers'

type JsonDataRequest = {
  id: number,
  jsonrpc: string // version
  method: string,
  params: Array<any>,
}

type JsonDataResult = {
  id: number,
  jsonrpc: string // version
  result: any
}

type RejectRequest = (error: Error) => void
type SuccessRequest = (data: JsonDataResult) => void

export abstract class AbstractProvider extends Plugin {
  provider: ethers.providers.JsonRpcProvider
  blocked: boolean
  blockchain: Blockchain
  defaultUrl: string

  constructor (profile, blockchain, defaultUrl) {
    super(profile)
    this.defaultUrl = defaultUrl
    this.provider = null
    this.blocked = false // used to block any call when trying to recover after a failed connection.
    this.blockchain = blockchain
  }

  abstract body(): JSX.Element

  onDeactivation () {
    this.provider = null
    this.blocked = false
  }

  sendAsync (data: JsonDataRequest): Promise<any> {
    return new Promise(async (resolve, reject) => {
      if (this.blocked) return reject(new Error('provider unable to connect'))
      // If provider is not set, allow to open modal only when provider is trying to connect
      if (!this.provider) {
        let value: string
        try {
          value = await ((): Promise<string> => {
            return new Promise((resolve, reject) => {
              const modalContent: AppModal = {
                id: this.profile.name,
                title: this.profile.displayName,
                message: this.body(),
                modalType: ModalTypes.prompt,
                okLabel: 'OK',
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
                defaultValue: this.defaultUrl
              }
              this.call('notification', 'modal', modalContent)
            })
          })()
        } catch (e) {
          // the modal has been canceled/hide
          const result = data.method === 'net_listening' ? 'canceled' : []
          resolve({ jsonrpc: '2.0', result: result, id: data.id })
          this.switchAway(false)
          return
        }
        this.provider = new ethers.providers.JsonRpcProvider(value)
        try {
          await this.provider.ready
        } catch (e) {
          this.switchAway(true)
          return
        }
        this.sendAsyncInternal(data, resolve, reject)       
      } else {
        this.sendAsyncInternal(data, resolve, reject)
      }
    })
  }

  private async switchAway (showError) {
    this.blocked = true
    if (showError) {
      const modalContent: AlertModal = {
        id: this.profile.name,
        title: this.profile.displayName,
        message: `Error while connecting to the provider, provider not connected`,
      }
      this.call('notification', 'alert', modalContent)
    }
    await this.call('udapp', 'setEnvironmentMode', { context: 'vm', fork: 'london' })
    this.provider = null
    setTimeout(_ => { this.blocked = false }, 1000) // we wait 1 second for letting remix to switch to vm        
    return
  }

  private async sendAsyncInternal (data: JsonDataRequest, resolve: SuccessRequest, reject: RejectRequest): Promise<void> {
    if (this.provider) {
      // Check the case where current environment is VM on UI and it still sends RPC requests
      // This will be displayed on UI tooltip as 'cannot get account list: Environment Updated !!'
      if (this.blockchain.getProvider() !== this.profile.displayName && data.method !== 'net_listening') return reject(new Error('Environment Updated !!'))

      try {
        const result = await this.provider.send(data.method, data.params)
        resolve({ jsonrpc: '2.0', result, id: data.id })
      } catch (error) {
        reject(error)
      }
    } else {
      const result = data.method === 'net_listening' ? 'canceled' : []
      resolve({ jsonrpc: '2.0', result: result, id: data.id })
    }
  }
}
