const remixLib = require('remix-lib')
const txFormat = remixLib.execution.txFormat
const txExecution = remixLib.execution.txExecution
const typeConversion = remixLib.execution.typeConversion
const TxRunner = remixLib.execution.txRunner
const Txlistener = remixLib.execution.txListener
const EventManager = remixLib.EventManager
const executionContext = remixLib.execution.executionContext
const ethJSUtil = require('ethereumjs-util')
const Personal = require('web3-eth-personal')
const Web3 = require('web3')

const async = require('async')
const { BN, privateToAddress, isValidPrivate, stripHexPrefix } = require('ethereumjs-util')
const crypto = require('crypto')
const { EventEmitter } = require('events')

const { resultToRemixTx } = require('./txResultHelper')

const VMProvider = require('./providers/vm.js')
const InjectedProvider = require('./providers/injected.js')
const NodeProvider = require('./providers/node.js')

class Blockchain {

  // NOTE: the config object will need to be refactored out in remix-lib
  constructor (config) {
    this.event = new EventManager()
    this.executionContext = executionContext

    this.events = new EventEmitter()
    this.config = config

    this.txRunner = new TxRunner({}, {
      config: config,
      detectNetwork: (cb) => {
        this.executionContext.detectNetwork(cb)
      },
      personalMode: () => {
        return this.executionContext.getProvider() === 'web3' ? this.config.get('settings/personal-mode') : false
      }
    }, this.executionContext)
    this.executionContext.event.register('contextChanged', this.resetEnvironment.bind(this))

    this.networkcallid = 0
    this.setupEvents()
    this.setupProviders()
  }

  setupEvents () {
    this.executionContext.event.register('contextChanged', (context, silent) => {
      this.event.trigger('contextChanged', [context, silent])
    })

    this.executionContext.event.register('addProvider', (network) => {
      this.event.trigger('addProvider', [network])
    })

    this.executionContext.event.register('removeProvider', (name) => {
      this.event.trigger('removeProvider', [name])
    })
  }

  setupProviders () {
    this.providers = {}
    this.providers.vm = new VMProvider(this.executionContext)
    this.providers.injected = new InjectedProvider(this.executionContext)
    this.providers.web3 = new NodeProvider(this.executionContext, this.config)
  }

  getCurrentProvider () {
    const provider = this.executionContext.getProvider()
    return this.providers[provider]
  }

  /** Return the list of accounts */
  // note: the dual promise/callback is kept for now as it was before
  getAccounts (cb) {
    return new Promise((resolve, reject) => {
      this.getCurrentProvider().getAccounts((error, accounts) => {
        if (cb) {
          return cb(error, accounts)
        }
        if (error) {
          reject(error)
        }
        resolve(accounts)
      })
    })
  }

  async deployContract (selectedContract, args, contractMetadata, compilerContracts, callbacks, confirmationCb) {
    const { continueCb, promptCb, statusCb, finalCb } = callbacks

    const constructor = selectedContract.getConstructorInterface()
    if (!contractMetadata || (contractMetadata && contractMetadata.autoDeployLib)) {
      return txFormat.buildData(selectedContract.name, selectedContract.object, compilerContracts, true, constructor, args, (error, data) => {
        if (error) return statusCb(`creation of ${selectedContract.name} errored: ` + error)

        statusCb(`creation of ${selectedContract.name} pending...`)
        this.createContract(selectedContract, data, continueCb, promptCb, confirmationCb, finalCb)
      }, statusCb, (data, runTxCallback) => {
        // called for libraries deployment
        this.runTx(data, confirmationCb, continueCb, promptCb, runTxCallback)
      })
    }
    if (Object.keys(selectedContract.bytecodeLinkReferences).length) statusCb(`linking ${JSON.stringify(selectedContract.bytecodeLinkReferences, null, '\t')} using ${JSON.stringify(contractMetadata.linkReferences, null, '\t')}`)
    txFormat.encodeConstructorCallAndLinkLibraries(selectedContract.object, args, constructor, contractMetadata.linkReferences, selectedContract.bytecodeLinkReferences, (error, data) => {
      if (error) return statusCb(`creation of ${selectedContract.name} errored: ` + error)

      statusCb(`creation of ${selectedContract.name} pending...`)
      this.createContract(selectedContract, data, continueCb, promptCb, confirmationCb, finalCb)
    })
  }

  createContract (selectedContract, data, continueCb, promptCb, confirmationCb, finalCb) {
    if (data) {
      data.contractName = selectedContract.name
      data.linkReferences = selectedContract.bytecodeLinkReferences
      data.contractABI = selectedContract.abi
    }

    this.runTx({ data: data, useCall: false }, confirmationCb, continueCb, promptCb,
      (error, txResult) => {
        if (error) {
          return finalCb(`creation of ${selectedContract.name} errored: ${error}`)
        }
        const isVM = this.executionContext.isVM()
        if (isVM) {
          const vmError = txExecution.checkVMError(txResult)
          if (vmError.error) {
            return finalCb(vmError.message)
          }
        }
        if (txResult.result.status && txResult.result.status === '0x0') {
          return finalCb(`creation of ${selectedContract.name} errored: transaction execution failed`)
        }
        const address = isVM ? txResult.result.createdAddress : txResult.result.contractAddress
        finalCb(null, selectedContract, address)
      }
    )
  }

  determineGasPrice (cb) {
    this.executionContext.web3().eth.getGasPrice((error, gasPrice) => {
      const warnMessage = ' Please fix this issue before sending any transaction. '
      if (error) {
        return cb('Unable to retrieve the current network gas price.' + warnMessage + error)
      }
      try {
        const gasPriceValue = this.fromWei(gasPrice, false, 'gwei')
        cb(null, gasPriceValue)
      } catch (e) {
        cb(warnMessage + e.message, null, false)
      }
    })
  }

  fromWei (value, doTypeConversion, unit) {
    if (doTypeConversion) {
      return Web3.utils.fromWei(typeConversion.toInt(value), unit || 'ether')
    }
    return Web3.utils.fromWei(value.toString(10), unit || 'ether')
  }

  toWei (value, unit) {
    return Web3.utils.toWei(value, unit || 'gwei')
  }

  calculateFee (gas, gasPrice, unit) {
    return Web3.utils.toBN(gas).mul(Web3.utils.toBN(Web3.utils.toWei(gasPrice.toString(10), unit || 'gwei')))
  }

  determineGasFees (tx) {
    const determineGasFeesCb = (gasPrice, cb) => {
      let txFeeText, priceStatus
      // TODO: this try catch feels like an anti pattern, can/should be
      // removed, but for now keeping the original logic
      try {
        const fee = this.calculateFee(tx.gas, gasPrice)
        txFeeText = ' ' + this.fromWei(fee, false, 'ether') + ' Ether'
        priceStatus = true
      } catch (e) {
        txFeeText = ' Please fix this issue before sending any transaction. ' + e.message
        priceStatus = false
      }
      cb(txFeeText, priceStatus)
    }

    return determineGasFeesCb
  }

  getAddressFromTransactionResult (txResult) {
    return this.executionContext.isVM() ? txResult.result.createdAddress : txResult.result.contractAddress
  }

  changeExecutionContext (context, confirmCb, infoCb, cb) {
    return this.executionContext.executionContextChange(context, null, confirmCb, infoCb, cb)
  }

  setProviderFromEndpoint (target, context, cb) {
    return this.executionContext.setProviderFromEndpoint(target, context, cb)
  }

  getProvider () {
    return this.executionContext.getProvider()
  }

  updateNetwork (cb) {
    this.networkcallid++
    ((callid) => {
      this.executionContext.detectNetwork((err, { id, name } = {}) => {
        if (this.networkcallid > callid) return
        this.networkcallid++
        if (err) {
          return cb(err)
        }
        cb(null, {id, name})
      })
    })(this.networkcallid)
  }

  detectNetwork (cb) {
    return this.executionContext.detectNetwork(cb)
  }

  isWeb3Provider () {
    const isVM = this.executionContext.isVM()
    const isInjected = this.executionContext.getProvider() === 'injected'
    return (!isVM && !isInjected)
  }

  isInjectedWeb3 () {
    return this.executionContext.getProvider() === 'injected'
  }

  signMessage (message, account, passphrase, cb) {
    const isVM = this.executionContext.isVM()
    const isInjected = this.executionContext.getProvider() === 'injected'

    if (isVM) {
      const personalMsg = ethJSUtil.hashPersonalMessage(Buffer.from(message))
      const privKey = this.providers.vm.accounts[account].privateKey
      try {
        const rsv = ethJSUtil.ecsign(personalMsg, privKey)
        const signedData = ethJSUtil.toRpcSig(rsv.v, rsv.r, rsv.s)
        cb(null, '0x' + personalMsg.toString('hex'), signedData)
      } catch (e) {
        cb(e.message)
      }
      return
    }
    if (isInjected) {
      const hashedMsg = Web3.utils.sha3(message)
      try {
        this.executionContext.web3().eth.sign(account, hashedMsg, (error, signedData) => {
          cb(error.message, hashedMsg, signedData)
        })
      } catch (e) {
        cb(e.message)
      }
      return
    }

    const hashedMsg = Web3.utils.sha3(message)
    try {
      const personal = new Personal(this.executionContext.web3().currentProvider)
      personal.sign(hashedMsg, account, passphrase, (error, signedData) => {
        cb(error.message, hashedMsg, signedData)
      })
    } catch (e) {
      cb(e.message)
    }
  }

  web3 () {
    return this.executionContext.web3()
  }

  getTxListener (opts) {
    opts.event = {
      udapp: this.event
    }
    const txlistener = new Txlistener(opts, this.executionContext)
    return txlistener
  }

  runOrCallContractMethod (contractName, contractAbi, funABI, value, address, callType, lookupOnly, logMsg, logCallback, outputCb, confirmationCb, continueCb, promptCb) {
    // contractsDetails is used to resolve libraries
    txFormat.buildData(contractName, contractAbi, {}, false, funABI, callType, (error, data) => {
      if (error) {
        return logCallback(`${logMsg} errored: ${error} `)
      }
      if (!lookupOnly) {
        logCallback(`${logMsg} pending ... `)
      } else {
        logCallback(`${logMsg}`)
      }
      if (funABI.type === 'fallback') data.dataHex = value
      this.callFunction(address, data, funABI, confirmationCb, continueCb, promptCb, (error, txResult) => {
        if (error) {
          return logCallback(`${logMsg} errored: ${error} `)
        }
        const isVM = this.executionContext.isVM()
        if (isVM) {
          const vmError = txExecution.checkVMError(txResult)
          if (vmError.error) {
            return logCallback(`${logMsg} errored: ${vmError.message} `)
          }
        }
        if (lookupOnly) {
          const returnValue = (this.executionContext.isVM() ? txResult.result.execResult.returnValue : ethJSUtil.toBuffer(txResult.result))
          outputCb(returnValue)
        }
      })
    },
    (msg) => {
      logCallback(msg)
    },
    (data, runTxCallback) => {
      // called for libraries deployment
      this.runTx(data, confirmationCb, runTxCallback)
    })
  }

  // NOTE: the config is only needed because exectuionContext.init does
  // if config.get('settings/always-use-vm'), we can simplify this later
  resetAndInit (config, transactionContextAPI) {
    this.transactionContextAPI = transactionContextAPI
    this.executionContext.init(config)
    this.executionContext.stopListenOnLastBlock()
    this.executionContext.listenOnLastBlock()
    this.resetEnvironment()
  }

  addNetwork (customNetwork) {
    this.executionContext.addProvider(customNetwork)
  }

  removeNetwork (name) {
    this.executionContext.removeProvider(name)
  }

  // TODO : event should be triggered by Udapp instead of TxListener
  /** Listen on New Transaction. (Cannot be done inside constructor because txlistener doesn't exist yet) */
  startListening (txlistener) {
    txlistener.event.register('newTransaction', (tx) => {
      this.events.emit('newTransaction', tx)
    })
  }

  resetEnvironment () {
    this.getCurrentProvider().resetEnvironment()
   // TODO: most params here can be refactored away in txRunner
    this.txRunner = new TxRunner(this.providers.vm.accounts, {
      // TODO: only used to check value of doNotShowTransactionConfirmationAgain property
      config: this.config,
      // TODO: to refactor, TxRunner already has access to executionContext
      detectNetwork: (cb) => {
        this.executionContext.detectNetwork(cb)
      },
      personalMode: () => {
        return this.executionContext.getProvider() === 'web3' ? this.config.get('settings/personal-mode') : false
      }
    }, this.executionContext)
    this.txRunner.event.register('transactionBroadcasted', (txhash) => {
      this.executionContext.detectNetwork((error, network) => {
        if (error || !network) return
        this.event.trigger('transactionBroadcasted', [txhash, network.name])
      })
    })
  }

  /**
   * Create a VM Account
   * @param {{privateKey: string, balance: string}} newAccount The new account to create
   */
  createVMAccount (newAccount) {
    const { privateKey, balance } = newAccount
    if (this.executionContext.getProvider() !== 'vm') {
      throw new Error('plugin API does not allow creating a new account through web3 connection. Only vm mode is allowed')
    }
    this.providers.vm._addAccount(privateKey, balance)
    const privKey = Buffer.from(privateKey, 'hex')
    return '0x' + privateToAddress(privKey).toString('hex')
  }

  newAccount (_password, passwordPromptCb, cb) {
    if (this.executionContext.isVM()) {
      let privateKey
      do {
        privateKey = crypto.randomBytes(32)
      } while (!isValidPrivate(privateKey))
      this.providers.vm._addAccount(privateKey, '0x56BC75E2D63100000')
      return cb(null, '0x' + privateToAddress(privateKey).toString('hex'))
    }
    if (!this.config.get('settings/personal-mode')) {
      return cb('Not running in personal mode')
    }
    passwordPromptCb((passphrase) => {
      this.executionContext.web3().personal.newAccount(passphrase, cb)
    })
  }

  /** Get the balance of an address, and convert wei to ether */
  getBalanceInEther (address, cb) {
    address = stripHexPrefix(address)

    if (!this.executionContext.isVM()) {
      return this.executionContext.web3().eth.getBalance(address, (err, res) => {
        if (err) {
          return cb(err)
        }
        cb(null, Web3.utils.fromWei(res.toString(10), 'ether'))
      })
    }
    if (!this.providers.vm.accounts) {
      return cb('No accounts?')
    }

    this.executionContext.vm().stateManager.getAccount(Buffer.from(address, 'hex'), (err, res) => {
      if (err) {
        return cb('Account not found')
      }
      cb(null, Web3.utils.fromWei(new BN(res.balance).toString(10), 'ether'))
    })
  }

  pendingTransactionsCount () {
    return Object.keys(this.txRunner.pendingTxs).length
  }

  /**
    * call the current given contract
    *
    * @param {String} to    - address of the contract to call.
    * @param {String} data    - data to send with the transaction ( return of txFormat.buildData(...) ).
    * @param {Object} funAbi    - abi definition of the function to call.
    * @param {Function} callback    - callback.
    */
  callFunction (to, data, funAbi, confirmationCb, continueCb, promptCb, callback) {
    const useCall = funAbi.stateMutability === 'view' || funAbi.stateMutability === 'pure'
    this.runTx({to, data, useCall}, confirmationCb, continueCb, promptCb, (error, txResult) => {
      // see universaldapp.js line 660 => 700 to check possible values of txResult (error case)
      callback(error, txResult)
    })
  }

  context () {
    return (this.executionContext.isVM() ? 'memory' : 'blockchain')
  }

  /**
   * This function send a tx only to javascript VM or testnet, will return an error for the mainnet
   * SHOULD BE TAKEN CAREFULLY!
   *
   * @param {Object} tx    - transaction.
   */
  sendTransaction (tx) {
    return new Promise((resolve, reject) => {
      this.executionContext.detectNetwork((error, network) => {
        if (error) return reject(error)
        if (network.name === 'Main' && network.id === '1') {
          return reject(new Error('It is not allowed to make this action against mainnet'))
        }

        this.txRunner.rawRun(
          tx,
          (network, tx, gasEstimation, continueTxExecution, cancelCb) => { continueTxExecution() },
          (error, continueTxExecution, cancelCb) => { if (error) { reject(error) } else { continueTxExecution() } },
          (okCb, cancelCb) => { okCb() },
          (error, result) => {
            if (error) return reject(error)
            try {
              resolve(resultToRemixTx(result))
            } catch (e) {
              reject(e)
            }
          }
        )
      })
    })
  }

  runTx (args, confirmationCb, continueCb, promptCb, cb) {
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
          if (self.executionContext.isVM() && !self.providers.vm.accounts[address]) {
            return next('Invalid account selected')
          }
          next(null, address, value, gasLimit)
        })
      },
      function runTransaction (fromAddress, value, gasLimit, next) {
        const tx = { to: args.to, data: args.data.dataHex, useCall: args.useCall, from: fromAddress, value: value, gasLimit: gasLimit, timestamp: args.data.timestamp }
        const payLoad = { funAbi: args.data.funAbi, funArgs: args.data.funArgs, contractBytecode: args.data.contractBytecode, contractName: args.data.contractName, contractABI: args.data.contractABI, linkReferences: args.data.linkReferences }
        let timestamp = Date.now()
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

}

module.exports = Blockchain
