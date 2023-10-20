'use strict'
import { RunBlockResult, RunTxResult } from '@ethereumjs/vm'
import { ConsensusType } from '@ethereumjs/common'
import { Transaction, FeeMarketEIP1559Transaction } from '@ethereumjs/tx'
import { Block } from '@ethereumjs/block'
import { bufferToHex, Address } from '@ethereumjs/util'
import type { Account } from '@ethereumjs/util'
import { EventManager } from '../eventManager'
import { LogsManager } from './logsManager'
import type { Transaction as InternalTransaction } from './txRunner'

export type VMexecutionResult = {
  result: RunTxResult,
  transactionHash: string
  block: Block,
  tx: Transaction
}

export type VMExecutionCallBack = (error: string | Error, result?: VMexecutionResult) => void

export class TxRunnerVM {
  event
  blockNumber
  pendingTxs
  vmaccounts
  queusTxs
  blocks
  logsManager
  commonContext
  blockParentHash
  nextNonceForCall: number
  getVMObject: () => any

  constructor (vmaccounts, api, getVMObject) {
    this.event = new EventManager()
    this.logsManager = new LogsManager()
    // has a default for now for backwards compatability
    this.getVMObject = getVMObject
    this.commonContext = this.getVMObject().common
    this.blockNumber = 0
    this.pendingTxs = {}
    this.vmaccounts = vmaccounts
    this.queusTxs = []
    this.blocks = []
    /*
      txHash is generated using the nonce,
      in order to have unique transaction hash, we need to keep using different nonce (in case of a call)
      so we increment this value after each call.
      For this to function we also need to skip nonce validation, in the vm: `{ skipNonce: true }`
    */
    this.nextNonceForCall = 0

    const vm = this.getVMObject().vm
    this.blockParentHash = vm.blockchain.genesisBlock.hash()
  }

  execute (args: InternalTransaction, confirmationCb, gasEstimationForceSend, promptCb, callback: VMExecutionCallBack) {
    let data = args.data
    if (data.slice(0, 2) !== '0x') {
      data = '0x' + data
    }

    try {
      this.runInVm(args.from, args.to, data, args.value, args.gasLimit, args.useCall, callback)
    } catch (e) {
      callback(e, null)
    }
  }

  runInVm (from: string, to: string, data: string, value: string, gasLimit: number, useCall: boolean, callback: VMExecutionCallBack) {
    let account
    if (!from && useCall && Object.keys(this.vmaccounts).length) {
      from = Object.keys(this.vmaccounts)[0]
      account = this.vmaccounts[from]
    } else account = this.vmaccounts[from] 
    
    if (!account) {
      return callback('Invalid account selected')
    }
    
    this.getVMObject().stateManager.getAccount(Address.fromString(from)).then((res: Account) => {
      const EIP1559 = this.commonContext.hardfork() !== 'berlin' // berlin is the only pre eip1559 fork that we handle.
      let tx
      if (!EIP1559) {
        tx = Transaction.fromTxData({
          nonce: useCall ? this.nextNonceForCall : res.nonce,
          gasPrice: '0x1',
          gasLimit: gasLimit,
          to: to,
          value: value,
          data: Buffer.from(data.slice(2), 'hex')
        }, { common: this.commonContext }).sign(account.privateKey)
      } else {
        tx = FeeMarketEIP1559Transaction.fromTxData({
          nonce: useCall ? this.nextNonceForCall : res.nonce,
          maxPriorityFeePerGas: '0x01',
          maxFeePerGas: '0x1',
          gasLimit: gasLimit,
          to: to,
          value: value,
          data: Buffer.from(data.slice(2), 'hex')
        }).sign(account.privateKey)
      }
      if (useCall) this.nextNonceForCall++

      const coinbases = ['0x0e9281e9c6a0808672eaba6bd1220e144c9bb07a', '0x8945a1288dc78a6d8952a92c77aee6730b414778', '0x94d76e24f818426ae84aa404140e8d5f60e10e7e']
      const difficulties = [69762765929000, 70762765929000, 71762765929000]
      const difficulty = this.commonContext.consensusType() === ConsensusType.ProofOfStake ? 0 : difficulties[this.blockNumber % difficulties.length]
      
      const blocknumber = this.blockNumber + 1
      const block = Block.fromBlockData({
        header: {
          timestamp: new Date().getTime() / 1000 | 0,
          number: blocknumber,
          coinbase: coinbases[blocknumber % coinbases.length],
          difficulty,
          gasLimit,
          baseFeePerGas: EIP1559 ? '0x1' : undefined,
          parentHash: this.blockParentHash
        },
        transactions: [tx]
      }, { common: this.commonContext, hardforkByBlockNumber: false, hardforkByTTD: undefined })

      if (!useCall) {
        this.blockNumber = this.blockNumber + 1
        this.blockParentHash = block.hash()
        this.runBlockInVm(tx, block, (err, result) => {
          if (!err) this.getVMObject().vm.blockchain.putBlock(block)
          callback(err, result)
        })
      } else {
        this.getVMObject().stateManager.checkpoint().then(() => {
          this.runBlockInVm(tx, block, (err, result) => {
            this.getVMObject().stateManager.revert().then(() => {
              callback(err, result)
            })
          })
        })
      }
    }).catch((e) => {
      callback(e)
    })
  }

  runBlockInVm (tx, block, callback) {
    this.getVMObject().vm.runBlock({ block: block, generate: true, skipBlockValidation: true, skipBalance: false, skipNonce: true }).then((results: RunBlockResult) => {
      const result: RunTxResult = results.results[0]
      callback(null, {
        result,
        transactionHash: bufferToHex(Buffer.from(tx.hash())),
        block,
        tx
      })
    }).catch(function (err) {
      callback(err)
    })
  }
}
