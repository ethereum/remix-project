
import React from 'react' // eslint-disable-line
import Web3 from 'web3'
import { Plugin } from '@remixproject/engine'
import { toBuffer, addHexPrefix } from 'ethereumjs-util'
import { EventEmitter } from 'events'
import { format } from 'util'
import { ExecutionContext } from './execution-context'
import VMProvider from './providers/vm.js'
import InjectedProvider from './providers/injected.js'
import NodeProvider from './providers/node.js'
import { execution, EventManager, helpers } from '@remix-project/remix-lib'
import { etherScanLink } from './helper'
import { logBuilder, confirmProxyMsg } from "@remix-ui/helper"
import { cancelProxyMsg } from '@remix-ui/helper'
const { txFormat, txExecution, typeConversion, txListener: Txlistener, TxRunner, TxRunnerWeb3, txHelper } = execution
const { txResultHelper: resultToRemixTx } = helpers
const packageJson = require('../../../../package.json')

const _paq = window._paq = window._paq || []  //eslint-disable-line

const profile = {
  name: 'blockchain',
  displayName: 'Blockchain',
  description: 'Blockchain - Logic',
  methods: ['getCode', 'getTransactionReceipt', 'addProvider', 'removeProvider'],
  version: packageJson.version
}

export class Blockchain extends Plugin {
  // NOTE: the config object will need to be refactored out in remix-lib
  constructor (config) {
    super(profile)
    this.event = new EventManager()
    this.executionContext = new ExecutionContext()

    this.events = new EventEmitter()
    this.config = config
    const web3Runner = new TxRunnerWeb3({
      config: this.config,
      detectNetwork: (cb) => {
        this.executionContext.detectNetwork(cb)
      },
      isVM: () => { return this.executionContext.isVM() },
      personalMode: () => {
        return this.getProvider() === 'web3' ? this.config.get('settings/personal-mode') : false
      }
    }, _ => this.executionContext.web3(), _ => this.executionContext.currentblockGasLimit())
    this.txRunner = new TxRunner(web3Runner, { runAsync: true })

    this.executionContext.event.register('contextChanged', this.resetEnvironment.bind(this))

    this.networkcallid = 0
    this.networkStatus = { name: ' - ', id: ' - ' }
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

    setInterval(() => {
      this.detectNetwork((error, network) => {
        this.networkStatus = { network, error }
        this.event.trigger('networkStatus', [this.networkStatus])
      })
    }, 1000)
  }

  getCurrentNetworkStatus () {
    return this.networkStatus
  }

  setupProviders () {
    this.providers = {}
    this.providers.vm = new VMProvider(this.executionContext)
    this.providers.injected = new InjectedProvider(this.executionContext)
    this.providers.web3 = new NodeProvider(this.executionContext, this.config)
  }

  getCurrentProvider () {
    const provider = this.getProvider()
    if (this.providers[provider]) return this.providers[provider]
    return this.providers.web3 // default to the common type of provider
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

  deployContractAndLibraries (selectedContract, args, contractMetadata, compilerContracts, callbacks, confirmationCb) {
    const { continueCb, promptCb, statusCb, finalCb } = callbacks
    const constructor = selectedContract.getConstructorInterface()
    txFormat.buildData(selectedContract.name, selectedContract.object, compilerContracts, true, constructor, args, (error, data) => {
      if (error) {
        return statusCb(`creation of ${selectedContract.name} errored: ${error.message ? error.message : error}`)
      }

      statusCb(`creation of ${selectedContract.name} pending...`)
      this.createContract(selectedContract, data, continueCb, promptCb, confirmationCb, finalCb)
    }, statusCb, (data, runTxCallback) => {
      // called for libraries deployment
      this.runTx(data, confirmationCb, continueCb, promptCb, runTxCallback)
    })
  }

  deployContractWithLibrary (selectedContract, args, contractMetadata, compilerContracts, callbacks, confirmationCb) {
    const { continueCb, promptCb, statusCb, finalCb } = callbacks
    const constructor = selectedContract.getConstructorInterface()
    txFormat.encodeConstructorCallAndLinkLibraries(selectedContract.object, args, constructor, contractMetadata.linkReferences, selectedContract.bytecodeLinkReferences, (error, data) => {
      if (error) {
        return statusCb(`creation of ${selectedContract.name} errored: ${error.message ? error.message : error}`)
      }

      statusCb(`creation of ${selectedContract.name} pending...`)
      this.createContract(selectedContract, data, continueCb, promptCb, confirmationCb, finalCb)
    })
  }

  async deployProxy (proxyData, implementationContractObject) {
    const proxyModal = {
      id: 'confirmProxyDeployment',
      title: 'ERC1967',
      message: `Confirm you want to deploy an ERC1967 proxy contract that is connected to your implementation.           
      For more info on ERC1967, see https://docs.openzeppelin.com/contracts/4.x/api/proxy#ERC1967Proxy`,
      modalType: 'modal',
      okLabel: 'OK',
      cancelLabel: 'Cancel',
      okFn: () => {
        this.runProxyTx(proxyData, implementationContractObject)
      },
      cancelFn: () => {
        this.call('notification', 'toast', cancelProxyMsg())
      },
      hideFn: () => null
    }
    this.call('notification', 'modal', proxyModal)
  }

  async runProxyTx (proxyData, implementationContractObject) {
    const args = { useCall: false, data: proxyData }
    const confirmationCb = (network, tx, gasEstimation, continueTxExecution, cancelCb) => {
      // continue using original authorization given by user
      continueTxExecution(null)
    }
    const continueCb = (error, continueTxExecution, cancelCb) => { continueTxExecution() }
    const promptCb = (okCb, cancelCb) => { okCb() }
    const finalCb = (error, txResult, address, returnValue) => {
      if (error) {
        const log = logBuilder(error)
  
        return this.call('terminal', 'logHtml', log)
      }
      return this.call('udapp', 'resolveContractAndAddInstance', implementationContractObject, address)
    }

    this.runTx(args, confirmationCb, continueCb, promptCb, finalCb)
  }

  async getEncodedFunctionHex (args, funABI) {
    return new Promise((resolve, reject) => {
      txFormat.encodeFunctionCall(args, funABI, (error, data) => {
        if (error) return reject(error)
        resolve(data.dataHex)
      })
    })
  }

  async getEncodedParams (args, funABI) {
    return new Promise((resolve, reject) => {
      txFormat.encodeParams(args, funABI, (error, encodedParams) => {
        if (error) return reject(error)
        return resolve(encodedParams.dataHex)
      })
    })
  }

  createContract (selectedContract, data, continueCb, promptCb, confirmationCb, finalCb) {
    if (data) {
      data.contractName = selectedContract.name
      data.linkReferences = selectedContract.bytecodeLinkReferences
      data.contractABI = selectedContract.abi
    }

    this.runTx({ data: data, useCall: false }, confirmationCb, continueCb, promptCb,
      (error, txResult, address) => {
        if (error) {
          return finalCb(`creation of ${selectedContract.name} errored: ${error.message ? error.message : error}`)
        }
        if (txResult.receipt.status === false || txResult.receipt.status === '0x0') {
          return finalCb(`creation of ${selectedContract.name} errored: transaction execution failed`)
        }
        finalCb(null, selectedContract, address)
      }
    )
  }

  determineGasPrice (cb) {
    this.getCurrentProvider().getGasPrice((error, gasPrice) => {
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

  getInputs (funABI) {
    if (!funABI.inputs) {
      return ''
    }
    return txHelper.inputParametersDeclarationToString(funABI.inputs)
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

  changeExecutionContext (context, confirmCb, infoCb, cb) {
    return this.executionContext.executionContextChange(context, null, confirmCb, infoCb, cb)
  }

  setProviderFromEndpoint (target, context, cb) {
    return this.executionContext.setProviderFromEndpoint(target, context, cb)
  }

  detectNetwork (cb) {
    return this.executionContext.detectNetwork(cb)
  }

  getProvider () {
    return this.executionContext.getProvider()
  }

  getInjectedWeb3Address () {
    return this.executionContext.getSelectedAddress()
  }

  /**
   * return the fork name applied to the current envionment
   * @return {String} - fork name
   */
  getCurrentFork () {
    return this.executionContext.getCurrentFork()
  }

  isWeb3Provider () {
    const isVM = this.getProvider() === 'vm'
    const isInjected = this.getProvider() === 'injected'
    return (!isVM && !isInjected)
  }

  isInjectedWeb3 () {
    return this.getProvider() === 'injected'
  }

  signMessage (message, account, passphrase, cb) {
    this.getCurrentProvider().signMessage(message, account, passphrase, cb)
  }

  web3 () {
    // @todo(https://github.com/ethereum/remix-project/issues/431)
    const isVM = this.getProvider() === 'vm'
    if (isVM) {
      return this.providers.vm.web3
    }
    return this.executionContext.web3()
  }

  getTxListener (opts) {
    opts.event = {
      // udapp: this.udapp.event
      udapp: this.event
    }
    const txlistener = new Txlistener(opts, this.executionContext)
    return txlistener
  }

  runOrCallContractMethod (contractName, contractAbi, funABI, contract, value, address, callType, lookupOnly, logMsg, logCallback, outputCb, confirmationCb, continueCb, promptCb) {
    // contractsDetails is used to resolve libraries
    txFormat.buildData(contractName, contractAbi, {}, false, funABI, callType, (error, data) => {
      if (error) {
        return logCallback(`${logMsg} errored: ${error.message ? error.message : error}`)
      }
      if (!lookupOnly) {
        logCallback(`${logMsg} pending ... `)
      } else {
        logCallback(`${logMsg}`)
      }
      if (funABI.type === 'fallback') data.dataHex = value

      if (data) {
        data.contractName = contractName
        data.contractABI = contractAbi
        data.contract = contract
      }
      const useCall = funABI.stateMutability === 'view' || funABI.stateMutability === 'pure'
      this.runTx({ to: address, data, useCall }, confirmationCb, continueCb, promptCb, (error, txResult, _address, returnValue) => {
        if (error) {
          return logCallback(`${logMsg} errored: ${error.message ? error.message : error}`)
        }
        if (lookupOnly) {
          outputCb(returnValue)
        }
      })
    },
    (msg) => {
      logCallback(msg)
    },
    (data, runTxCallback) => {
      // called for libraries deployment
      this.runTx(data, confirmationCb, runTxCallback, promptCb, () => { /* Do nothing. */ })
    })
  }

  context () {
    return (this.executionContext.isVM() ? 'memory' : 'blockchain')
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

  addProvider (provider) {
    this.executionContext.addProvider(provider)
  }

  removeProvider (name) {
    this.executionContext.removeProvider(name)
  }

  // TODO : event should be triggered by Udapp instead of TxListener
  /** Listen on New Transaction. (Cannot be done inside constructor because txlistener doesn't exist yet) */
  startListening (txlistener) {
    txlistener.event.register('newTransaction', (tx, receipt) => {
      this.events.emit('newTransaction', tx, receipt)
    })
  }

  resetEnvironment () {
    this.getCurrentProvider().resetEnvironment()
    // TODO: most params here can be refactored away in txRunner
    const web3Runner = new TxRunnerWeb3({
      config: this.config,
      detectNetwork: (cb) => {
        this.executionContext.detectNetwork(cb)
      },
      isVM: () => { return this.executionContext.isVM() },
      personalMode: () => {
        return this.getProvider() === 'web3' ? this.config.get('settings/personal-mode') : false
      }
    }, _ => this.executionContext.web3(), _ => this.executionContext.currentblockGasLimit())
    
    web3Runner.event.register('transactionBroadcasted', (txhash) => {
      this.executionContext.detectNetwork((error, network) => {
        if (error || !network) return
        if (network.name === 'VM') return
        const viewEtherScanLink = etherScanLink(network.name, txhash)

        if (viewEtherScanLink) {
          this.call('terminal', 'logHtml',
          (<a href={etherScanLink(network.name, txhash)} target="_blank">
            view on etherscan
          </a>))        
        }
      })
    })
    this.txRunner = new TxRunner(web3Runner, { runAsync: true })
  }

  /**
   * Create a VM Account
   * @param {{privateKey: string, balance: string}} newAccount The new account to create
   */
  createVMAccount (newAccount) {
    if (this.getProvider() !== 'vm') {
      throw new Error('plugin API does not allow creating a new account through web3 connection. Only vm mode is allowed')
    }
    return this.providers.vm.createVMAccount(newAccount)
  }

  newAccount (_password, passwordPromptCb, cb) {
    return this.getCurrentProvider().newAccount(passwordPromptCb, cb)
  }

  /** Get the balance of an address, and convert wei to ether */
  getBalanceInEther (address, cb) {
    this.getCurrentProvider().getBalanceInEther(address, cb)
  }

  pendingTransactionsCount () {
    return Object.keys(this.txRunner.pendingTxs).length
  }

  async getCode(address) {
    return await this.web3().eth.getCode(address)
  }

  async getTransactionReceipt (hash) {
    return await this.web3().eth.getTransactionReceipt(hash)
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
          async (error, result) => {
            if (error) return reject(error)
            try {
              const execResult = await this.web3().eth.getExecutionResultFromSimulator(result.transactionHash)
              resolve(resultToRemixTx(result, execResult))
            } catch (e) {
              reject(e)
            }
          }
        )
      })
    })
  }

  async runTx (args, confirmationCb, continueCb, promptCb, cb) {
    const getGasLimit = () => {
      return new Promise((resolve, reject) => {
        if (this.transactionContextAPI.getGasLimit) {
          return this.transactionContextAPI.getGasLimit((err, value) => {
            if (err) return reject(err)
            return resolve(value)
          })
        }
        return resolve(3000000)
      })
    }
    const queryValue = () => {
      return new Promise((resolve, reject) => {
        if (args.value) {
          return resolve(args.value)
        }
        if (args.useCall || !this.transactionContextAPI.getValue) {
          return resolve(0)
        }
        this.transactionContextAPI.getValue((err, value) => {
          if (err) return reject(err)
          return resolve(value)
        })
      })
    }
    const getAccount = () => {
      return new Promise((resolve, reject) => {
        if (args.from) {
          return resolve(args.from)
        }
        if (this.transactionContextAPI.getAddress) {
          return this.transactionContextAPI.getAddress(function (err, address) {
            if (err) return reject(err)
            return resolve(address)
          })
        }
        this.getAccounts(function (err, accounts) {
          if (err) return reject(err)
          const address = accounts[0]

          if (!address) return reject('No accounts available')
          if (this.executionContext.isVM() && !this.providers.vm.RemixSimulatorProvider.Accounts.accounts[address]) {
            return reject('Invalid account selected')
          }
          return resolve(address)
        })
      })
    }
    const runTransaction = async () => {
      // eslint-disable-next-line no-async-promise-executor
      return new Promise(async (resolve, reject) => {
        const fromAddress = await getAccount()
        const value = await queryValue()
        const gasLimit = await getGasLimit()
        const tx = { to: args.to, data: args.data.dataHex, useCall: args.useCall, from: fromAddress, value: value, gasLimit: gasLimit, timestamp: args.data.timestamp }
        const payLoad = { funAbi: args.data.funAbi, funArgs: args.data.funArgs, contractBytecode: args.data.contractBytecode, contractName: args.data.contractName, contractABI: args.data.contractABI, linkReferences: args.data.linkReferences }

        if (!tx.timestamp) tx.timestamp = Date.now()
        const timestamp = tx.timestamp

        this.event.trigger('initiatingTransaction', [timestamp, tx, payLoad])
        this.txRunner.rawRun(tx, confirmationCb, continueCb, promptCb,
          async (error, result) => {
            if (error) return reject(error)

            const isVM = this.executionContext.isVM()
            if (isVM && tx.useCall) {
              try {
                result.transactionHash = await this.web3().eth.getHashFromTagBySimulator(timestamp)
              } catch (e) {
                console.log('unable to retrieve back the "call" hash', e)
              }
            }
            const eventName = (tx.useCall ? 'callExecuted' : 'transactionExecuted')
            this.event.trigger(eventName, [error, tx.from, tx.to, tx.data, tx.useCall, result, timestamp, payLoad])

            if (error && (typeof (error) !== 'string')) {
              if (error.message) error = error.message
              else {
                try { error = 'error: ' + JSON.stringify(error) } catch (e) { console.log(e) }
              }
            }
            return resolve({ result, tx })
          }
        )
      })
    }
    try {
      const transaction = await runTransaction()
      const txResult = transaction.result
      const tx = transaction.tx
      /*
      value of txResult is inconsistent:
          - transact to contract:
            {"receipt": { ... }, "tx":{ ... }, "transactionHash":"0x7ba4c05075210fdbcf4e6660258379db5cc559e15703f9ac6f970a320c2dee09"}
          - call to contract:
            {"result":"0x0000000000000000000000000000000000000000000000000000000000000000","transactionHash":"0x5236a76152054a8aad0c7135bcc151f03bccb773be88fbf4823184e47fc76247"}
      */
      const isVM = this.executionContext.isVM()
      let execResult
      let returnValue = null
      if (isVM) {
        const hhlogs = await this.web3().eth.getHHLogsForTx(txResult.transactionHash)

        if (hhlogs && hhlogs.length) {
          let finalLogs = '<b>console.log:</b>\n'
          for (const log of hhlogs) {
            let formattedLog
            // Hardhat implements the same formatting options that can be found in Node.js' console.log,
            // which in turn uses util.format: https://nodejs.org/dist/latest-v12.x/docs/api/util.html#util_util_format_format_args
            // For example: console.log("Name: %s, Age: %d", remix, 6) will log 'Name: remix, Age: 6'
            // We check first arg to determine if 'util.format' is needed
            if (typeof log[0] === 'string' && (log[0].includes('%s') || log[0].includes('%d'))) {
              formattedLog = format(log[0], ...log.slice(1))
            } else {
              formattedLog = log.join(' ')
            }
            finalLogs = finalLogs + '&emsp;' + formattedLog + '\n'
          }
          _paq.push(['trackEvent', 'udapp', 'hardhat', 'console.log'])
          this.call('terminal', 'log', { type: 'info', value: finalLogs })
        }
        execResult = await this.web3().eth.getExecutionResultFromSimulator(txResult.transactionHash)
        if (execResult) {
          // if it's not the VM, we don't have return value. We only have the transaction, and it does not contain the return value.
          returnValue = execResult ? execResult.returnValue : toBuffer(addHexPrefix(txResult.result) || '0x0000000000000000000000000000000000000000000000000000000000000000')
          const compiledContracts = await this.call('compilerArtefacts', 'getAllContractDatas')
          const vmError = txExecution.checkVMError(execResult, compiledContracts)
          if (vmError.error) {
            return cb(vmError.message)
          }
        }
      }
  
      if (!isVM && tx && tx.useCall) {
        returnValue = toBuffer(addHexPrefix(txResult.result))
      }
  
      let address = null
      if (txResult && txResult.receipt) {
        address = txResult.receipt.contractAddress
      }
  
      cb(null, txResult, address, returnValue)
    } catch (error) {
      cb(error)
    }
  }
}
