
import React from 'react' // eslint-disable-line
import Web3 from 'web3'
import { Plugin } from '@remixproject/engine'
import { toBuffer, addHexPrefix } from 'ethereumjs-util'
import { EventEmitter } from 'events'
import { format } from 'util'
import { ExecutionContext } from './execution-context'
import VMProvider from './providers/vm.js'
import HashConnect from './providers/hashconnect'
import NodeProvider from './providers/node.js'
import { execution, EventManager, helpers } from '@remix-project/remix-lib'
import { etherScanLink } from './helper'
import { logBuilder, cancelUpgradeMsg, cancelProxyMsg, addressToString } from "@remix-ui/helper"
const { txFormat, txExecution, typeConversion, txListener: Txlistener, TxRunner, TxRunnerHashConnect, txHelper } = execution
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
  constructor(config) {
    super(profile)
    this.event = new EventManager()
    this.executionContext = new ExecutionContext()

    this.events = new EventEmitter()
    this.config = config
    const hashConnectRunner = new TxRunnerHashConnect({
      config: this.config,
      detectNetwork: (cb) => {
        this.executionContext.detectNetwork(cb)
      },
      isVM: () => { return this.executionContext.isVM() },
      personalMode: () => {
        return this.getProvider() === 'web3' ? this.config.get('settings/personal-mode') : false
      }
    }, _ => this.executionContext.web3(), _ => this.executionContext.currentblockGasLimit())
    this.txRunner = new TxRunner(hashConnectRunner, { runAsync: true })

    this.executionContext.event.register('contextChanged', this.resetEnvironment.bind(this))

    this.networkcallid = 0
    this.networkStatus = { name: ' - ', id: ' - ' }
    this.setupEvents()
    this.setupProviders()
  }

  setupEvents() {
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

  getCurrentNetworkStatus() {
    return this.networkStatus
  }

  setupProviders() {
    this.providers = {}
    this.providers.vm = new VMProvider(this.executionContext)
    this.providers.injected = new HashConnect(this.executionContext)
    this.providers.web3 = new NodeProvider(this.executionContext, this.config)
  }

  getCurrentProvider() {
    const provider = this.getProvider()
    if (this.providers[provider]) return this.providers[provider]
    return this.providers.web3 // default to the common type of provider
  }

  /** Return the list of accounts */
  // note: the dual promise/callback is kept for now as it was before
  getAccounts(cb) {
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

  deployContractAndLibraries(selectedContract, args, contractMetadata, compilerContracts, callbacks, confirmationCb) {
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

  deployContractWithLibrary(selectedContract, args, contractMetadata, compilerContracts, callbacks, confirmationCb) {
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

  async deployProxy(proxyData, implementationContractObject) {
    const proxyModal = {
      id: 'confirmProxyDeployment',
      title: 'Confirm Deploy Proxy (ERC1967)',
      message: `Confirm you want to deploy an ERC1967 proxy contract that is connected to your implementation.
      For more info on ERC1967, see: https://docs.openzeppelin.com/contracts/4.x/api/proxy#ERC1967Proxy`,
      modalType: 'modal',
      okLabel: 'OK',
      cancelLabel: 'Cancel',
      okFn: () => {
        this.runProxyTx(proxyData, implementationContractObject)
        _paq.push(['trackEvent', 'blockchain', 'Deploy With Proxy', 'modal ok confirmation'])
      },
      cancelFn: () => {
        this.call('notification', 'toast', cancelProxyMsg())
        _paq.push(['trackEvent', 'blockchain', 'Deploy With Proxy', 'cancel proxy deployment'])
      },
      hideFn: () => null
    }
    this.call('notification', 'modal', proxyModal)
  }

  async runProxyTx(proxyData, implementationContractObject) {
    const args = { useCall: false, data: proxyData }
    let networkInfo
    const confirmationCb = (network, tx, gasEstimation, continueTxExecution, cancelCb) => {
      networkInfo = network
      // continue using original authorization given by user
      continueTxExecution(null)
    }
    const continueCb = (error, continueTxExecution, cancelCb) => { continueTxExecution() }
    const promptCb = (okCb, cancelCb) => { okCb() }
    const finalCb = (error, txResult, address, returnValue) => {
      if (error) {
        const log = logBuilder(error)

        _paq.push(['trackEvent', 'blockchain', 'Deploy With Proxy', 'Proxy deployment failed: ' + error])
        return this.call('terminal', 'logHtml', log)
      }
      if (networkInfo.name === 'VM') this.config.set('vm/proxy', address)
      else this.config.set(`${networkInfo.name}/${networkInfo.currentFork}/${networkInfo.id}/proxy`, address)
      _paq.push(['trackEvent', 'blockchain', 'Deploy With Proxy', 'Proxy deployment successful'])
      this.call('udapp', 'addInstance', addressToString(address), implementationContractObject.abi, implementationContractObject.name)
    }

    this.runTx(args, confirmationCb, continueCb, promptCb, finalCb)
  }

  async upgradeProxy(proxyAddress, newImplAddress, data, newImplementationContractObject) {
    const upgradeModal = {
      id: 'confirmProxyDeployment',
      title: 'Confirm Update Proxy (ERC1967)',
      message: `Confirm you want to update your proxy contract with the new implementation contract's address:  ${newImplAddress}.`,
      modalType: 'modal',
      okLabel: 'OK',
      cancelLabel: 'Cancel',
      okFn: () => {
        this.runUpgradeTx(proxyAddress, data, newImplementationContractObject)
        _paq.push(['trackEvent', 'blockchain', 'Upgrade With Proxy', 'proxy upgrade confirmation click'])
      },
      cancelFn: () => {
        this.call('notification', 'toast', cancelUpgradeMsg())
        _paq.push(['trackEvent', 'blockchain', 'Upgrade With Proxy', 'proxy upgrade cancel click'])
      },
      hideFn: () => null
    }
    this.call('notification', 'modal', upgradeModal)
  }

  async runUpgradeTx(proxyAddress, data, newImplementationContractObject) {
    const args = { useCall: false, data, to: proxyAddress }
    const confirmationCb = (network, tx, gasEstimation, continueTxExecution, cancelCb) => {
      // continue using original authorization given by user
      continueTxExecution(null)
    }
    const continueCb = (error, continueTxExecution, cancelCb) => { continueTxExecution() }
    const promptCb = (okCb, cancelCb) => { okCb() }
    const finalCb = (error, txResult, address, returnValue) => {
      if (error) {
        const log = logBuilder(error)

        _paq.push(['trackEvent', 'blockchain', 'Upgrade With Proxy', 'Upgrade failed'])
        return this.call('terminal', 'logHtml', log)
      }
      _paq.push(['trackEvent', 'blockchain', 'Upgrade With Proxy', 'Upgrade Successful'])
      this.call('udapp', 'addInstance', addressToString(proxyAddress), newImplementationContractObject.abi, newImplementationContractObject.name)
    }
    this.runTx(args, confirmationCb, continueCb, promptCb, finalCb)
  }

  async getEncodedFunctionHex(args, funABI) {
    return new Promise((resolve, reject) => {
      txFormat.encodeFunctionCall(args, funABI, (error, data) => {
        if (error) return reject(error)
        resolve(data.dataHex)
      })
    })
  }

  async getEncodedParams(args, funABI) {
    return new Promise((resolve, reject) => {
      txFormat.encodeParams(args, funABI, (error, encodedParams) => {
        if (error) return reject(error)
        return resolve(encodedParams.dataHex)
      })
    })
  }

  createContract(selectedContract, data, continueCb, promptCb, confirmationCb, finalCb) {
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

  determineGasPrice(cb) {
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

  getInputs(funABI) {
    if (!funABI.inputs) {
      return ''
    }
    return txHelper.inputParametersDeclarationToString(funABI.inputs)
  }

  fromWei(value, doTypeConversion, unit) {
    if (doTypeConversion) {
      return Web3.utils.fromWei(typeConversion.toInt(value), unit || 'ether')
    }
    return Web3.utils.fromWei(value.toString(10), unit || 'ether')
  }

  toWei(value, unit) {
    return Web3.utils.toWei(value, unit || 'gwei')
  }

  calculateFee(gas, gasPrice, unit) {
    return Web3.utils.toBN(gas).mul(Web3.utils.toBN(Web3.utils.toWei(gasPrice.toString(10), unit || 'gwei')))
  }

  determineGasFees(tx) {
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

  changeExecutionContext(context, confirmCb, infoCb, cb) {
    return this.executionContext.executionContextChange(context, null, confirmCb, infoCb, cb)
  }

  setProviderFromEndpoint(target, context, cb) {
    return this.executionContext.setProviderFromEndpoint(target, context, cb)
  }

  detectNetwork(cb) {
    return this.executionContext.detectNetwork(cb)
  }

  getProvider() {
    return this.executionContext.getProvider()
  }

  getInjectedWeb3Address() {
    return this.executionContext.getSelectedAddress()
  }

  /**
   * return the fork name applied to the current envionment
   * @return {String} - fork name
   */
  getCurrentFork() {
    return this.executionContext.getCurrentFork()
  }

  isWeb3Provider() {
    const isVM = this.getProvider() === 'vm'
    const isInjected = this.getProvider() === 'injected'
    return (!isVM && !isInjected)
  }

  isInjectedWeb3() {
    return this.getProvider() === 'injected'
  }

  signMessage(message, account, passphrase, cb) {
    this.getCurrentProvider().signMessage(message, account, passphrase, cb)
  }

  web3() {
    // @todo(https://github.com/ethereum/remix-project/issues/431)
    const isVM = this.getProvider() === 'vm'
    if (isVM) {
      return this.providers.vm.web3
    }
    return this.executionContext.web3()
  }

  getTxListener(opts) {
    opts.event = {
      // udapp: this.udapp.event
      udapp: this.event
    }
    const txlistener = new Txlistener(opts, this.executionContext)
    return txlistener
  }

  runOrCallContractMethod(contractName, contractAbi, funABI, contract, value, address, callType, lookupOnly, logMsg, logCallback, outputCb, confirmationCb, continueCb, promptCb) {
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

  context() {
    return (this.executionContext.isVM() ? 'memory' : 'blockchain')
  }

  // NOTE: the config is only needed because exectuionContext.init does
  // if config.get('settings/always-use-vm'), we can simplify this later
  resetAndInit(config, transactionContextAPI) {
    this.transactionContextAPI = transactionContextAPI
    this.executionContext.init(config)
    this.executionContext.stopListenOnLastBlock()
    this.executionContext.listenOnLastBlock()
    this.resetEnvironment()
  }

  addProvider(provider) {
    this.executionContext.addProvider(provider)
  }

  removeProvider(name) {
    this.executionContext.removeProvider(name)
  }

  // TODO : event should be triggered by Udapp instead of TxListener
  /** Listen on New Transaction. (Cannot be done inside constructor because txlistener doesn't exist yet) */
  startListening(txlistener) {
    txlistener.event.register('newTransaction', (tx, receipt) => {
      this.events.emit('newTransaction', tx, receipt)
    })
  }

  async resetEnvironment() {
    const hashconnect = new HashConnect()
    await hashconnect.init();
    this.getCurrentProvider().resetEnvironment()
    // TODO: most params here can be refactored away in txRunner
    const hashConnectRunner = new TxRunnerHashConnect(hashconnect, _ => this.executionContext.web3(), _ => this.executionContext.currentblockGasLimit())

    hashConnectRunner.event.register('transactionBroadcasted', (txhash) => {
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
    this.txRunner = new TxRunner(hashConnectRunner, { runAsync: true })
  }

  /**
   * Create a VM Account
   * @param {{privateKey: string, balance: string}} newAccount The new account to create
   */
  createVMAccount(newAccount) {
    if (this.getProvider() !== 'vm') {
      throw new Error('plugin API does not allow creating a new account through web3 connection. Only vm mode is allowed')
    }
    return this.providers.vm.createVMAccount(newAccount)
  }

  newAccount(_password, passwordPromptCb, cb) {
    return this.getCurrentProvider().newAccount(passwordPromptCb, cb)
  }

  /** Get the balance of an address, and convert wei to ether */
  getBalanceInEther(address, cb) {
    // this.getCurrentProvider().getBalanceInEther(address, cb)
  }

  pendingTransactionsCount() {
    return Object.keys(this.txRunner.pendingTxs).length
  }

  async getCode(address) {
    return await this.web3().eth.getCode(address)
  }

  async getTransactionReceipt(hash) {
    return await this.web3().eth.getTransactionReceipt(hash)
  }

  /**
   * This function send a tx only to Remix VM or testnet, will return an error for the mainnet
   * SHOULD BE TAKEN CAREFULLY!
   *
   * @param {Object} tx    - transaction.
   */
  sendTransaction(tx) {
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

  async runTx(args, confirmationCb, continueCb, promptCb, cb) {
    console.log({args})
    const runTransaction = async () => {
      // eslint-disable-next-line no-async-promise-executor
      return new Promise(async (resolve, reject) => {
        const payLoad = { funAbi: args.data.funAbi, funArgs: args.data.funArgs, contractBytecode: args.data.contractBytecode, contractName: args.data.contractName, contractABI: args.data.contractABI, linkReferences: args.data.linkReferences }
        const tx = { ...payLoad, to: args.to, data: args.data.dataHex, useCall: args.useCall, timestamp: args.data.timestamp }

        if (!tx.timestamp) tx.timestamp = Date.now()
        const timestamp = tx.timestamp

        this.event.trigger('initiatingTransaction', [timestamp, tx, payLoad])
        try {
          this.txRunner.rawRun(tx, confirmationCb, continueCb, promptCb,
            async (error, result) => {
              console.log('result',result)
              if (error) {
                if (typeof (error) !== 'string') {
                  if (error.message) error = error.message
                  else {
                    try { error = 'error: ' + JSON.stringify(error) } catch (e) { console.log(e) }
                  }
                }
                return reject(error)
              }
              const eventName = (tx.useCall ? 'callExecuted' : 'transactionExecuted')

              this.event.trigger(eventName, [error, tx.from, tx.to, tx.data, tx.useCall, result, timestamp, payLoad])
              return resolve({ result, tx })
            }
          )
        } catch (err) {
          let error = err
          if (error && (typeof (error) !== 'string')) {
            if (error.message) error = error.message
            else {
              try { error = 'error: ' + JSON.stringify(error) } catch (e) { console.log(e) }
            }
          }
          return reject(error)
        }
      })
    }
    try {
      const transaction = await runTransaction()
      const txResult = transaction.result
      console.log({txResult})
      const tx = transaction.tx
      /*
      value of txResult is inconsistent:
          - transact to contract:
            {"receipt": { ... }, "tx":{ ... }, "transactionHash":"0x7ba4c05075210fdbcf4e6660258379db5cc559e15703f9ac6f970a320c2dee09"}
          - call to contract:
            {"result":"0x0000000000000000000000000000000000000000000000000000000000000000","transactionHash":"0x5236a76152054a8aad0c7135bcc151f03bccb773be88fbf4823184e47fc76247"}
      */
      let returnValue = null

      if (tx && tx.useCall) {
        returnValue = toBuffer(addHexPrefix(txResult.receipt))
      }

      let address = null
      if (txResult && txResult.receipt) {
        // address = txResult.receipt.contractAddress
        address = txResult.receipt.contractId
      }

      cb(null, txResult, address, returnValue)
    } catch (error) {
      cb(error)
    }
  }
}
