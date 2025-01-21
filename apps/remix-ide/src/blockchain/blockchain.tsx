import React from 'react' // eslint-disable-line
import { fromWei, toBigInt, toWei } from 'web3-utils'
import { Plugin } from '@remixproject/engine'
import { toBytes, addHexPrefix } from '@ethereumjs/util'
import { EventEmitter } from 'events'
import { format } from 'util'
import { ExecutionContext } from './execution-context'
import Config from '../config'
import { VMProvider } from './providers/vm'
import { InjectedProvider } from './providers/injected'
import { NodeProvider } from './providers/node'
import { execution, EventManager, helpers } from '@remix-project/remix-lib'
import { etherScanLink } from './helper'
import { logBuilder, cancelUpgradeMsg, cancelProxyMsg, addressToString } from '@remix-ui/helper'
const { txFormat, txExecution, typeConversion, txListener: Txlistener, TxRunner, TxRunnerWeb3, txHelper } = execution
const { txResultHelper } = helpers
const { resultToRemixTx } = txResultHelper
import * as packageJson from '../../../../package.json'

const _paq = (window._paq = window._paq || []) //eslint-disable-line

const profile = {
  name: 'blockchain',
  displayName: 'Blockchain',
  description: 'Blockchain - Logic',
  methods: ['getCode', 'getTransactionReceipt', 'addProvider', 'removeProvider', 'getCurrentFork', 'getAccounts', 'web3VM', 'web3', 'getProvider', 'getCurrentProvider', 'getCurrentNetworkStatus', 'getAllProviders', 'getPinnedProviders'],
  version: packageJson.version
}

export type TransactionContextAPI = {
  getAddress: (cb: (error: Error, result: string) => void) => void
  getValue: (cb: (error: Error, result: string) => void) => void
  getGasLimit: (cb: (error: Error, result: string) => void) => void
}

// see TxRunner.ts in remix-lib
export type Transaction = {
  from: string
  to: string
  value: string
  data: string
  gasLimit: string
  useCall: boolean
  timestamp?: number
}

export type Provider = {
  options: { [key: string]: string }
  dataId: string
  name: string
  displayName: string
  logo?: string,
  logos?: string[],
  fork: string
  description?: string
  isInjected: boolean
  isVM: boolean
  isForkedState: boolean
  isForkedVM: boolean
  title: string
  init: () => Promise<void>
  provider:{
    sendAsync: (payload: any) => Promise<void>
  }
}

export class Blockchain extends Plugin {
  active: boolean
  event: EventManager
  events: EventEmitter
  executionContext: ExecutionContext
  config: Config
  txRunner: any // TxRunner
  networkcallid: number
  networkStatus: {
    network: {
      name: string
      id: string
    }
    error?: string
  }
  providers: {[key: string]: VMProvider | InjectedProvider | NodeProvider }
  transactionContextAPI: TransactionContextAPI
  registeredPluginEvents: string[]
  defaultPinnedProviders: string[]
  pinnedProviders: string[]

  // NOTE: the config object will need to be refactored out in remix-lib
  constructor(config: Config) {
    super(profile)
    this.active = false
    this.event = new EventManager()
    this.executionContext = new ExecutionContext()

    this.events = new EventEmitter()
    this.config = config
    const web3Runner = new TxRunnerWeb3(
      {
        config: this.config,
        detectNetwork: (cb) => {
          this.executionContext.detectNetwork(cb)
        },
        isVM: () => {
          return this.executionContext.isVM()
        },
        personalMode: () => {
          return this.getProvider() === 'web3' ? this.config.get('settings/personal-mode') : false
        }
      },
      (_) => this.executionContext.web3(),
      (_) => this.executionContext.currentblockGasLimit()
    )
    this.txRunner = new TxRunner(web3Runner, {})

    this.networkcallid = 0
    this.networkStatus = { network: { name: ' - ', id: ' - ' } }
    this.registeredPluginEvents = []
    this.defaultPinnedProviders = ['vm-cancun', 'vm-mainnet-fork', 'walletconnect', 'injected-MetaMask', 'basic-http-provider', 'hardhat-provider', 'foundry-provider']
    this.pinnedProviders = []
    this.setupEvents()
    this.setupProviders()
  }

  _triggerEvent(name, args) {
    if (!this.active) return
    this.event.trigger(name, args)
    this.emit(name, ...args)
  }

  onActivation() {
    this.active = true
    this.on('manager', 'pluginActivated', (plugin) => {
      if (plugin && plugin.name && (plugin.name.startsWith('injected') || plugin.name === 'walletconnect')) {
        this.registeredPluginEvents.push(plugin.name)
        this.on(plugin.name, 'chainChanged', () => {
          this.detectNetwork((error, network) => {
            this.networkStatus = { network, error }
            this._triggerEvent('networkStatus', [this.networkStatus])
          })
        })
      }
    })

    this.on('environmentExplorer', 'providerPinned', (name, provider) => {
      this.emit('shouldAddProvidertoUdapp', name, provider)
      this.pinnedProviders.push(name)
      this.call('config', 'setAppParameter', 'settings/pinned-providers', JSON.stringify(this.pinnedProviders))
      _paq.push(['trackEvent', 'blockchain', 'providerPinned', name])
      this.emit('providersChanged')
    })
    // used to pin and select newly created forked state provider
    this.on('udapp', 'forkStateProviderAdded', (providerName) => {
      const name = `vm-fs-${providerName}`
      this.emit('shouldAddProvidertoUdapp', name, this.getProviderObjByName(name))
      this.pinnedProviders.push(name)
      this.call('config', 'setAppParameter', 'settings/pinned-providers', JSON.stringify(this.pinnedProviders))
      _paq.push(['trackEvent', 'blockchain', 'providerPinned', name])
      this.emit('providersChanged')
      this.changeExecutionContext({ context: name }, null, null, null)
      this.call('notification', 'toast', `New environment '${providerName}' created with forked state.`)
    })

    this.on('environmentExplorer', 'providerUnpinned', (name, provider) => {
      this.emit('shouldRemoveProviderFromUdapp', name, provider)
      const index = this.pinnedProviders.indexOf(name)
      this.pinnedProviders.splice(index, 1)
      this.call('config', 'setAppParameter', 'settings/pinned-providers', JSON.stringify(this.pinnedProviders))
      _paq.push(['trackEvent', 'blockchain', 'providerUnpinned', name])
      this.emit('providersChanged')
    })

    this.call('config', 'getAppParameter', 'settings/pinned-providers').then((providers) => {
      if (!providers) {
        this.call('config', 'setAppParameter', 'settings/pinned-providers', JSON.stringify(this.defaultPinnedProviders))
        this.pinnedProviders = this.defaultPinnedProviders
      } else {
        this.pinnedProviders = JSON.parse(providers)
      }
    }).catch((error) => { console.log(error) })
  }

  onDeactivation() {
    this.active = false
    for (const pluginName of this.registeredPluginEvents) {
      this.off(pluginName, 'chainChanged')
    }
  }

  setupEvents() {
    this.executionContext.event.register('contextChanged', async (context) => {
      // reset environment to last known state of the context
      await this.loadContext(context)
      this._triggerEvent('contextChanged', [context])
      this.detectNetwork((error, network) => {
        this.networkStatus = { network, error }
        this._triggerEvent('networkStatus', [this.networkStatus])
      })
    })

    this.executionContext.event.register('providerAdded', (network) => {
      this._triggerEvent('providerAdded', [network])
    })

    this.executionContext.event.register('providerRemoved', (name) => {
      this._triggerEvent('providerRemoved', [name])
    })

    setInterval(() => {
      this.detectNetwork((error, network) => {
        this.networkStatus = { network, error }
        this._triggerEvent('networkStatus', [this.networkStatus])
      })
    }, 30000)
  }

  getCurrentNetworkStatus() {
    return this.networkStatus
  }

  setupProviders() {
    this.providers = {}
    this.providers['vm'] = new VMProvider(this.executionContext)
    this.providers.injected = new InjectedProvider(this.executionContext)
    this.providers.web3 = new NodeProvider(this.executionContext, this.config)
  }

  getCurrentProvider() {
    const provider = this.getProvider()
    if (provider && provider.startsWith('vm')) return this.providers['vm']
    if (provider && provider.startsWith('injected')) return this.providers['injected']
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
    txFormat.buildData(
      selectedContract.name,
      selectedContract.object,
      compilerContracts,
      true,
      constructor,
      args,
      (error, data) => {
        if (error) {
          return statusCb(`creation of ${selectedContract.name} errored: ${error.message ? error.message : error.error ? error.error : error}`)
        }

        statusCb(`creation of ${selectedContract.name} pending...`)
        this.createContract(selectedContract, data, continueCb, promptCb, confirmationCb, finalCb)
      },
      statusCb,
      (data, runTxCallback) => {
        // called for libraries deployment
        this.runTx(data, confirmationCb, continueCb, promptCb, runTxCallback)
      }
    )
  }

  deployContractWithLibrary(selectedContract, args, contractMetadata, compilerContracts, callbacks, confirmationCb) {
    const { continueCb, promptCb, statusCb, finalCb } = callbacks
    const constructor = selectedContract.getConstructorInterface()
    txFormat.encodeConstructorCallAndLinkLibraries(
      selectedContract.object,
      args,
      constructor,
      contractMetadata.linkReferences,
      selectedContract.bytecodeLinkReferences,
      (error, data) => {
        if (error) {
          return statusCb(`creation of ${selectedContract.name} errored: ${error.message ? error.message : error.error ? error.error : error}`)
        }

        statusCb(`creation of ${selectedContract.name} pending...`)
        this.createContract(selectedContract, data, continueCb, promptCb, confirmationCb, finalCb)
      }
    )
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
    const continueCb = (error, continueTxExecution, cancelCb) => {
      continueTxExecution()
    }
    const promptCb = (okCb, cancelCb) => {
      okCb()
    }
    const finalCb = async (error, txResult, address, returnValue) => {
      if (error) {
        const log = logBuilder(error)

        _paq.push(['trackEvent', 'blockchain', 'Deploy With Proxy', 'Proxy deployment failed: ' + error])
        return this.call('terminal', 'logHtml', log)
      }
      await this.saveDeployedContractStorageLayout(implementationContractObject, address, networkInfo)
      this.events.emit('newProxyDeployment', address, new Date().toISOString(), implementationContractObject.contractName)
      _paq.push(['trackEvent', 'blockchain', 'Deploy With Proxy', 'Proxy deployment successful'])
      this.call('udapp', 'addInstance', addressToString(address), implementationContractObject.abi, implementationContractObject.name, implementationContractObject)
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
    let networkInfo
    const confirmationCb = (network, tx, gasEstimation, continueTxExecution, cancelCb) => {
      // continue using original authorization given by user
      networkInfo = network
      continueTxExecution(null)
    }
    const continueCb = (error, continueTxExecution, cancelCb) => {
      continueTxExecution()
    }
    const promptCb = (okCb, cancelCb) => {
      okCb()
    }
    const finalCb = async (error, txResult, address, returnValue) => {
      if (error) {
        const log = logBuilder(error)

        _paq.push(['trackEvent', 'blockchain', 'Upgrade With Proxy', 'Upgrade failed'])
        return this.call('terminal', 'logHtml', log)
      }
      await this.saveDeployedContractStorageLayout(newImplementationContractObject, proxyAddress, networkInfo)
      _paq.push(['trackEvent', 'blockchain', 'Upgrade With Proxy', 'Upgrade Successful'])
      this.call('udapp', 'addInstance', addressToString(proxyAddress), newImplementationContractObject.abi, newImplementationContractObject.name, newImplementationContractObject)
    }
    this.runTx(args, confirmationCb, continueCb, promptCb, finalCb)
  }

  async saveDeployedContractStorageLayout(contractObject, proxyAddress, networkInfo) {
    const { contractName, implementationAddress } = contractObject
    const networkName = networkInfo.name === 'custom' ? networkInfo.name + '-' + networkInfo.id : networkInfo.name
    const hasPreviousDeploys = await this.call('fileManager', 'exists', `.deploys/upgradeable-contracts/${networkName}/UUPS.json`)
    // TODO: make deploys folder read only.
    if (hasPreviousDeploys) {
      const deployments = await this.call('fileManager', 'readFile', `.deploys/upgradeable-contracts/${networkName}/UUPS.json`)
      const parsedDeployments = JSON.parse(deployments)
      const proxyDeployment = parsedDeployments.deployments[proxyAddress]

      if (proxyDeployment) {
        const oldImplementationAddress = proxyDeployment.implementationAddress
        const hasPreviousBuild = await this.call('fileManager', 'exists', `.deploys/upgradeable-contracts/${networkName}/solc-${oldImplementationAddress}.json`)

        if (hasPreviousBuild) await this.call('fileManager', 'remove', `.deploys/upgradeable-contracts/${networkName}/solc-${oldImplementationAddress}.json`)
      }
      parsedDeployments.deployments[proxyAddress] = {
        date: new Date().toISOString(),
        contractName: contractName,
        fork: networkInfo.currentFork,
        implementationAddress: implementationAddress,
        solcOutput: contractObject.compiler.data,
        solcInput: contractObject.compiler.source
      }
      await this.call(
        'fileManager',
        'writeFile',
        `.deploys/upgradeable-contracts/${networkName}/solc-${implementationAddress}.json`,
        JSON.stringify(
          {
            solcInput: contractObject.compiler.source,
            solcOutput: contractObject.compiler.data
          },
          null,
          2
        )
      )
      await this.call('fileManager', 'writeFile', `.deploys/upgradeable-contracts/${networkName}/UUPS.json`, JSON.stringify(parsedDeployments, null, 2))
    } else {
      await this.call(
        'fileManager',
        'writeFile',
        `.deploys/upgradeable-contracts/${networkName}/solc-${implementationAddress}.json`,
        JSON.stringify(
          {
            solcInput: contractObject.compiler.source,
            solcOutput: contractObject.compiler.data
          },
          null,
          2
        )
      )
      await this.call(
        'fileManager',
        'writeFile',
        `.deploys/upgradeable-contracts/${networkName}/UUPS.json`,
        JSON.stringify(
          {
            id: networkInfo.id,
            network: networkInfo.name,
            deployments: {
              [proxyAddress]: {
                date: new Date().toISOString(),
                contractName: contractName,
                fork: networkInfo.currentFork,
                implementationAddress: implementationAddress
              }
            }
          },
          null,
          2
        )
      )
    }
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

    this.runTx({ data: data, useCall: false }, confirmationCb, continueCb, promptCb, (error, txResult, address) => {
      if (error) {
        return finalCb(`creation of ${selectedContract.name} errored: ${error.message ? error.message : error.error ? error.error : error}`)
      }
      if (txResult.receipt.status === false || txResult.receipt.status === '0x0' || txResult.receipt.status === 0) {
        return finalCb(`creation of ${selectedContract.name} errored: transaction execution failed`)
      }
      finalCb(null, selectedContract, address)
    })
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
      return fromWei(typeConversion.toInt(value), unit || 'ether')
    }
    return fromWei(value.toString(10), unit || 'ether')
  }

  toWei(value, unit) {
    return toWei(value, unit || 'gwei')
  }

  calculateFee(gas, gasPrice, unit?) {
    return toBigInt(gas) * toBigInt(toWei(gasPrice.toString(10) as string, unit || 'gwei'))
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
    if (context.context === 'item-another-chain') {
      this.call('manager', 'activatePlugin', 'environmentExplorer').then(() => this.call('tabs', 'focus', 'environmentExplorer'))
    } else {
      return this.executionContext.executionContextChange(context, null, confirmCb, infoCb, cb)
    }
  }

  detectNetwork(cb) {
    return this.executionContext.detectNetwork(cb)
  }

  getProvider() {
    return this.executionContext.getProvider()
  }

  getProviderObjByName(name) {
    const allProviders = this.getAllProviders()
    return allProviders[name]
  }

  getInjectedWeb3Address() {
    return this.executionContext.getSelectedAddress()
  }

  /**
   * return the fork name applied to the current environment
   * @return {String} - fork name
   */
  getCurrentFork() {
    return this.executionContext.getCurrentFork()
  }

  signMessage(message, account, passphrase, cb) {
    this.getCurrentProvider().signMessage(message, account, passphrase, cb)
  }

  web3VM() {
    return (this.providers.vm as VMProvider).web3
  }

  web3() {
    const isVM = this.executionContext.isVM()
    if (isVM) {
      return (this.providers.vm as VMProvider).web3
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
    txFormat.buildData(
      contractName,
      contractAbi,
      {},
      false,
      funABI,
      callType,
      (error, data) => {
        if (error) {
          return logCallback(`${logMsg} errored: ${error.message ? error.message : error.error ? error.error : error}`)
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
            return logCallback(`${logMsg} errored: ${error.message ? error.message : error.error ? error.error : error}`)
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
        this.runTx(data, confirmationCb, runTxCallback, promptCb, () => {
          /* Do nothing. */
        })
      }
    )
  }

  context() {
    return this.executionContext.isVM() ? 'memory' : 'blockchain'
  }

  // NOTE: the config is only needed because executionContext.init does
  async resetAndInit(config: Config, transactionContextAPI: TransactionContextAPI) {
    this.transactionContextAPI = transactionContextAPI
    this.executionContext.init(config)
    this.executionContext.stopListenOnLastBlock()
    this.executionContext.listenOnLastBlock()
  }

  addProvider(provider: Provider) {
    if (this.pinnedProviders.includes(provider.name)) this.emit('shouldAddProvidertoUdapp', provider.name, provider)
    this.executionContext.addProvider(provider)
    this.emit('providersChanged')
  }

  removeProvider(name) {
    if (this.pinnedProviders.includes(name)) this.emit('shouldRemoveProviderFromUdapp', name, this.getProviderObjByName(name))
    this.executionContext.removeProvider(name)
    this.emit('providersChanged')
  }

  getAllProviders() {
    return this.executionContext.getAllProviders()
  }

  getPinnedProviders() {
    return this.pinnedProviders
  }

  // TODO : event should be triggered by Udapp instead of TxListener
  /** Listen on New Transaction. (Cannot be done inside constructor because txlistener doesn't exist yet) */
  startListening(txlistener) {
    txlistener.event.register('newTransaction', (tx, receipt) => {
      this.events.emit('newTransaction', tx, receipt)
    })
  }

  async loadContext(context: string) {
    const saveEvmState = this.config.get('settings/save-evm-state')

    if (saveEvmState) {
      const contextExists = await this.call('fileManager', 'exists', `.states/${context}/state.json`)
      if (contextExists) {
        const stateDb = await this.call('fileManager', 'readFile', `.states/${context}/state.json`)
        await this.getCurrentProvider().resetEnvironment(stateDb)
      } else {
        // check if forked VM state is used as provider
        const stateName = context.replace('vm-fs-', '')
        const contextExists = await this.call('fileManager', 'exists', `.states/forked_states/${stateName}.json`)
        if (contextExists) {
          const stateDb = await this.call('fileManager', 'readFile', `.states/forked_states/${stateName}.json`)
          await this.getCurrentProvider().resetEnvironment(stateDb)
        } else await this.getCurrentProvider().resetEnvironment()
      }
    } else {
      await this.getCurrentProvider().resetEnvironment()
    }

    // TODO: most params here can be refactored away in txRunner
    const web3Runner = new TxRunnerWeb3(
      {
        config: this.config,
        detectNetwork: (cb) => {
          this.executionContext.detectNetwork(cb)
        },
        isVM: () => {
          return this.executionContext.isVM()
        },
        personalMode: () => {
          return this.getProvider() === 'web3' ? this.config.get('settings/personal-mode') : false
        }
      },
      (_) => this.executionContext.web3(),
      (_) => this.executionContext.currentblockGasLimit()
    )

    web3Runner.event.register('transactionBroadcasted', (txhash) => {
      this.executionContext.detectNetwork((error, network) => {
        if (error || !network) return
        if (network.name === 'VM') return
        const viewEtherScanLink = etherScanLink(network.name, txhash)

        if (viewEtherScanLink) {
          this.call(
            'terminal',
            'logHtml',
            <a href={etherScanLink(network.name, txhash)} target="_blank">
              view on etherscan
            </a>
          )
        }
      })
    })
    this.txRunner = new TxRunner(web3Runner, {})
  }

  /**
   * Create a VM Account
   * @param {{privateKey: string, balance: string}} newAccount The new account to create
   */
  createVMAccount(newAccount) {
    if (!this.executionContext.isVM()) {
      throw new Error('plugin API does not allow creating a new account through web3 connection. Only vm mode is allowed')
    }
    return (this.providers.vm as VMProvider).createVMAccount(newAccount)
  }

  newAccount(_password, passwordPromptCb, cb) {
    return this.getCurrentProvider().newAccount(passwordPromptCb, cb)
  }

  /** Get the balance of an address, and convert wei to ether */
  getBalanceInEther(address) {
    return this.getCurrentProvider().getBalanceInEther(address)
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
  sendTransaction(tx: Transaction) {
    return new Promise((resolve, reject) => {
      this.executionContext.detectNetwork((error, network) => {
        tx.gasLimit = '0x0' // force using gas estimation

        if (error) return reject(error)
        if (network.name === 'Main' && network.id === '1') {
          return reject(new Error('It is not allowed to make this action against mainnet'))
        }

        this.txRunner.rawRun(
          tx,
          (network, tx, gasEstimation, continueTxExecution, cancelCb) => {
            continueTxExecution()
          },
          (error, continueTxExecution, cancelCb) => {
            if (error) {
              reject(error)
            } else {
              continueTxExecution()
            }
          },
          (okCb, cancelCb) => {
            okCb()
          },
          async (error, result) => {
            if (error) return reject(error)
            try {
              if (this.executionContext.isVM()) {
                const execResult = await this.web3().remix.getExecutionResultFromSimulator(result.transactionHash)
                resolve(resultToRemixTx(result, execResult))
              } else resolve(resultToRemixTx(result))
            } catch (e) {
              reject(e)
            }
          }
        )
      })
    })
  }

  async runTx(args, confirmationCb, continueCb, promptCb, cb) {
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
            if (!address)
              return reject(
                '"from" is not defined. Please make sure an account is selected. If you are using a public node, it is likely that no account will be provided. In that case, add the public node to your injected provider (type Metamask) and use injected provider in Remix.'
              )
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
        let fromAddress
        let value
        let gasLimit
        try {
          fromAddress = await getAccount()
          value = await queryValue()
          gasLimit = await getGasLimit()
        } catch (e) {
          reject(e)
          return
        }

        const tx = {
          to: args.to,
          data: args.data.dataHex,
          useCall: args.useCall,
          from: fromAddress,
          value: value,
          gasLimit: gasLimit,
          timestamp: args.data.timestamp
        }
        const payLoad = {
          funAbi: args.data.funAbi,
          funArgs: args.data.funArgs,
          contractBytecode: args.data.contractBytecode,
          contractName: args.data.contractName,
          contractABI: args.data.contractABI,
          linkReferences: args.data.linkReferences
        }

        if (!tx.timestamp) tx.timestamp = Date.now()
        const timestamp = tx.timestamp

        this._triggerEvent('initiatingTransaction', [timestamp, tx, payLoad])
        try {
          this.txRunner.rawRun(tx, confirmationCb, continueCb, promptCb, async (error, result) => {
            if (error) {
              return reject(error)
            }

            const isVM = this.executionContext.isVM()
            if (isVM && tx.useCall) {
              try {
                result.transactionHash = await this.web3().remix.getHashFromTagBySimulator(timestamp)
              } catch (e) {
                console.log('unable to retrieve back the "call" hash', e)
              }
            }
            const eventName = tx.useCall ? 'callExecuted' : 'transactionExecuted'

            this._triggerEvent(eventName, [error, tx.from, tx.to, tx.data, tx.useCall, result, timestamp, payLoad])
            return resolve({ result, tx })
          })
        } catch (err) {
          return reject(err)
        }
      })
    }
    try {
      const transaction = await runTransaction()
      const txResult = (transaction as any).result
      const tx = (transaction as any).tx
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
        if (!tx.useCall && this.config.get('settings/save-evm-state')) {
          try {
            let state = await this.executionContext.getStateDetails()
            const provider = this.executionContext.getProvider()
            // Check if provider is forked VM state
            if (provider.startsWith('vm-fs-')) {
              const stateName = provider.replace('vm-fs-', '')
              const stateFileExists = this.call('fileManager', 'exists', `.states/forked_states/${stateName}.json`)
              if (stateFileExists) {
                let stateDetails = await this.call('fileManager', 'readFile', `.states/forked_states/${stateName}.json`)
                stateDetails = JSON.parse(stateDetails)
                state = JSON.parse(state)
                state['stateName'] = stateDetails.stateName
                state['forkName'] = stateDetails.forkName
                state['savingTimestamp'] = stateDetails.savingTimestamp
                state = JSON.stringify(state, null, 2)
              }
              this.call('fileManager', 'writeFile', `.states/forked_states/${stateName}.json`, state)
            }
            else this.call('fileManager', 'writeFile', `.states/${provider}/state.json`, state)
          } catch (e) {
            console.error(e)
          }
        }

        const hhlogs = await this.web3().remix.getHHLogsForTx(txResult.transactionHash)
        if (hhlogs && hhlogs.length) {
          const finalLogs = (
            <div>
              <div>
                <b>console.log:</b>
              </div>
              {hhlogs.map((log) => {
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
                return <div>{formattedLog}</div>
              })}
            </div>
          )
          _paq.push(['trackEvent', 'udapp', 'hardhat', 'console.log'])
          this.call('terminal', 'logHtml', finalLogs)
        }
        execResult = await this.web3().remix.getExecutionResultFromSimulator(txResult.transactionHash)
        if (execResult) {
          // if it's not the VM, we don't have return value. We only have the transaction, and it does not contain the return value.
          returnValue = execResult
            ? toBytes(execResult.returnValue)
            : toBytes(addHexPrefix(txResult.result) || '0x0000000000000000000000000000000000000000000000000000000000000000')
          const compiledContracts = await this.call('compilerArtefacts', 'getAllContractDatas')
          const vmError = txExecution.checkError({ errorMessage: execResult.exceptionError ? execResult.exceptionError.error : '', errorData: execResult.returnValue }, compiledContracts)
          if (vmError.error) {
            return cb(vmError.message)
          }
        }
      }
      if (!isVM && tx && tx.useCall) {
        returnValue = toBytes(addHexPrefix(txResult.result))
      }

      let address = null
      if (txResult && txResult.receipt) {
        address = txResult.receipt.contractAddress
      }

      cb(null, txResult, address, returnValue)
    } catch (error) {
      const buildError = async (errorMessage, errorData) => {
        const compiledContracts = await this.call('compilerArtefacts', 'getAllContractDatas')
        return txExecution.checkError({ errorMessage, errorData }, compiledContracts)
      }
      let errorMessage
      let errorData
      if (error.innerError) {
        errorMessage = error.innerError.message
        errorData = error.innerError.data
        cb((await buildError(errorMessage, errorData)).message)
      } else if (error.message || error.data) {
        errorMessage = error.message
        errorData = error.data
        cb((await buildError(errorMessage, errorData)).message)
      } else
        cb(error)
    }
  }
}
