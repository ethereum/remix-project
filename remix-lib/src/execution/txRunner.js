'use strict'
var EthJSTX = require('ethereumjs-tx').Transaction
var EthJSBlock = require('ethereumjs-block')
var ethJSUtil = require('ethereumjs-util')
var BN = ethJSUtil.BN
var defaultExecutionContext = require('./execution-context')
var EventManager = require('../eventManager')

class TxRunner {
  constructor (vmaccounts, api, executionContext) {
    this.event = new EventManager()
    // has a default for now for backwards compatability
    this.executionContext = executionContext || defaultExecutionContext
    this._api = api
    this.blockNumber = 0
    this.runAsync = true
    if (this.executionContext.isVM()) {
      // this.blockNumber = 1150000 // The VM is running in Homestead mode, which started at this block.
      this.blockNumber = 0 // The VM is running in Homestead mode, which started at this block.
      this.runAsync = false // We have to run like this cause the VM Event Manager does not support running multiple txs at the same time.
    }
    this.pendingTxs = {}
    this.vmaccounts = vmaccounts
    this.queusTxs = []
    this.blocks = []
  }

  rawRun (args, confirmationCb, gasEstimationForceSend, promptCb, cb) {
    var timestamp = Date.now()
    if (args.timestamp) {
      timestamp = args.timestamp
    }
    run(this, args, timestamp, confirmationCb, gasEstimationForceSend, promptCb, cb)
  }

  _executeTx (tx, gasPrice, api, promptCb, callback) {
    if (gasPrice) tx.gasPrice = this.executionContext.web3().toHex(gasPrice)
    if (api.personalMode()) {
      promptCb(
        (value) => {
          this._sendTransaction(this.executionContext.web3().personal.sendTransaction, tx, value, callback)
        },
        () => {
          return callback('Canceled by user.')
        }
      )
    } else {
      this._sendTransaction(this.executionContext.web3().eth.sendTransaction, tx, null, callback)
    }
  }

  _sendTransaction (sendTx, tx, pass, callback) {
    var self = this
    var cb = function (err, resp) {
      if (err) {
        return callback(err, resp)
      }
      self.event.trigger('transactionBroadcasted', [resp])
      var listenOnResponse = () => {
        return new Promise(async (resolve, reject) => {
          var result = await tryTillReceiptAvailable(resp)
          tx = await tryTillTxAvailable(resp)
          resolve({
            result,
            tx,
            transactionHash: result ? result.transactionHash : null
          })
        })
      }
      listenOnResponse().then((txData) => { callback(null, txData) }).catch((error) => { callback(error) })
    }
    var args = pass !== null ? [tx, pass, cb] : [tx, cb]
    try {
      sendTx.apply({}, args)
    } catch (e) {
      return callback(`Send transaction failed: ${e.message} . if you use an injected provider, please check it is properly unlocked. `)
    }
  }

  execute (args, confirmationCb, gasEstimationForceSend, promptCb, callback) {
    var self = this

    var data = args.data
    if (data.slice(0, 2) !== '0x') {
      data = '0x' + data
    }

    if (!this.executionContext.isVM()) {
      self.runInNode(args.from, args.to, data, args.value, args.gasLimit, args.useCall, confirmationCb, gasEstimationForceSend, promptCb, callback)
    } else {
      try {
        self.runInVm(args.from, args.to, data, args.value, args.gasLimit, args.useCall, args.timestamp, callback)
      } catch (e) {
        callback(e, null)
      }
    }
  }

  runInVm (from, to, data, value, gasLimit, useCall, timestamp, callback) {
    const self = this
    var account = self.vmaccounts[from]
    if (!account) {
      return callback('Invalid account selected')
    }

    this.executionContext.vm().stateManager.getAccount(Buffer.from(from.replace('0x', ''), 'hex'), (err, res) => {
      if (err) {
        callback('Account not found')
      } else {
        var tx = new EthJSTX({
          timestamp: timestamp,
          nonce: new BN(res.nonce),
          gasPrice: new BN(1),
          gasLimit: gasLimit,
          to: to,
          value: new BN(value, 10),
          data: Buffer.from(data.slice(2), 'hex')
        })
        tx.sign(account.privateKey)
        const coinbases = ['0x0e9281e9c6a0808672eaba6bd1220e144c9bb07a', '0x8945a1288dc78a6d8952a92c77aee6730b414778', '0x94d76e24f818426ae84aa404140e8d5f60e10e7e']
        const difficulties = [new BN('69762765929000', 10), new BN('70762765929000', 10), new BN('71762765929000', 10)]
        var block = new EthJSBlock({
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
          this.executionContext.vm().stateManager.checkpoint(() => {
            this.runBlockInVm(tx, block, (err, result) => {
              this.executionContext.vm().stateManager.revert(() => {
                callback(err, result)
              })
            })
          })
        }
      }
    })
  }

  runBlockInVm (tx, block, callback) {
    this.executionContext.vm().runBlock({ block: block, generate: true, skipBlockValidation: true, skipBalance: false }).then((results) => {
      let result = results.results[0]
      if (result) {
        const status = result.execResult.exceptionError ? 0 : 1
        result.status = `0x${status}`
      }
      this.executionContext.addBlock(block)
      this.executionContext.trackTx('0x' + tx.hash().toString('hex'), block)
      callback(null, {
        result: result,
        transactionHash: ethJSUtil.bufferToHex(Buffer.from(tx.hash()))
      })
    }).catch(function (err) {
      callback(err)
    })
  }

  runInNode (from, to, data, value, gasLimit, useCall, confirmCb, gasEstimationForceSend, promptCb, callback) {
    const self = this
    var tx = { from: from, to: to, data: data, value: value }

    if (useCall) {
      tx.gas = gasLimit
      return this.executionContext.web3().eth.call(tx, function (error, result) {
        callback(error, {
          result: result,
          transactionHash: result ? result.transactionHash : null
        })
      })
    }
    this.executionContext.web3().eth.estimateGas(tx, function (err, gasEstimation) {
      gasEstimationForceSend(err, () => {
        // callback is called whenever no error
        tx.gas = !gasEstimation ? gasLimit : gasEstimation

        if (self._api.config.getUnpersistedProperty('doNotShowTransactionConfirmationAgain')) {
          return self._executeTx(tx, null, self._api, promptCb, callback)
        }

        self._api.detectNetwork((err, network) => {
          if (err) {
            console.log(err)
            return
          }

          confirmCb(network, tx, tx.gas, (gasPrice) => {
            return self._executeTx(tx, gasPrice, self._api, promptCb, callback)
          }, (error) => {
            callback(error)
          })
        })
      }, () => {
        var blockGasLimit = self.executionContext.currentblockGasLimit()
        // NOTE: estimateGas very likely will return a large limit if execution of the code failed
        //       we want to be able to run the code in order to debug and find the cause for the failure
        if (err) return callback(err)

        var warnEstimation = ' An important gas estimation might also be the sign of a problem in the contract code. Please check loops and be sure you did not sent value to a non payable function (that\'s also the reason of strong gas estimation). '
        warnEstimation += ' ' + err

        if (gasEstimation > gasLimit) {
          return callback('Gas required exceeds limit: ' + gasLimit + '. ' + warnEstimation)
        }
        if (gasEstimation > blockGasLimit) {
          return callback('Gas required exceeds block gas limit: ' + gasLimit + '. ' + warnEstimation)
        }
      })
    })
  }
}

async function tryTillReceiptAvailable (txhash, done) {
  return new Promise((resolve, reject) => {
    this.executionContext.web3().eth.getTransactionReceipt(txhash, async (err, receipt) => {
      if (err || !receipt) {
        // Try again with a bit of delay if error or if result still null
        await pause()
        return resolve(await tryTillReceiptAvailable(txhash))
      } else {
        return resolve(receipt)
      }
    })
  })
}

async function tryTillTxAvailable (txhash, done) {
  return new Promise((resolve, reject) => {
    this.executionContext.web3().eth.getTransaction(txhash, async (err, tx) => {
      if (err || !tx) {
        // Try again with a bit of delay if error or if result still null
        await pause()
        return resolve(await tryTillTxAvailable(txhash))
      } else {
        return resolve(tx)
      }
    })
  })
}

async function pause () { return new Promise((resolve, reject) => { setTimeout(resolve, 500) }) }

function run (self, tx, stamp, confirmationCb, gasEstimationForceSend, promptCb, callback) {
  if (!self.runAsync && Object.keys(self.pendingTxs).length) {
    self.queusTxs.push({ tx, stamp, callback })
  } else {
    self.pendingTxs[stamp] = tx
    self.execute(tx, confirmationCb, gasEstimationForceSend, promptCb, (error, result) => {
      delete self.pendingTxs[stamp]
      callback(error, result)
      if (self.queusTxs.length) {
        var next = self.queusTxs.pop()
        run(self, next.tx, next.stamp, next.callback)
      }
    })
  }
}

module.exports = TxRunner
