'use strict'
import { Transaction } from 'ethereumjs-tx'
import Block from 'ethereumjs-block'
import { BN, bufferToHex } from 'ethereumjs-util'
import { EventManager } from '../eventManager'
import { LogsManager } from './logsManager'

export class TxRunnerVM {
  event
  _api
  blockNumber
  runAsync
  pendingTxs
  vmaccounts
  queusTxs
  blocks
  txs
  logsManager
  getVM: () => any

  constructor (vmaccounts, api, getVM) {
    this.event = new EventManager()
    this.logsManager = new LogsManager()
    // has a default for now for backwards compatability
    this.getVM = getVM
    this._api = api
    this.blockNumber = 0
    this.runAsync = true
    this.blockNumber = 0 // The VM is running in Homestead mode, which started at this block.
    this.runAsync = false // We have to run like this cause the VM Event Manager does not support running multiple txs at the same time.    
    this.pendingTxs = {}
    this.vmaccounts = vmaccounts
    this.queusTxs = []
    this.blocks = []
  }

  execute (args, confirmationCb, gasEstimationForceSend, promptCb, callback) {
    let data = args.data
    if (data.slice(0, 2) !== '0x') {
      data = '0x' + data
    }

    try {
      this.runInVm(args.from, args.to, data, args.value, args.gasLimit, args.useCall, args.timestamp, callback)
    } catch (e) {
      callback(e, null)
    }
  }

  runInVm (from, to, data, value, gasLimit, useCall, timestamp, callback) {
    const self = this
    const account = self.vmaccounts[from]
    if (!account) {
      return callback('Invalid account selected')
    }

    this.getVM().stateManager.getAccount(Buffer.from(from.replace('0x', ''), 'hex'), (err, res) => {
      if (err) {
        callback('Account not found')
      } else {
        // See https://github.com/ethereumjs/ethereumjs-tx/blob/master/docs/classes/transaction.md#constructor
        // for initialization fields and their types
        value = value ? parseInt(value) : 0
        const tx = new Transaction({
          nonce: new BN(res.nonce),
          gasPrice: '0x1',
          gasLimit: gasLimit,
          to: to,
          value: value,
          data: Buffer.from(data.slice(2), 'hex')
        })
        tx.sign(account.privateKey)
        const coinbases = ['0x0e9281e9c6a0808672eaba6bd1220e144c9bb07a', '0x8945a1288dc78a6d8952a92c77aee6730b414778', '0x94d76e24f818426ae84aa404140e8d5f60e10e7e']
        const difficulties = [new BN('69762765929000', 10), new BN('70762765929000', 10), new BN('71762765929000', 10)]
        const block = new Block({
          header: {
            timestamp: timestamp || (new Date().getTime() / 1000 | 0),
            number: self.blockNumber,
            coinbase: coinbases[self.blockNumber % coinbases.length],
            difficulty: difficulties[self.blockNumber % difficulties.length],
            gasLimit: new BN(gasLimit, 10).imuln(2)
          },
          transactions: [tx],
          uncleHeaders: []
        })
        if (!useCall) {
          ++self.blockNumber
          this.runBlockInVm(tx, block, callback)
        } else {
          this.getVM().stateManager.checkpoint(() => {
            this.runBlockInVm(tx, block, (err, result) => {
              this.getVM().stateManager.revert(() => {
                callback(err, result)
              })
            })
          })
        }
      }
    })
  }

  runBlockInVm (tx, block, callback) {
    this.getVM().runBlock({ block: block, generate: true, skipBlockValidation: true, skipBalance: false }).then((results) => {
      const result = results.results[0]
      if (result) {
        const status = result.execResult.exceptionError ? 0 : 1
        result.status = `0x${status}`
      }
      callback(null, {
        result: result,
        transactionHash: bufferToHex(Buffer.from(tx.hash())),
        block,
        tx,
      })
    }).catch(function (err) {
      callback(err)
    })
  }  
}

