import { Plugin } from '@remixproject/engine'
import { AppModal, AlertModal, ModalTypes } from '@remix-ui/app'
import { Blockchain } from '../../blockchain/blockchain'
import { ethers } from 'ethers'

export type JsonDataRequest = {
  id: number,
  jsonrpc: string // version
  method: string,
  params: Array<any>,
}

export type JsonDataResult = {
  id: number,
  jsonrpc: string // version
  result?: any,
  error?: any,
}

export type RejectRequest = (error: Error) => void
export type SuccessRequest = (data: JsonDataResult) => void

export interface IProvider {
  options: { [id: string] : any }
  init(): Promise<{ [id: string] : any }>
  body(): JSX.Element
  sendAsync (data: JsonDataRequest): Promise<JsonDataResult>
}

export abstract class AbstractProvider extends Plugin implements IProvider {
  provider: ethers.providers.JsonRpcProvider
  blockchain: Blockchain
  defaultUrl: string
  connected: boolean
  nodeUrl: string
  options: { [id: string] : any } = {}

  constructor (profile, blockchain, defaultUrl) {
    super(profile)
    this.defaultUrl = defaultUrl
    this.provider = null
    this.connected = false
    this.blockchain = blockchain
    this.nodeUrl = 'http://localhost:8545'
  }

  abstract body(): JSX.Element

  onDeactivation () {
    this.provider = null
  }

  async init () {
    this.nodeUrl = await ((): Promise<string> => {
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
          defaultValue: this.defaultUrl
        }
        this.call('notification', 'modal', modalContent)
      })
    })()
    this.provider = new ethers.providers.JsonRpcProvider(this.nodeUrl)
    return {
      nodeUrl: this.nodeUrl
    }
  }

  sendAsync (data: JsonDataRequest): Promise<JsonDataResult> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      if (!this.provider) return reject(new Error('provider node set'))
      this.sendAsyncInternal(data, resolve, reject)
    })
  }

  private async switchAway (showError) {
    if (!this.provider) return
    this.provider = null
    this.connected = false
    if (showError) {
      const modalContent: AlertModal = {
        id: this.profile.name,
        title: this.profile.displayName,
        message: `Error while connecting to the provider, provider not connected`,
      }
      this.call('notification', 'alert', modalContent)
    }
    await this.call('udapp', 'setEnvironmentMode', { context: 'vm-merge'})
    return
  }

  private async sendAsyncInternal (data: JsonDataRequest, resolve: SuccessRequest, reject: RejectRequest): Promise<void> {
    if (this.provider) {
      try {
        const result = await this.provider.send(data.method, data.params)
        resolve({ jsonrpc: '2.0', result, id: data.id })
      } catch (error) {
        if (error && error.message && error.message.includes('net_version') && error.message.includes('SERVER_ERROR')) {
          this.switchAway(true)
        }
        reject(error)
      }
    } else {
      const result = data.method === 'net_listening' ? 'canceled' : []
      resolve({ jsonrpc: '2.0', result: result, id: data.id })
    }
  }
}
