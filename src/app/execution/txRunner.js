'use strict'
var EthJSTX = require('ethereumjs-tx')
var EthJSBlock = require('ethereumjs-block')
var ethJSUtil = require('ethereumjs-util')
var BN = ethJSUtil.BN
var executionContext = require('../../execution-context')
var modalDialog = require('../ui/modaldialog')
var yo = require('yo-yo')
var typeConversion = require('../../lib/typeConversion')
var csjs = require('csjs-inject')
var remixLib = require('remix-lib')
var styleGuide = remixLib.ui.styleGuide
var styles = styleGuide()
var modal = require('../ui/modal-dialog-custom')

var css = csjs`
  .txInfoBox {
    ${styles.rightPanel.compileTab.box_CompileContainer};  // add askToConfirmTXContainer to Remix and then replace this styling
  }
  .wrapword {
    white-space: pre-wrap;       /* Since CSS 2.1 */
    white-space: -moz-pre-wrap;  /* Mozilla, since 1999 */
    white-space: -pre-wrap;      /* Opera 4-6 */
    white-space: -o-pre-wrap;    /* Opera 7 */
    word-wrap: break-word;       /* Internet Explorer 5.5+ */
  }
`

function TxRunner (vmaccounts, api) {
  this._api = api
  this.blockNumber = 0
  this.runAsync = true
  if (executionContext.isVM()) {
    this.blockNumber = 1150000 // The VM is running in Homestead mode, which started at this block.
    this.runAsync = false // We have to run like this cause the VM Event Manager does not support running multiple txs at the same time.
  }
  this.pendingTxs = {}
  this.vmaccounts = vmaccounts
  this.queusTxs = []
}

TxRunner.prototype.rawRun = function (args, cb) {
  run(this, args, Date.now(), cb)
}

function executeTx (tx, gasPrice, api, callback) {
  if (gasPrice) tx.gasPrice = executionContext.web3().toHex(gasPrice)

  if (api.personalMode()) {
    modal.promptPassphrase(null, 'Personal mode is enabled. Please provide passphrase of account ' + tx.from, '', (value) => {
      sendTransaction(executionContext.web3().personal.sendTransaction, tx, value, callback)
    }, () => {
      return callback('Canceled by user.')
    })
  } else {
    sendTransaction(executionContext.web3().eth.sendTransaction, tx, null, callback)
  }
}

TxRunner.prototype.execute = function (args, callback) {
  var self = this

  var data = args.data
  if (data.slice(0, 2) !== '0x') {
    data = '0x' + data
  }

  if (!executionContext.isVM()) {
    self.runInNode(args.from, args.to, data, args.value, args.gasLimit, args.useCall, callback)
  } else {
    self.runInVm(args.from, args.to, data, args.value, args.gasLimit, args.useCall, callback)
  }
}

TxRunner.prototype.runInVm = function (from, to, data, value, gasLimit, useCall, callback) {
  const self = this
  try {
    var account = self.vmaccounts[from]
    if (!account) {
      return callback('Invalid account selected')
    }
    var tx = new EthJSTX({
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
    if (!useCall) {
      ++self.blockNumber
    } else {
      executionContext.vm().stateManager.checkpoint()
    }

    executionContext.vm().runTx({block: block, tx: tx, skipBalance: true, skipNonce: true}, function (err, result) {
      if (useCall) {
        executionContext.vm().stateManager.revert(function () {})
      }
      err = err ? err.message : err
      result.status = '0x' + result.vm.exception.toString(16)
      callback(err, {
        result: result,
        transactionHash: ethJSUtil.bufferToHex(new Buffer(tx.hash()))
      })
    })
  } catch (e) {
    callback(e, null)
  }
}

TxRunner.prototype.runInNode = function (from, to, data, value, gasLimit, useCall, callback) {
  const self = this
  var tx = {
    from: from,
    to: to,
    data: data,
    value: value
  }

  if (useCall) {
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

      var warnEstimation = " An important gas estimation might also be the sign of a problem in the contract code. Please check loops and be sure you did not sent value to a non payable function (that's also the reason of strong gas estimation)."
      if (gasEstimation > gasLimit) {
        return callback('Gas required exceeds limit: ' + gasLimit + '. ' + warnEstimation)
      }
      if (gasEstimation > blockGasLimit) {
        return callback('Gas required exceeds block gas limit: ' + gasLimit + '. ' + warnEstimation)
      }

      tx.gas = gasEstimation

      if (!self._api.config.getUnpersistedProperty('doNotShowTransactionConfirmationAgain')) {
        self._api.detectNetwork((err, network) => {
          if (err) {
            console.log(err)
          } else {
            if (network.name === 'Main') {
              var content = confirmDialog(tx, gasEstimation, self)
              modalDialog('Confirm transaction', content,
                { label: 'Confirm',
                  fn: () => {
                    self._api.config.setUnpersistedProperty('doNotShowTransactionConfirmationAgain', content.querySelector('input#confirmsetting').checked)
                    if (!content.gasPriceStatus) {
                      callback('Given gas grice is not correct')
                    } else {
                      var gasPrice = executionContext.web3().toWei(content.querySelector('#gasprice').value, 'gwei')
                      executeTx(tx, gasPrice, self._api, callback)
                    }
                  }}, {
                    label: 'Cancel',
                    fn: () => {
                      return callback('Transaction canceled by user.')
                    }
                  })
            } else {
              executeTx(tx, null, self._api, callback)
            }
          }
        })
      } else {
        executeTx(tx, null, self._api, callback)
      }
    })
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

function sendTransaction (sendTx, tx, pass, callback) {
  var cb = function (err, resp) {
    if (err) {
      return callback(err, resp)
    }
    tryTillResponse(resp, callback)
  }
  var args = pass !== null ? [tx, pass, cb] : [tx, cb]
  try {
    sendTx.apply({}, args)
  } catch (e) {
    return callback(`Send transaction failed: ${e.message} . if you use an injected provider, please check it is properly unlocked. `)
  }
}

function run (self, tx, stamp, callback) {
  if (!self.runAsync && Object.keys(self.pendingTxs).length) {
    self.queusTxs.push({ tx, stamp, callback })
  } else {
    self.pendingTxs[stamp] = tx
    self.execute(tx, (error, result) => {
      delete self.pendingTxs[stamp]
      callback(error, result)
      if (self.queusTxs.length) {
        var next = self.queusTxs.pop()
        run(self, next.tx, next.stamp, next.callback)
      }
    })
  }
}

function confirmDialog (tx, gasEstimation, self) {
  var amount = executionContext.web3().fromWei(typeConversion.toInt(tx.value), 'ether')
  var input = yo`<input id='confirmsetting' type="checkbox">`
  var el = yo`
  <div>
    <div>You are creating a transaction on the main network. Click confirm if you are sure to continue.</div>
    <div class=${css.txInfoBox}>
      <div>From: ${tx.from}</div>
      <div>To: ${tx.to ? tx.to : '(Contract Creation)'}</div>
      <div>Amount: ${amount} Ether</div>
      <div>Gas estimation: ${gasEstimation}</div>
      <div>Gas limit: ${tx.gas}</div>
      <div>Gas price: <input id='gasprice' oninput=${gasPriceChanged} /> Gwei <span> (visit <a target='_blank' href='https://ethgasstation.info'>ethgasstation.info</a> to get more info about gas price)</span></div>
      <div>Max transaction fee:<span id='txfee'></span></div>
      <div>Data:</div>
      <pre class=${css.wrapword}>${tx.data}</pre>
    </div>
    <div class=${css.checkbox}>
      ${input}
      <i class="fa fa-exclamation-triangle" aria-hidden="true"></i> Do not ask for confirmation again. (the setting will not be persisted for the next page reload)
    </div>
  </div>
  `

  var warnMessage = ' Please fix this issue before sending any transaction. '
  function gasPriceChanged () {
    try {
      var gasPrice = el.querySelector('#gasprice').value
      var fee = executionContext.web3().toBigNumber(tx.gas).mul(executionContext.web3().toBigNumber(executionContext.web3().toWei(gasPrice.toString(10), 'gwei')))
      el.querySelector('#txfee').innerHTML = ' ' + executionContext.web3().fromWei(fee.toString(10), 'ether') + ' Ether'
      el.gasPriceStatus = true
    } catch (e) {
      el.querySelector('#txfee').innerHTML = warnMessage + e.message
      el.gasPriceStatus = false
    }
  }

  executionContext.web3().eth.getGasPrice((error, gasPrice) => {
    if (error) {
      el.querySelector('#txfee').innerHTML = 'Unable to retrieve the current network gas price.' + warnMessage + error
    } else {
      try {
        el.querySelector('#gasprice').value = executionContext.web3().fromWei(gasPrice.toString(10), 'gwei')
        gasPriceChanged()
      } catch (e) {
        el.querySelector('#txfee').innerHTML = warnMessage + e.message
        el.gasPriceStatus = false
      }
    }
  })
  return el
}

module.exports = TxRunner
