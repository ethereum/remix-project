'use strict'
var EthJSTX = require('ethereumjs-tx')
var EthJSBlock = require('ethereumjs-block')
var ethJSUtil = require('ethereumjs-util')
var BN = ethJSUtil.BN
var executionContext = require('../../execution-context')

function TxRunner (vmaccounts, opts) {
  this.queueTxs = opts.queueTxs
  this.personalMode = opts.personalMode
  this.blockNumber = 0
  if (executionContext.isVM()) {
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
  if (!executionContext.isVM()) {
    tx = {
      from: from,
      to: to,
      data: data,
      value: value
    }
    if (args.useCall) {
      tx.gas = gasLimit
      executionContext.web3().eth.call(tx, function (error, result) {
        callback(error, {
          result: result,
          transactionHash: result.transactionHash
        })
      })
    } else {
      executionContext.web3().eth.estimateGas(tx, function (err, gasEstimation) {
        if (err) {
          return callback(err, gasEstimation)
        }
        var blockGasLimit = executionContext.currentblockGasLimit()
        // NOTE: estimateGas very likely will return a large limit if execution of the code failed
        //       we want to be able to run the code in order to debug and find the cause for the failure

        var warnEstimation = ' An important gas estimation might also be the sign of a problem in the contract code. Please check loops and be sure you did not sent value to a non payable function (that\'s also the reason of strong gas estimation).'
        if (gasEstimation > gasLimit) {
          return callback('Gas required exceeds limit: ' + gasLimit + '. ' + warnEstimation)
        }
        if (gasEstimation > blockGasLimit) {
          return callback('Gas required exceeds block gas limit: ' + gasLimit + '. ' + warnEstimation)
        }

        tx.gas = gasEstimation
        var sendTransaction = self.personalMode ? executionContext.web3().personal.sendTransaction : executionContext.web3().eth.sendTransaction
        try {
          sendTransaction(tx, function (err, resp) {
            if (err) {
              return callback(err, resp)
            }

            tryTillResponse(resp, callback)
          })
        } catch (e) {
          return callback(`Send transaction failed: ${e.message} . if you use an injected provider, please check it is properly unlocked. `)
        }
      })
    }
  } else {
    try {
      var account = self.vmaccounts[from]
      if (!account) {
        return callback('Invalid account selected')
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
        executionContext.vm().stateManager.checkpoint()
      }

      executionContext.vm().runTx({block: block, tx: tx, skipBalance: true, skipNonce: true}, function (err, result) {
        if (args.useCall) {
          executionContext.vm().stateManager.revert(function () {})
        }
        err = err ? err.message : err
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

function tryTillResponse (txhash, done) {
  executionContext.web3().eth.getTransactionReceipt(txhash, function (err, result) {
    if (!err && !result) {
      // Try again with a bit of delay
      setTimeout(function () { tryTillResponse(txhash, done) }, 500)
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
