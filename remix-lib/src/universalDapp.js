var async = require('async')
var ethJSUtil = require('ethereumjs-util')
var BN = ethJSUtil.BN
var crypto = require('crypto')

var TxRunner = require('./execution/txRunner')
var txHelper = require('./execution/txHelper')
var EventManager = require('./eventManager')
var executionContext = require('./execution/execution-context')

function UniversalDApp (registry) {
  this.event = new EventManager()
  var self = this
  self._deps = {
    config: registry.get('config').api
  }
  self._txRunnerAPI = {
    config: self._deps.config,
    detectNetwork: (cb) => {
      executionContext.detectNetwork(cb)
    },
    personalMode: () => {
      return self._deps.config.get('settings/personal-mode')
    }
  }
  self.txRunner = new TxRunner({}, self._txRunnerAPI)
  self.accounts = {}
  self.resetEnvironment()
  executionContext.event.register('contextChanged', this.resetEnvironment.bind(this))
}

UniversalDApp.prototype.resetEnvironment = function () {
  this.accounts = {}
  if (executionContext.isVM()) {
    this._addAccount('3cd7232cd6f3fc66a57a6bedc1a8ed6c228fff0a327e169c2bcc5e869ed49511', '0x56BC75E2D63100000')
    this._addAccount('2ac6c190b09897cd8987869cc7b918cfea07ee82038d492abce033c75c1b1d0c', '0x56BC75E2D63100000')
    this._addAccount('dae9801649ba2d95a21e688b56f77905e5667c44ce868ec83f82e838712a2c7a', '0x56BC75E2D63100000')
    this._addAccount('d74aa6d18aa79a05f3473dd030a97d3305737cbc8337d940344345c1f6b72eea', '0x56BC75E2D63100000')
    this._addAccount('71975fbf7fe448e004ac7ae54cad0a383c3906055a65468714156a07385e96ce', '0x56BC75E2D63100000')
  }
  // TODO: most params here can be refactored away in txRunner
  this.txRunner = new TxRunner(this.accounts, {
    // TODO: only used to check value of doNotShowTransactionConfirmationAgain property
    config: this.config,
    // TODO: to refactor, TxRunner already has access to executionContext
    detectNetwork: (cb) => {
      executionContext.detectNetwork(cb)
    },
    personalMode: () => {
      return this._deps.config.get('settings/personal-mode')
    }
  })
  this.txRunner.event.register('transactionBroadcasted', (txhash) => {
    executionContext.detectNetwork((error, network) => {
      if (error || !network) return
      this.event.trigger('transactionBroadcasted', [txhash, network.name])
    })
  })
}

UniversalDApp.prototype.resetAPI = function (transactionContextAPI) {
  this.transactionContextAPI = transactionContextAPI
}

UniversalDApp.prototype.createVMAccount = function (privateKey, balance, cb) {
  this._addAccount(privateKey, balance)
  privateKey = Buffer.from(privateKey, 'hex')
  cb(null, '0x' + ethJSUtil.privateToAddress(privateKey).toString('hex'))
}

UniversalDApp.prototype.newAccount = function (password, passwordPromptCb, cb) {
  if (!executionContext.isVM()) {
    if (!this._deps.config.get('settings/personal-mode')) {
      return cb('Not running in personal mode')
    }
    passwordPromptCb((passphrase) => {
      executionContext.web3().personal.newAccount(passphrase, cb)
    })
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
    privateKey = Buffer.from(privateKey, 'hex')
    var address = ethJSUtil.privateToAddress(privateKey)

    // FIXME: we don't care about the callback, but we should still make this proper
    let stateManager = executionContext.vm().stateManager
    stateManager.getAccount(address, (error, account) => {
      if (error) return console.log(error)
      account.balance = balance || '0xf00000000000000001'
      stateManager.putAccount(address, account, function cb (error) {
        if (error) console.log(error)
      })
    })
    self.accounts['0x' + address.toString('hex')] = { privateKey: privateKey, nonce: 0 }
  }
}

UniversalDApp.prototype.getAccounts = function (cb) {
  var self = this

  if (!executionContext.isVM()) {
    // Weirdness of web3: listAccounts() is sync, `getListAccounts()` is async
    // See: https://github.com/ethereum/web3.js/issues/442
    if (this._deps.config.get('settings/personal-mode')) {
      return executionContext.web3().personal.getListAccounts(cb)
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

    executionContext.vm().stateManager.getAccount(Buffer.from(address, 'hex'), function (err, res) {
      if (err) {
        cb('Account not found')
      } else {
        cb(null, new BN(res.balance).toString(10))
      }
    })
  }
}

UniversalDApp.prototype.getBalanceInEther = function (address, callback) {
  var self = this
  self.getBalance(address, (error, balance) => {
    if (error) {
      callback(error)
    } else {
      callback(null, executionContext.web3().fromWei(balance, 'ether'))
    }
  })
}

UniversalDApp.prototype.pendingTransactionsCount = function () {
  return Object.keys(this.txRunner.pendingTxs).length
}

/**
  * deploy the given contract
  *
  * @param {String} data    - data to send with the transaction ( return of txFormat.buildData(...) ).
  * @param {Function} callback    - callback.
  */
UniversalDApp.prototype.createContract = function (data, confirmationCb, continueCb, promptCb, callback) {
  this.runTx({data: data, useCall: false}, confirmationCb, continueCb, promptCb, (error, txResult) => {
    // see universaldapp.js line 660 => 700 to check possible values of txResult (error case)
    callback(error, txResult)
  })
}

/**
  * call the current given contract
  *
  * @param {String} to    - address of the contract to call.
  * @param {String} data    - data to send with the transaction ( return of txFormat.buildData(...) ).
  * @param {Object} funAbi    - abi definition of the function to call.
  * @param {Function} callback    - callback.
  */
UniversalDApp.prototype.callFunction = function (to, data, funAbi, confirmationCb, continueCb, promptCb, callback) {
  this.runTx({to: to, data: data, useCall: funAbi.constant}, confirmationCb, continueCb, promptCb, (error, txResult) => {
    // see universaldapp.js line 660 => 700 to check possible values of txResult (error case)
    callback(error, txResult)
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

/**
 * This function send a tx without alerting the user (if mainnet or if gas estimation too high).
 * SHOULD BE TAKEN CAREFULLY!
 *
 * @param {Object} tx    - transaction.
 * @param {Function} callback    - callback.
 */
UniversalDApp.prototype.silentRunTx = function (tx, cb) {
  if (!executionContext.isVM()) return cb('Cannot silently send transaction through a web3 provider')
  this.txRunner.rawRun(
  tx,
  (network, tx, gasEstimation, continueTxExecution, cancelCb) => { continueTxExecution() },
  (error, continueTxExecution, cancelCb) => { if (error) { cb(error) } else { continueTxExecution() } },
  (okCb, cancelCb) => { okCb() },
  cb)
}

UniversalDApp.prototype.runTx = function (args, confirmationCb, continueCb, promptCb, cb) {
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
      var tx = { to: args.to, data: args.data.dataHex, useCall: args.useCall, from: fromAddress, value: value, gasLimit: gasLimit, timestamp: args.data.timestamp }
      var payLoad = { funAbi: args.data.funAbi, funArgs: args.data.funArgs, contractBytecode: args.data.contractBytecode, contractName: args.data.contractName, contractABI: args.data.contractABI, linkReferences: args.data.linkReferences }
      var timestamp = Date.now()
      if (tx.timestamp) {
        timestamp = tx.timestamp
      }

      self.event.trigger('initiatingTransaction', [timestamp, tx, payLoad])
      self.txRunner.rawRun(tx, confirmationCb, continueCb, promptCb,
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
