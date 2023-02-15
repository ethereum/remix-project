import React, { useRef } from 'react' // eslint-disable-line
import * as packageJson from '../../../../../package.json'
import { AppModal, ModalTypes } from '@remix-ui/app'
import { BasicVMProvider } from './vm-provider'

export class CustomForkVMProvider extends BasicVMProvider {
  nodeUrl: string
  blockNumber: number | 'latest'
  inputs: any

  constructor (blockchain) {
    super({
      name: 'vm-custom-fork',
      displayName: 'Custom fork - Remix VM (London)',
      kind: 'provider',
      description: 'Remix VM (London)',
      methods: ['sendAsync', 'init'],
      version: packageJson.version
    }, blockchain)
    this.blockchain = blockchain
    this.fork = ''
    this.nodeUrl = ''
    this.blockNumber = 'latest'
    this.inputs = {}
  }

  async init () {
    this.inputs = {nodeUrl: '', evm: '', blockNumber: '' }
    const body = () => {
      return <div>
      <div>
        <label>Node URL</label>
        <input type="text" value={this.inputs.nodeUrl} ></input>
      </div>
      <div>
        <label>Block number (or "latest")</label>
        <input type="text" placeholder='block number or "latest"' value={this.inputs.blockNumber} ></input>
      </div>
      <div>
        <label>EVM</label>
        <select value={this.inputs.evm}>
                      <option value="berlin" key="berlin">Berlin</option>
                      <option value="london" key="london" >London</option>
                    </select>
      </div>
    </div>
    } 
    await ((): Promise<string> => {
      return new Promise((resolve, reject) => {
        const modalContent: AppModal = {
          id: this.profile.name,
          title: this.profile.displayName,
          message: body(),
          modalType: ModalTypes.default,
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
          }
        }
        this.call('notification', 'modal', modalContent)
      })
    })()
    this.fork = this.inputs.evm
    this.nodeUrl = this.inputs.nodeUrl
    const block = this.inputs.blockNumber
    this.blockNumber = block === 'latest' ? 'latest' : parseInt(block)
    return {
      'fork': this.fork,
      'nodeUrl': this.nodeUrl,
      'blockNumber': this.blockNumber
    }
  }
}
