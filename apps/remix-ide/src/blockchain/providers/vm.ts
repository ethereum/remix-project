import Web3, { FMT_BYTES, FMT_NUMBER, LegacySendAsyncProvider } from 'web3'
import { fromWei, toBigInt } from 'web3-utils'
import { privateToAddress, hashPersonalMessage } from '@ethereumjs/util'
import { extend, JSONRPCRequestPayload, JSONRPCResponseCallback } from '@remix-project/remix-simulator'
import { ExecutionContext } from '../execution-context'

export class VMProvider {
  executionContext: ExecutionContext
  web3: Web3
  worker: Worker
  provider: {
    sendAsync: (query: JSONRPCRequestPayload, callback: JSONRPCResponseCallback) => void
  }
  newAccountCallback: {[stamp: number]: (error: Error, address: string) => void}

  constructor (executionContext: ExecutionContext) {

    this.executionContext = executionContext
    this.worker = null
    this.provider = null
    this.newAccountCallback = {}
  }

  getAccounts (cb) {
    this.web3.eth.getAccounts()
      .then(accounts => cb(null, accounts))
      .catch(err => {
        console.log('err',err)
        cb('No accounts?')
      })
  }

  async resetEnvironment () {
    if (this.worker) this.worker.terminate()
    this.worker = new Worker(new URL('./worker-vm', import.meta.url))
    const provider = this.executionContext.getProviderObject()

    let incr = 0
    const stamps = {}

    return new Promise((resolve, reject) => {
      this.worker.addEventListener('message', (msg) => {
        if (msg.data.cmd === 'sendAsyncResult' && stamps[msg.data.stamp]) {
          stamps[msg.data.stamp](msg.data.error, msg.data.result)
        } else if (msg.data.cmd === 'initiateResult') {
          if (!msg.data.error) {
            this.provider = {
              sendAsync: (query, callback) => {
                console.log('query',query)
                console.log('callback',callback)
                const stamp = Date.now() + incr
                incr++
                stamps[stamp] = callback
                this.worker.postMessage({ cmd: 'sendAsync', query, stamp })
              }
            }
            this.web3 = new Web3(this.provider as LegacySendAsyncProvider)
            extend(this.web3)
            this.executionContext.setWeb3(this.executionContext.getProvider(), this.web3)
            resolve({})
          } else {
            reject(new Error(msg.data.error))
          }
        } else if (msg.data.cmd === 'newAccountResult') {
          if (this.newAccountCallback[msg.data.stamp]) {
            this.newAccountCallback[msg.data.stamp](msg.data.error, msg.data.result)
            delete this.newAccountCallback[msg.data.stamp]
          }
        }
      })
      this.worker.postMessage({ cmd: 'init', fork: this.executionContext.getCurrentFork(), nodeUrl: provider?.options['nodeUrl'], blockNumber: provider?.options['blockNumber']})
    })
  }

  // TODO: is still here because of the plugin API
  // can be removed later when we update the API
  createVMAccount (newAccount) {
    const { privateKey, balance } = newAccount
    this.worker.postMessage({ cmd: 'addAccount', privateKey: privateKey, balance })
    const privKey = Buffer.from(privateKey, 'hex')
    return '0x' + privateToAddress(privKey).toString('hex')
  }

  newAccount (_passwordPromptCb, cb) {
    const stamp = Date.now()
    this.newAccountCallback[stamp] = cb
    this.worker.postMessage({ cmd: 'newAccount', stamp })
  }

  async getBalanceInEther (address) {
    const balance = await this.web3.eth.getBalance(address, undefined, { number: FMT_NUMBER.HEX, bytes: FMT_BYTES.HEX })
    return fromWei(toBigInt(balance).toString(10), 'ether')
  }

  getGasPrice (cb) {
    this.web3.eth.getGasPrice(cb)
  }

  signMessage (message, account, _passphrase, cb) {
    const messageHash = hashPersonalMessage(Buffer.from(message))
    this.web3.eth.sign(message, account)
      .then(signedData => cb(null, '0x' + messageHash.toString('hex'), signedData))
      .catch(error => cb(error))
  }

  getProvider () {
    return this.executionContext.getProvider()
  }
}
