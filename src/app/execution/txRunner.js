'use strict'
var EthJSTX = require('ethereumjs-tx')
var EthJSBlock = require('ethereumjs-block')
var ethJSUtil = require('ethereumjs-util')
var BN = ethJSUtil.BN

function TxRunner (executionContext, vmaccounts, opts) {
  this.executionContext = executionContext
  this.web3 = executionContext.web3()
  this.vm = executionContext.vm()
  this.queueTxs = opts.queueTxs
  this.personalMode = opts.personalMode
  this.blockNumber = 0
  if (this.executionContext.isVM()) {
    this.blockNumber = 1150000 // The VM is running in Homestead mode, which started at this block.
  }
  this.pendingTxs = {}
  this.vmaccounts = vmaccounts
}

TxRunner.prototype.rawRun = function (args, cb) {
  run(this, args, Date.now(), cb)
}

TxRunner.prototype.execute = function (args, callback) {
  var self = this

  var from = args.from
  var to = args.to
  var data = args.data
  if (data.slice(0, 2) !== '0x') {
    data = '0x' + data
  }
  var value = args.value
  var gasLimit = args.gasLimit

  var tx
  if (!self.executionContext.isVM()) {
    tx = {
      from: from,
      to: to,
      data: data,
      value: value
    }
    if (args.useCall) {
      tx.gas = gasLimit
      self.web3.eth.call(tx, function (error, result) {
        callback(error, {
          result: result,
          transactionHash: result.transactionHash
        })
      })
    } else {
      self.web3.eth.estimateGas(tx, function (err, gasEstimation) {
        if (err) {
          return callback(err, gasEstimation)
        }
        var blockGasLimit = self.executionContext.currentblockGasLimit()
        // NOTE: estimateGas very likely will return a large limit if execution of the code failed
        //       we want to be able to run the code in order to debug and find the cause for the failure
        if (gasEstimation > gasLimit) {
          return callback('Gas required exceeds limit: ' + gasLimit)
        }
        if (gasEstimation > blockGasLimit) {
          return callback('Gas required exceeds block gas limit: ' + gasLimit)
        }
        tx.gas = gasEstimation
        var sendTransaction = self.personalMode ? self.web3.personal.sendTransaction : self.web3.eth.sendTransaction
        sendTransaction(tx, function (err, resp) {
          if (err) {
            return callback(err, resp)
          }

          tryTillResponse(self.web3, resp, callback)
        })
      })
    }
  } else {
    try {
      var account = self.vmaccounts[from]
      if (!account) {
        return cb('Invalid account selected')
      }
      tx = new EthJSTX({
        nonce: new BN(account.nonce++),
        gasPrice: new BN(1),
        gasLimit: new BN(gasLimit, 10),
        to: to,
        value: new BN(value, 10),
        data: new Buffer(data.slice(2), 'hex')
      })
      tx.sign(account.privateKey)

      const coinbases = [ '0x0e9281e9c6a0808672eaba6bd1220e144c9bb07a', '0x8945a1288dc78a6d8952a92c77aee6730b414778', '0x94d76e24f818426ae84aa404140e8d5f60e10e7e' ]
      const difficulties = [ new BN('69762765929000', 10), new BN('70762765929000', 10), new BN('71762765929000', 10) ]
      var block = new EthJSBlock({
        header: {
          timestamp: new Date().getTime() / 1000 | 0,
          number: self.blockNumber,
          coinbase: coinbases[self.blockNumber % coinbases.length],
          difficulty: difficulties[self.blockNumber % difficulties.length],
          gasLimit: new BN(gasLimit, 10).imuln(2)
        },
        transactions: [],
        uncleHeaders: []
      })
      if (!args.useCall) {
        ++self.blockNumber
      } else {
        self.vm.stateManager.checkpoint()
      }

      self.vm.runTx({block: block, tx: tx, skipBalance: true, skipNonce: true}, function (err, result) {
        if (args.useCall) {
          self.vm.stateManager.revert(function () {})
        }
        callback(err, {
          result: result,
          transactionHash: ethJSUtil.bufferToHex(new Buffer(tx.hash()))
        })
      })
    } catch (e) {
      callback(e, null)
    }
  }
}

function tryTillResponse (web3, txhash, done) {
  web3.eth.getTransactionReceipt(txhash, function (err, result) {
    if (!err && !result) {
      // Try again with a bit of delay
      setTimeout(function () { tryTillResponse(web3, txhash, done) }, 500)
    } else {
      done(err, {
        result: result,
        transactionHash: result.transactionHash
      })
    }
  })
}

function run (self, tx, stamp, callback) {
  self.pendingTxs[stamp] = tx
  self.execute(tx, (error, result) => {
    delete self.pendingTxs[stamp]
    callback(error, result)
  })
}

module.exports = TxRunner
