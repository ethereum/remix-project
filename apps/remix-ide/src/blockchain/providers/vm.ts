import { Web3, FMT_BYTES, FMT_NUMBER, LegacySendAsyncProvider } from 'web3'
import { fromWei, toBigInt } from 'web3-utils'
import { privateToAddress, hashPersonalMessage, isHexString, bytesToHex } from '@ethereumjs/util'
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
        cb('No accounts?')
      })
  }

  async resetEnvironment (stringifiedState?: string) {
    if (this.worker) this.worker.terminate()
    this.worker = new Worker(new URL('./worker-vm', import.meta.url))
    const provider = this.executionContext.getProviderObject()

    let incr = 0
    const stamps = {}

    return new Promise((resolve, reject) => {
      this.worker.addEventListener('message', (msg) => {
        if (msg.data.cmd === 'sendAsyncResult' && stamps[msg.data.stamp]) {
          if (stamps[msg.data.stamp].callback) {
            stamps[msg.data.stamp].callback(msg.data.error, msg.data.result)
            return
          }
          if (msg.data.error) {
            stamps[msg.data.stamp].reject(msg.data.error)
          } else {
            stamps[msg.data.stamp].resolve(msg.data.result)
          }
        } else if (msg.data.cmd === 'initiateResult') {
          if (!msg.data.error) {
            this.provider = {
              sendAsync: (query, callback) => {
                return new Promise((resolve, reject) => {
                  const stamp = Date.now() + incr
                  incr++
                  stamps[stamp] = { callback, resolve, reject }
                  this.worker.postMessage({ cmd: 'sendAsync', query, stamp })
                })
              }
            }
            this.web3 = new Web3(this.provider as LegacySendAsyncProvider)
            this.web3.setConfig({ defaultTransactionType: '0x0' })
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
      if (stringifiedState) {
        try {
          const blockchainState = JSON.parse(stringifiedState)
          const blockNumber = parseInt(blockchainState.latestBlockNumber, 16)
          const stateDb = blockchainState.db

          this.worker.postMessage({
            cmd: 'init',
            fork: this.executionContext.getCurrentFork(),
            nodeUrl: provider?.options['nodeUrl'],
            blockNumber,
            stateDb,
            blocks: blockchainState.blocks
          })
        } catch (e) {
          console.error(e)
        }
      } else {
        this.worker.postMessage({
          cmd: 'init',
          fork: this.executionContext.getCurrentFork(),
          nodeUrl: provider?.options['nodeUrl'],
          blockNumber: provider?.options['blockNumber']
        })
      }
    })
  }

  // TODO: is still here because of the plugin API
  // can be removed later when we update the API
  createVMAccount (newAccount) {
    const { privateKey, balance } = newAccount
    this.worker.postMessage({ cmd: 'addAccount', privateKey: privateKey, balance })
    const privKey = Buffer.from(privateKey, 'hex')
    return bytesToHex(privateToAddress(privKey))
  }

  newAccount (_passwordPromptCb, cb) {
    const stamp = Date.now()
    this.newAccountCallback[stamp] = cb
    this.worker.postMessage({ cmd: 'newAccount', stamp })
  }

  async getBalanceInEther (address) {
    const balance = await this.web3.eth.getBalance(address, undefined, { number: FMT_NUMBER.HEX, bytes: FMT_BYTES.HEX })
    const balInString = toBigInt(balance).toString(10)
    return balInString === '0' ? balInString : fromWei(balInString, 'ether')
  }

  getGasPrice (cb) {
    this.web3.eth.getGasPrice().then((result => cb(null, result))).catch((error) => cb(error))
  }

  signMessage (message, account, _passphrase, cb) {
    const messageHash = hashPersonalMessage(Buffer.from(message))
    message = isHexString(message) ? message : Web3.utils.utf8ToHex(message)
    this.web3.eth.sign(message, account)
      .then(signedData => cb(null, bytesToHex(messageHash), signedData))
      .catch(error => cb(error))
  }
}
