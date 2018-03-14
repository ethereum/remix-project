/* global */
'use strict'

var yo = require('yo-yo')
var async = require('async')
var ethJSUtil = require('ethereumjs-util')
var BN = ethJSUtil.BN
var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager
var crypto = require('crypto')
var txRunner = remixLib.execution.txRunner
var txExecution = remixLib.execution.txExecution
var txFormat = remixLib.execution.txFormat
var txHelper = remixLib.execution.txHelper
var executionContext = require('./execution-context')
var modalCustom = require('./app/ui/modal-dialog-custom')
var uiUtil = require('./app/ui/util')

var modalDialog = require('./app/ui/modaldialog')
var typeConversion = remixLib.execution.typeConversion
var confirmDialog = require('./app/execution/confirmDialog')

/*
  trigger debugRequested
*/
function UniversalDApp (opts = {}) {
  this.event = new EventManager()
  var self = this

  self._api = opts.api
  self.removable = opts.opt.removable
  self.removable_instances = opts.opt.removable_instances
  executionContext.event.register('contextChanged', this, function (context) {
    self.reset(self.contracts)
  })
  self.txRunner = new TxRunner({}, opts.api)
}

UniversalDApp.prototype.reset = function (contracts, transactionContextAPI) {
  this.contracts = contracts
  if (transactionContextAPI) {
    this.transactionContextAPI = transactionContextAPI
  }
  this.accounts = {}
  if (executionContext.isVM()) {
    this._addAccount('3cd7232cd6f3fc66a57a6bedc1a8ed6c228fff0a327e169c2bcc5e869ed49511', '0x56BC75E2D63100000')
    this._addAccount('2ac6c190b09897cd8987869cc7b918cfea07ee82038d492abce033c75c1b1d0c', '0x56BC75E2D63100000')
    this._addAccount('dae9801649ba2d95a21e688b56f77905e5667c44ce868ec83f82e838712a2c7a', '0x56BC75E2D63100000')
    this._addAccount('d74aa6d18aa79a05f3473dd030a97d3305737cbc8337d940344345c1f6b72eea', '0x56BC75E2D63100000')
    this._addAccount('71975fbf7fe448e004ac7ae54cad0a383c3906055a65468714156a07385e96ce', '0x56BC75E2D63100000')
    executionContext.vm().stateManager.cache.flush(function () {})
  }
  this.txRunner = new TxRunner(this.accounts, this._api)
}

UniversalDApp.prototype.newAccount = function (password, cb) {
  if (!executionContext.isVM()) {
    if (!this._api.personalMode()) {
      return cb('Not running in personal mode')
    }
    modalCustom.promptPassphraseCreation((error, passphrase) => {
      if (error) {
        modalCustom.alert(error)
      } else {
        executionContext.web3().personal.newAccount(passphrase, cb)
      }
    }, () => {})
  } else {
    var privateKey
    do {
      privateKey = crypto.randomBytes(32)
    } while (!ethJSUtil.isValidPrivate(privateKey))
    this._addAccount(privateKey, '0x56BC75E2D63100000')
    cb(null, '0x' + ethJSUtil.privateToAddress(privateKey).toString('hex'))
  }
}

UniversalDApp.prototype._addAccount = function (privateKey, balance) {
  var self = this

  if (!executionContext.isVM()) {
    throw new Error('_addAccount() cannot be called in non-VM mode')
  }

  if (self.accounts) {
    privateKey = new Buffer(privateKey, 'hex')
    var address = ethJSUtil.privateToAddress(privateKey)

    // FIXME: we don't care about the callback, but we should still make this proper
    executionContext.vm().stateManager.putAccountBalance(address, balance || '0xf00000000000000001', function cb () {})
    self.accounts['0x' + address.toString('hex')] = { privateKey: privateKey, nonce: 0 }
  }
}

UniversalDApp.prototype.getAccounts = function (cb) {
  var self = this

  if (!executionContext.isVM()) {
    // Weirdness of web3: listAccounts() is sync, `getListAccounts()` is async
    // See: https://github.com/ethereum/web3.js/issues/442
    if (this._api.personalMode()) {
      executionContext.web3().personal.getListAccounts(cb)
    } else {
      executionContext.web3().eth.getAccounts(cb)
    }
  } else {
    if (!self.accounts) {
      return cb('No accounts?')
    }

    cb(null, Object.keys(self.accounts))
  }
}

UniversalDApp.prototype.getBalance = function (address, cb) {
  var self = this

  address = ethJSUtil.stripHexPrefix(address)

  if (!executionContext.isVM()) {
    executionContext.web3().eth.getBalance(address, function (err, res) {
      if (err) {
        cb(err)
      } else {
        cb(null, res.toString(10))
      }
    })
  } else {
    if (!self.accounts) {
      return cb('No accounts?')
    }

    executionContext.vm().stateManager.getAccountBalance(new Buffer(address, 'hex'), function (err, res) {
      if (err) {
        cb('Account not found')
      } else {
        cb(null, new BN(res).toString(10))
      }
    })
  }
}

UniversalDApp.prototype.pendingTransactions = function () {
  return this.txRunner.pendingTxs
}

UniversalDApp.prototype.call = function (isUserAction, args, value, lookupOnly, outputCb) {
  const self = this
  var logMsg
  if (isUserAction) {
    if (!args.funABI.constant) {
      logMsg = `transact to ${args.contractName}.${(args.funABI.name) ? args.funABI.name : '(fallback)'}`
    } else {
      logMsg = `call to ${args.contractName}.${(args.funABI.name) ? args.funABI.name : '(fallback)'}`
    }
  }
  txFormat.buildData(args.contractName, args.contractAbi, self.contracts, false, args.funABI, value, self, (error, data) => {
    if (!error) {
      if (isUserAction) {
        if (!args.funABI.constant) {
          self._api.logMessage(`${logMsg} pending ... `)
        } else {
          self._api.logMessage(`${logMsg}`)
        }
      }
      txExecution.callFunction(args.address, data, args.funABI, self, (error, txResult) => {
        if (!error) {
          var isVM = executionContext.isVM()
          if (isVM) {
            var vmError = txExecution.checkVMError(txResult)
            if (vmError.error) {
              self._api.logMessage(`${logMsg} errored: ${vmError.message} `)
              return
            }
          }
          if (lookupOnly) {
            var decoded = uiUtil.decodeResponseToTreeView(executionContext.isVM() ? txResult.result.vm.return : ethJSUtil.toBuffer(txResult.result), args.funABI)
            outputCb(decoded)
          }
        } else {
          self._api.logMessage(`${logMsg} errored: ${error} `)
        }
      })
    } else {
      self._api.logMessage(`${logMsg} errored: ${error} `)
    }
  }, (msg) => {
    self._api.logMessage(msg)
  })
}

UniversalDApp.prototype.context = function () {
  return (executionContext.isVM() ? 'memory' : 'blockchain')
}

UniversalDApp.prototype.getABI = function (contract) {
  return txHelper.sortAbiFunction(contract.abi)
}

UniversalDApp.prototype.getFallbackInterface = function (contractABI) {
  return txHelper.getFallbackInterface(contractABI)
}

UniversalDApp.prototype.getInputs = function (funABI) {
  if (!funABI.inputs) {
    return ''
  }
  return txHelper.inputParametersDeclarationToString(funABI.inputs)
}

UniversalDApp.prototype.runTx = function (args, cb) {
  const self = this
  async.waterfall([
    function getGasLimit (next) {
      if (self.transactionContextAPI.getGasLimit) {
        return self.transactionContextAPI.getGasLimit(next)
      }
      next(null, 3000000)
    },
    function queryValue (gasLimit, next) {
      if (args.value) {
        return next(null, args.value, gasLimit)
      }
      if (args.useCall || !self.transactionContextAPI.getValue) {
        return next(null, 0, gasLimit)
      }
      self.transactionContextAPI.getValue(function (err, value) {
        next(err, value, gasLimit)
      })
    },
    function getAccount (value, gasLimit, next) {
      if (args.from) {
        return next(null, args.from, value, gasLimit)
      }
      if (self.transactionContextAPI.getAddress) {
        return self.transactionContextAPI.getAddress(function (err, address) {
          next(err, address, value, gasLimit)
        })
      }
      self.getAccounts(function (err, accounts) {
        let address = accounts[0]

        if (err) return next(err)
        if (!address) return next('No accounts available')
        if (executionContext.isVM() && !self.accounts[address]) {
          return next('Invalid account selected')
        }
        next(null, address, value, gasLimit)
      })
    },
    function runTransaction (fromAddress, value, gasLimit, next) {
      var tx = { to: args.to, data: args.data.dataHex, useCall: args.useCall, from: fromAddress, value: value, gasLimit: gasLimit }
      var payLoad = { funAbi: args.data.funAbi, funArgs: args.data.funArgs, contractBytecode: args.data.contractBytecode, contractName: args.data.contractName }
      var timestamp = Date.now()

      self.event.trigger('initiatingTransaction', [timestamp, tx, payLoad])
      self.txRunner.rawRun(tx,

        (network, tx, gasEstimation, continueTxExecution, cancelCb) => {
          if (network.name !== 'Main') {
            return continueTxExecution(null)
          }
          var amount = executionContext.web3().fromWei(typeConversion.toInt(tx.value), 'ether')
          var content = confirmDialog(tx, amount, gasEstimation, self,
            (gasPrice, cb) => {
              let txFeeText, priceStatus
              // TODO: this try catch feels like an anti pattern, can/should be
              // removed, but for now keeping the original logic
              try {
                var fee = executionContext.web3().toBigNumber(tx.gas).mul(executionContext.web3().toBigNumber(executionContext.web3().toWei(gasPrice.toString(10), 'gwei')))
                txFeeText = ' ' + executionContext.web3().fromWei(fee.toString(10), 'ether') + ' Ether'
                priceStatus = true
              } catch (e) {
                txFeeText = ' Please fix this issue before sending any transaction. ' + e.message
                priceStatus = false
              }
              cb(txFeeText, priceStatus)
            },
            (cb) => {
              executionContext.web3().eth.getGasPrice((error, gasPrice) => {
                var warnMessage = ' Please fix this issue before sending any transaction. '
                if (error) {
                  return cb('Unable to retrieve the current network gas price.' + warnMessage + error)
                }
                try {
                  var gasPriceValue = executionContext.web3().fromWei(gasPrice.toString(10), 'gwei')
                  cb(null, gasPriceValue)
                } catch (e) {
                  cb(warnMessage + e.message, null, false)
                }
              })
            }
          )
          modalDialog('Confirm transaction', content,
            { label: 'Confirm',
              fn: () => {
                self._api.config.setUnpersistedProperty('doNotShowTransactionConfirmationAgain', content.querySelector('input#confirmsetting').checked)
                // TODO: check if this is check is still valid given the refactor
                if (!content.gasPriceStatus) {
                  cancelCb('Given gas price is not correct')
                } else {
                  var gasPrice = executionContext.web3().toWei(content.querySelector('#gasprice').value, 'gwei')
                  continueTxExecution(gasPrice)
                }
              }}, {
                label: 'Cancel',
                fn: () => {
                  return cancelCb('Transaction canceled by user.')
                }
              })
        },
        (error, continueTxExecution, cancelCb) => {
          if (error) {
            var msg = typeof error !== 'string' ? error.message : error
            modalDialog('Gas estimation failed', yo`<div>Gas estimation errored with the following message (see below).
            The transaction execution will likely fail. Do you want to force sending? <br>
            ${msg}
            </div>`,
              {
                label: 'Send Transaction',
                fn: () => {
                  continueTxExecution()
                }}, {
                  label: 'Cancel Transaction',
                  fn: () => {
                    cancelCb()
                  }
                })
          } else {
            continueTxExecution()
          }
        },
        function (okCb, cancelCb) {
          modalCustom.promptPassphrase(null, 'Personal mode is enabled. Please provide passphrase of account ' + tx.from, '', okCb, cancelCb)
        },
        function (error, result) {
          let eventName = (tx.useCall ? 'callExecuted' : 'transactionExecuted')
          self.event.trigger(eventName, [error, tx.from, tx.to, tx.data, tx.useCall, result, timestamp, payLoad])

          if (error && (typeof (error) !== 'string')) {
            if (error.message) error = error.message
            else {
              try { error = 'error: ' + JSON.stringify(error) } catch (e) {}
            }
          }
          next(error, result)
        }
      )
    }
  ], cb)
}

module.exports = UniversalDApp
