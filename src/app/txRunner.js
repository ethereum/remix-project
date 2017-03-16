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
  this.running = false
  this.pendingTxs = []
  this.vmaccounts = vmaccounts
}

TxRunner.prototype.rawRun = function (args, cb) {
  this.pendingTxs.push({tx: args, cb: cb})
  this.execute()
}

TxRunner.prototype.execute = function () {
  var self = this
  if (this.running || this.pendingTxs.length === 0) {
    return
  }
  var args = this.pendingTxs[0].tx
  var cb = this.pendingTxs[0].cb
  this.pendingTxs.shift()
  var callback = function (error, result) {
    cb(error, result)
    self.running = false
    self.execute()
  }

  this.running = true
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
        self.web3.eth.getBlock('latest', function (err, block) {
          if (err) {
            return callback(err)
          } else {
            // NOTE: estimateGas very likely will return a large limit if execution of the code failed
            //       we want to be able to run the code in order to debug and find the cause for the failure
            var blockGasLimit = Math.floor(block.gasLimit - block.gasLimit / 1024)
            // tx.gas = blockGasLimit < gasEstimation ? blockGasLimit : gasEstimation
            tx.gas = blockGasLimit // that's temporary, uncomment when the following is fixed https://github.com/ethereum/go-ethereum/issues/3653

            /* same as above
            if (tx.gas > gasLimit) {
              return callback('Gas required exceeds limit: ' + tx.gas)
            }
            */

            var sendTransaction = self.personalMode ? self.web3.personal.sendTransaction : self.web3.eth.sendTransaction
            sendTransaction(tx, function (err, resp) {
              if (err) {
                return callback(err, resp)
              }

              tryTillResponse(self.web3, resp, callback)
            })
          }
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

module.exports = TxRunner
