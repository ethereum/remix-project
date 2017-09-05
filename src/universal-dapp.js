/* global */
'use strict'

var $ = require('jquery')
var ethJSUtil = require('ethereumjs-util')
var BN = ethJSUtil.BN
var EventManager = require('ethereum-remix').lib.EventManager
var crypto = require('crypto')
var async = require('async')
var TxRunner = require('./app/execution/txRunner')
var yo = require('yo-yo')
var txFormat = require('./app/execution/txFormat')
var txHelper = require('./app/execution/txHelper')
var txExecution = require('./app/execution/txExecution')
var helper = require('./lib/helper')
var modalDialogCustom = require('./app/ui/modal-dialog-custom')
var executionContext = require('./execution-context')

// copy to copyToClipboard
const copy = require('clipboard-copy')

// -------------- styling ----------------------
var csjs = require('csjs-inject')

var remix = require('ethereum-remix')
var styleGuide = remix.ui.styleGuide
var styles = styleGuide()

var css = csjs`
  .instanceTitleContainer {
    display: flex;
    align-items: center;
  }
  .title {
    ${styles.dropdown}
    width: 400px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    overflow: hidden;
    word-break: break-word;
    line-height: initial;
    background-color: ${styles.colors.white};
  }
  .titleText {
    margin-right: 1em;
    word-break: break-word;
    min-width: 230px;
  }
  .instance {
    ${styles.displayBox}
    margin-bottom: 2px;
    padding: 10px 15px 6px 15px;
  }
  .instance .title:before {
    content: "\\25BE";
    margin-right: 5%;
  }
  .instance.hidesub .title:before {
    content: "\\25B8";
    margin-right: 5%;
  }
  .instance.hidesub > * {
      display: none;
  }
  .instance.hidesub .title {
      display: flex;
  }
  .copy  {
    font-size: 13px;
    cursor: pointer;
    opacity: 0.8;
    margin-left: 3%;
    color: ${styles.colors.blue};
  }
  .copy:hover{
    color: ${styles.colors.grey};
  }
  .buttonsContainer {
    margin-top: 2%;
    display: flex;
  }
  .instanceButton {}
  .closeIcon {
    font-size: 10px;
    position: relative;
    top: -5px;
    right: -2px;
  }
  .udappClose {
    margin-left: 3%;
    align-self: center;
  }
`

/*
  trigger debugRequested
*/
function UniversalDApp (opts = {}) {
  this.event = new EventManager()
  var self = this

  self._api = opts.api
  self.removable = opts.opt.removable
  self.removable_instance = opts.opt.removable_instance
  self.el = yo`<div class="udapp"></div>`
  self.personalMode = opts.opt.personalMode || false
  self.contracts
  self.transactionContextAPI
  executionContext.event.register('contextChanged', this, function (context) {
    self.reset(self.contracts)
  })
  self.txRunner = new TxRunner({}, {
    queueTxs: true,
    personalMode: this.personalMode
  })
}

UniversalDApp.prototype.reset = function (contracts, transactionContextAPI) {
  this.el.innerHTML = ''
  this.contracts = contracts
  this.transactionContextAPI = transactionContextAPI
  this.accounts = {}
  if (executionContext.isVM()) {
    this._addAccount('3cd7232cd6f3fc66a57a6bedc1a8ed6c228fff0a327e169c2bcc5e869ed49511', '0x56BC75E2D63100000')
    this._addAccount('2ac6c190b09897cd8987869cc7b918cfea07ee82038d492abce033c75c1b1d0c', '0x56BC75E2D63100000')
    this._addAccount('dae9801649ba2d95a21e688b56f77905e5667c44ce868ec83f82e838712a2c7a', '0x56BC75E2D63100000')
    this._addAccount('d74aa6d18aa79a05f3473dd030a97d3305737cbc8337d940344345c1f6b72eea', '0x56BC75E2D63100000')
    this._addAccount('71975fbf7fe448e004ac7ae54cad0a383c3906055a65468714156a07385e96ce', '0x56BC75E2D63100000')
    executionContext.vm().stateManager.cache.flush(function () {})
  }
  this.txRunner = new TxRunner(this.accounts, {
    queueTxs: true,
    personalMode: this.personalMode
  })
}

UniversalDApp.prototype.newAccount = function (password, cb) {
  if (!executionContext.isVM()) {
    if (!this.personalMode) {
      return cb('Not running in personal mode')
    }
    executionContext.web3().personal.newAccount(password, cb)
  } else {
    var privateKey
    do {
      privateKey = crypto.randomBytes(32)
    } while (!ethJSUtil.isValidPrivate(privateKey))
    this._addAccount(privateKey)
    cb(null, '0x' + ethJSUtil.privateToAddress(privateKey))
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
    if (self.personalMode) {
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

// TODO this function was named before "appendChild".
// this will render an instance: contract name, contract address, and all the public functions
// basically this has to be called for the "atAddress" (line 393) and when a contract creation succeed
// this returns a DOM element
UniversalDApp.prototype.renderInstance = function (contract, address, contractName) {
  function remove () { $instance.remove() }
  var $instance = $(`<div class="instance ${css.instance}"/>`)
  var context = executionContext.isVM() ? 'memory' : 'blockchain'

  address = (address.slice(0, 2) === '0x' ? '' : '0x') + address.toString('hex')
  var shortAddress = helper.shortenAddress(address)
  var title = yo`<div class="${css.title}" onclick=${toggleClass}>
    <div class="${css.titleText}"> ${contractName} at ${shortAddress} (${context}) </div>
    <i class="fa fa-clipboard ${css.copy}" aria-hidden="true" onclick=${copyToClipboard} title='Copy to clipboard'></i>
  </div>`
  if (this.removable_instance) {
    var close = yo`<div class="${css.udappClose}" onclick=${remove}><i class="${css.closeIcon} fa fa-close" aria-hidden="true"></i></div>`
    title.appendChild(close)
  }

  function toggleClass () {
    $instance.toggleClass(`${css.hidesub}`)
  }

  function copyToClipboard (event) {
    event.stopPropagation()
    copy(address)
  }

  var abi = txHelper.sortAbiFunction(contract)

  $instance.get(0).appendChild(title)

  // Add the fallback function
  var fallback = txHelper.getFallbackInterface(abi)
  if (fallback) {
    $instance.append(this.getCallButton({
      funABI: fallback,
      address: address,
      contractAbi: abi
    }))
  }

  $.each(abi, (i, funABI) => {
    if (funABI.type !== 'function') {
      return
    }
    // @todo getData cannot be used with overloaded functions
    $instance.append(this.getCallButton({
      funABI: funABI,
      address: address,
      contractAbi: abi
    }))
  })

  return $instance.get(0)
}

// TODO this is used by renderInstance when a new instance is displayed.
// this returns a DOM element.
UniversalDApp.prototype.getCallButton = function (args) {
  var self = this
  // args.funABI, args.address [fun only]
  // args.contractName [constr only]
  var lookupOnly = args.funABI.constant

  var inputs = ''
  if (args.funABI.inputs) {
    inputs = txHelper.inputParametersDeclarationToString(args.funABI.inputs)
  }
  var inputField = $('<input/>').attr('placeholder', inputs).attr('title', inputs)
  var $outputOverride = $('<div class="value" />')

  var title
  if (args.funABI.name) {
    title = args.funABI.name
  } else {
    title = '(fallback)'
  }

  var button = $(`<button class="${css.instanceButton}"/>`)
    .addClass('call')
    .attr('title', title)
    .text(title)
    .click(() => {
      call()
    })

  function call () {
    txFormat.buildData(args.contractAbi, self.contracts, false, args.funABI, inputField.val(), self, (error, data) => {
      if (!error) {
        txExecution.callFunction(args.address, data, args.funABI, self, (error, txResult) => {
          if (!error) {
            self._api.logMessage('[WEB3] UDApp transaction added ...')
            var isVM = executionContext.isVM()
            if (isVM) {
              var vmError = txExecution.checkVMError(txResult)
              if (vmError.error) {
                modalDialogCustom.alert(vmError.message)
                return
              }
            }
            if (lookupOnly) {
              txFormat.decodeResponse(executionContext.isVM() ? txResult.result.vm.return : ethJSUtil.toBuffer(txResult.result), args.funABI, (error, decoded) => {
                $outputOverride.html(error ? 'error' + error : decoded)
              })
            }
          } else {
            modalDialogCustom.alert(error)
          }
        })
      } else {
        modalDialogCustom.alert(error)
      }
    })
  }
  // TODO the auto call to constant function has been removed. needs to readd it later.

  var $contractProperty = $(`<div class="contractProperty ${css.buttonsContainer}"></div>`)
  $contractProperty
    .append(button)
    .append((lookupOnly && !inputs.length) ? $outputOverride : inputField)

  if (lookupOnly) {
    $contractProperty.addClass('constant')
    button.attr('title', (title + ' - call'))
    call()
  }

  if (args.funABI.inputs && args.funABI.inputs.length > 0) {
    $contractProperty.addClass('hasArgs')
  }

  if (args.funABI.payable === true) {
    $contractProperty.addClass('payable')
    button.attr('title', (title + ' - transact (payable)'))
  }

  if (!lookupOnly && args.funABI.payable === false) {
    button.attr('title', (title + ' - transact (not payable)'))
  }

  return $contractProperty
}

UniversalDApp.prototype.pendingTransactions = function () {
  return this.txRunner.pendingTxs
}

UniversalDApp.prototype.runTx = function (args, cb) {
  var self = this
  var tx = {
    to: args.to,
    data: args.data,
    useCall: args.useCall
  }
  async.waterfall([
    // query gas limit
    function (callback) {
      tx.gasLimit = 3000000

      if (self.transactionContextAPI.getGasLimit) {
        self.transactionContextAPI.getGasLimit(function (err, ret) {
          if (err) {
            return callback(err)
          }

          tx.gasLimit = ret
          callback()
        })
      } else {
        callback()
      }
    },
    // query value
    function (callback) {
      tx.value = 0
      if (tx.useCall) return callback()
      if (self.transactionContextAPI.getValue) {
        self.transactionContextAPI.getValue(function (err, ret) {
          if (err) {
            return callback(err)
          }

          tx.value = ret
          callback()
        })
      } else {
        callback()
      }
    },
    // query address
    function (callback) {
      if (self.transactionContextAPI.getAddress) {
        self.transactionContextAPI.getAddress(function (err, ret) {
          if (err) {
            return callback(err)
          }

          tx.from = ret

          callback()
        })
      } else {
        self.getAccounts(function (err, ret) {
          if (err) {
            return callback(err)
          }

          if (ret.length === 0) {
            return callback('No accounts available')
          }

          if (executionContext.isVM() && !self.accounts[ret[0]]) {
            return callback('Invalid account selected')
          }

          tx.from = ret[0]

          callback()
        })
      }
    },
    // run transaction
    function (callback) {
      self.txRunner.rawRun(tx, function (error, result) {
        if (!args.useCall) {
          self.event.trigger('transactionExecuted', [error, args.to, args.data, false, result])
        }
        if (error) {
          if (typeof (error) !== 'string') {
            if (error.message) {
              error = error.message
            } else {
              try {
                error = 'error: ' + JSON.stringify(error)
              } catch (e) {}
            }
          }
        }
        callback(error, result)
      })
    }
  ], cb)
}

module.exports = UniversalDApp
