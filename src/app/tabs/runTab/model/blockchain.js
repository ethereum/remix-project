const remixLib = require('remix-lib')
const txFormat = remixLib.execution.txFormat
const txExecution = remixLib.execution.txExecution
const typeConversion = remixLib.execution.typeConversion
const Txlistener = remixLib.execution.txListener
const EventManager = remixLib.EventManager
const ethJSUtil = require('ethereumjs-util')
const Personal = require('web3-eth-personal')
const Web3 = require('web3')

import { UniversalDApp } from 'remix-lib'

class Blockchain {

  // NOTE: the config object will need to be refactored out in remix-lib
  constructor (config, executionContext) {
    this.event = new EventManager()
    this.executionContext = executionContext
    this.udapp = new UniversalDApp(config, this.executionContext)

    this.networkcallid = 0
    this.setupEvents()
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

    this.udapp.event.register('initiatingTransaction', (timestamp, tx, payLoad) => {
      this.event.trigger('initiatingTransaction', [timestamp, tx, payLoad])
    })

    this.udapp.event.register('transactionExecuted', (error, from, to, data, call, txResult, timestamp) => {
      this.event.trigger('transactionExecuted', [error, from, to, data, call, txResult, timestamp])
    })

    this.udapp.event.register('transactionBroadcasted', (txhash, networkName) => {
      this.event.trigger('transactionBroadcasted', [txhash, networkName])
    })
  }

  async deployContract (selectedContract, args, contractMetadata, compilerContracts, callbacks, confirmationCb) {
    const { continueCb, promptCb, statusCb, finalCb } = callbacks

    var constructor = selectedContract.getConstructorInterface()
    if (!contractMetadata || (contractMetadata && contractMetadata.autoDeployLib)) {
      return txFormat.buildData(selectedContract.name, selectedContract.object, compilerContracts, true, constructor, args, (error, data) => {
        if (error) return statusCb(`creation of ${selectedContract.name} errored: ` + error)

        statusCb(`creation of ${selectedContract.name} pending...`)
        this.createContract(selectedContract, data, continueCb, promptCb, confirmationCb, finalCb)
      }, statusCb, (data, runTxCallback) => {
                // called for libraries deployment
        this.runTransaction(data, continueCb, promptCb, confirmationCb, runTxCallback)
      })
    }
    if (Object.keys(selectedContract.bytecodeLinkReferences).length) statusCb(`linking ${JSON.stringify(selectedContract.bytecodeLinkReferences, null, '\t')} using ${JSON.stringify(contractMetadata.linkReferences, null, '\t')}`)
    txFormat.encodeConstructorCallAndLinkLibraries(selectedContract.object, args, constructor, contractMetadata.linkReferences, selectedContract.bytecodeLinkReferences, (error, data) => {
      if (error) return statusCb(`creation of ${selectedContract.name} errored: ` + error)

      statusCb(`creation of ${selectedContract.name} pending...`)
      this.createContract(selectedContract, data, continueCb, promptCb, confirmationCb, finalCb)
    })
  }

  runTransaction (data, continueCb, promptCb, confirmationCb, finalCb) {
    this.udapp.runTx(data, confirmationCb, continueCb, promptCb, finalCb)
  }

  createContract (selectedContract, data, continueCb, promptCb, confirmationCb, finalCb) {
    if (data) {
      data.contractName = selectedContract.name
      data.linkReferences = selectedContract.bytecodeLinkReferences
      data.contractABI = selectedContract.abi
    }

    this.udapp.createContract(data, confirmationCb, continueCb, promptCb,
            (error, txResult) => {
              if (error) {
                return finalCb(`creation of ${selectedContract.name} errored: ${error}`)
              }
              var isVM = this.executionContext.isVM()
              if (isVM) {
                var vmError = txExecution.checkVMError(txResult)
                if (vmError.error) {
                  return finalCb(vmError.message)
                }
              }
              if (txResult.result.status && txResult.result.status === '0x0') {
                return finalCb(`creation of ${selectedContract.name} errored: transaction execution failed`)
              }
              var address = isVM ? txResult.result.createdAddress : txResult.result.contractAddress
              finalCb(null, selectedContract, address)
            }
        )
  }

  determineGasPrice (cb) {
    this.getGasPrice((error, gasPrice) => {
      var warnMessage = ' Please fix this issue before sending any transaction. '
      if (error) {
        return cb('Unable to retrieve the current network gas price.' + warnMessage + error)
      }
      try {
        var gasPriceValue = this.fromWei(gasPrice, false, 'gwei')
        cb(null, gasPriceValue)
      } catch (e) {
        cb(warnMessage + e.message, null, false)
      }
    })
  }

  getGasPrice (cb) {
    return this.executionContext.web3().eth.getGasPrice(cb)
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
        var fee = this.calculateFee(tx.gas, gasPrice)
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

  getAccountBalanceForAddress (address, cb) {
    return this.udapp.getBalanceInEther(address, cb)
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

  newAccount (passphraseCb, cb) {
    return this.udapp.newAccount('', passphraseCb, cb)
  }

  getAccounts (cb) {
    return this.udapp.getAccounts(cb)
  }

  isWeb3Provider () {
    var isVM = this.executionContext.isVM()
    var isInjected = this.executionContext.getProvider() === 'injected'
    return (!isVM && !isInjected)
  }

  isInjectedWeb3 () {
    return this.executionContext.getProvider() === 'injected'
  }

  signMessage (message, account, passphrase, cb) {
    var isVM = this.executionContext.isVM()
    var isInjected = this.executionContext.getProvider() === 'injected'

    if (isVM) {
      const personalMsg = ethJSUtil.hashPersonalMessage(Buffer.from(message))
      var privKey = this.udapp.accounts[account].privateKey
      try {
        var rsv = ethJSUtil.ecsign(personalMsg, privKey)
        var signedData = ethJSUtil.toRpcSig(rsv.v, rsv.r, rsv.s)
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
      var personal = new Personal(this.executionContext.web3().currentProvider)
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
      udapp: this.udapp.event
    }
    const txlistener = new Txlistener(opts, this.executionContext)
    return txlistener
  }

  startListening (txlistener) {
    this.udapp.startListening(txlistener)
  }

  runOrCallContractMethod (contractName, contractAbi, funABI, value, address, callType, lookupOnly, logMsg, logCallback, outputCb, confirmationCb, continueCb, promptCb) {
    // contractsDetails is used to resolve libraries
    txFormat.buildData(contractName, contractAbi, {}, false, funABI, callType, (error, data) => {
      if (!error) {
        if (!lookupOnly) {
          logCallback(`${logMsg} pending ... `)
        } else {
          logCallback(`${logMsg}`)
        }
        if (funABI.type === 'fallback') data.dataHex = value
        this.udapp.callFunction(address, data, funABI, confirmationCb, continueCb, promptCb, (error, txResult) => {
          if (!error) {
            var isVM = this.executionContext.isVM()
            if (isVM) {
              var vmError = txExecution.checkVMError(txResult)
              if (vmError.error) {
                logCallback(`${logMsg} errored: ${vmError.message} `)
                return
              }
            }
            if (lookupOnly) {
              const returnValue = (this.executionContext.isVM() ? txResult.result.execResult.returnValue : ethJSUtil.toBuffer(txResult.result))
              outputCb(returnValue)
            }
          } else {
            logCallback(`${logMsg} errored: ${error} `)
          }
        })
      } else {
        logCallback(`${logMsg} errored: ${error} `)
      }
    },
    (msg) => {
      logCallback(msg)
    },
    (data, runTxCallback) => {
      // called for libraries deployment
      this.udapp.runTx(data, confirmationCb, runTxCallback)
    })
  }

  context () {
    return (this.executionContext.isVM() ? 'memory' : 'blockchain')
  }

  // NOTE: the config is only needed because exectuionContext.init does
  // if config.get('settings/always-use-vm'), we can simplify this later
  resetAndInit (config, transactionContext) {
    this.udapp.resetAPI(transactionContext)
    this.executionContext.init(config)
    this.executionContext.stopListenOnLastBlock()
    this.executionContext.listenOnLastBlock()
    this.udapp.resetEnvironment()
  }

  addNetwork (customNetwork) {
    this.executionContext.addProvider(customNetwork)
  }

  removeNetwork (name) {
    this.executionContext.removeProvider(name)
  }
}

module.exports = Blockchain
