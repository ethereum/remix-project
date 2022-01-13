// eslint-disable-next-line no-unused-vars
import React from 'react'
import * as ethJSUtil from 'ethereumjs-util'
import Web3 from 'web3'
import { addressToString, createNonClashingNameAsync, shortenAddress } from '@remix-ui/helper'
import { addNewInstance, addProvider, clearAllInstances, clearRecorderCount, displayNotification, displayPopUp, fetchAccountsListFailed, fetchAccountsListRequest, fetchAccountsListSuccess, fetchContractListSuccess, hidePopUp, removeExistingInstance, removeProvider, resetUdapp, setBaseFeePerGas, setConfirmSettings, setCurrentFile, setDecodedResponse, setEnvToasterContent, setExecutionEnvironment, setExternalEndpoint, setGasLimit, setGasPrice, setGasPriceStatus, setLoadType, setMatchPassphrase, setMaxFee, setMaxPriorityFee, setNetworkName, setPassphrase, setPathToScenario, setRecorderCount, setSelectedAccount, setSendUnit, setSendValue, setTxFeeContent, setWeb3Dialog } from './payload'
import { RunTab } from '../types/run-tab'
import { CompilerAbstract } from '@remix-project/remix-solidity'
import * as remixLib from '@remix-project/remix-lib'
import { ContractData, FuncABI, MainnetPrompt } from '../types'

const txFormat = remixLib.execution.txFormat
declare global {
  interface Window {
    _paq: any
  }
}

const _paq = window._paq = window._paq || []  //eslint-disable-line
const txHelper = remixLib.execution.txHelper
let plugin: RunTab, dispatch: React.Dispatch<any>

export const initRunTab = (udapp: RunTab) => async (reducerDispatch: React.Dispatch<any>) => {
  plugin = udapp
  dispatch = reducerDispatch
  resetAndInit()
  setupEvents()
  setInterval(() => {
    fillAccountsList()
  }, 1000)
}

const setupEvents = () => {
  plugin.blockchain.events.on('newTransaction', (tx, receipt) => {
    plugin.emit('newTransaction', tx, receipt)
  })

  plugin.blockchain.event.register('transactionExecuted', (error, from, to, data, lookupOnly, txResult) => {
    if (!lookupOnly) dispatch(setSendValue('0'))
    if (error) return
    updateAccountBalances()
  })

  plugin.blockchain.event.register('contextChanged', (context, silent) => {
    setFinalContext()
  })

  plugin.blockchain.event.register('networkStatus', ({ error, network }) => {
    if (error) {
      const netUI = 'can\'t detect network '
      setNetworkNameFromProvider(netUI)

      return
    }
    const networkProvider = plugin.networkModule.getNetworkProvider.bind(plugin.networkModule)
    const netUI = (networkProvider() !== 'vm') ? `${network.name} (${network.id || '-'}) network` : 'VM'

    setNetworkNameFromProvider(netUI)
  })

  plugin.blockchain.event.register('addProvider', provider => addExternalProvider(provider))

  plugin.blockchain.event.register('removeProvider', name => removeExternalProvider(name))

  plugin.on('manager', 'pluginActivated', addPluginProvider.bind(plugin))

  plugin.on('manager', 'pluginDeactivated', removePluginProvider.bind(plugin))

  plugin.on('solidity', 'compilationFinished', (file, source, languageVersion, data) => broadcastCompilationResult(file, source, languageVersion, data))

  plugin.on('vyper', 'compilationFinished', (file, source, languageVersion, data) => broadcastCompilationResult(file, source, languageVersion, data))

  plugin.on('lexon', 'compilationFinished', (file, source, languageVersion, data) => broadcastCompilationResult(file, source, languageVersion, data))

  plugin.on('yulp', 'compilationFinished', (file, source, languageVersion, data) => broadcastCompilationResult(file, source, languageVersion, data))

  plugin.on('optimism-compiler', 'compilationFinished', (file, source, languageVersion, data) => broadcastCompilationResult(file, source, languageVersion, data))

  plugin.on('udapp', 'setEnvironmentModeReducer', (env: { context: string, fork: string }, from: string) => {
    dispatch(displayPopUp(plugin.REACT_API.envToasterContent(env, from)))
    setExecutionContext(env, plugin.REACT_API.web3Dialog())
  })

  plugin.on('filePanel', 'setWorkspace', () => {
    dispatch(resetUdapp())
    resetAndInit()
  })

  plugin.fileManager.events.on('currentFileChanged', (currentFile: string) => {
    if (/.(.abi)$/.exec(currentFile)) {
      dispatch(setLoadType('abi'))
    } else if (/.(.sol)$/.exec(currentFile) ||
        /.(.vy)$/.exec(currentFile) || // vyper
        /.(.lex)$/.exec(currentFile) || // lexon
        /.(.contract)$/.exec(currentFile)) {
      dispatch(setLoadType('sol'))
    } else {
      dispatch(setLoadType('other'))
    }
  })

  plugin.recorder.event.register('recorderCountChange', (count) => {
    dispatch(setRecorderCount(count))
  })

  plugin.event.register('cleared', () => {
    dispatch(clearRecorderCount())
  })
}

export const initWebDialogs = (envToasterContent: (env: { context: string, fork: string }, from: string) => void, web3Dialog: () => void) => async (dispatch: React.Dispatch<any>) => {
  dispatch(setEnvToasterContent(envToasterContent))
  dispatch(setWeb3Dialog(web3Dialog))
}

const updateAccountBalances = () => {
  const accounts = plugin.REACT_API.accounts.loadedAccounts

  Object.keys(accounts).map((value) => {
    plugin.blockchain.getBalanceInEther(value, (err, balance) => {
      if (err) return
      const updated = shortenAddress(value, balance)

      accounts[value] = updated
    })
  })
  dispatch(fetchAccountsListSuccess(accounts))
}

const fillAccountsList = async () => {
  try {
    dispatch(fetchAccountsListRequest())
    const promise = plugin.blockchain.getAccounts()

    promise.then(async (accounts: string[]) => {
      const loadedAccounts = {}

      if (!accounts) accounts = []
      // allSettled is undefined..
      // so the current promise (all) will finish when:
      // - all the promises resolve
      // - at least one reject
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
      await (Promise as any).all(accounts.map((account) => {
        return new Promise((resolve, reject) => {
          plugin.blockchain.getBalanceInEther(account, (err, balance) => {
            if (err) return reject(err)
            const updated = shortenAddress(account, balance)

            loadedAccounts[account] = updated
            resolve(account)
          })
        })
      }))
      dispatch(fetchAccountsListSuccess(loadedAccounts))
    }).catch((e) => {
      dispatch(fetchAccountsListFailed(e.message))
    })
  } catch (e) {
    dispatch(displayPopUp(`Cannot get account list: ${e}`))
  }
}

export const setAccount = (account: string) => {
  dispatch(setSelectedAccount(account))
}

export const setUnit = (unit: 'ether' | 'finney' | 'gwei' | 'wei') => {
  dispatch(setSendUnit(unit))
}

export const setGasFee = (value: number) => {
  dispatch(setGasLimit(value))
}

const addPluginProvider = (profile) => {
  if (profile.kind === 'provider') {
    ((profile, app) => {
      const web3Provider = {
        async sendAsync (payload, callback) {
          try {
            const result = await app.call(profile.name, 'sendAsync', payload)
            callback(null, result)
          } catch (e) {
            callback(e)
          }
        }
      }
      app.blockchain.addProvider({ name: profile.displayName, provider: web3Provider })
    })(profile, plugin)
  }
}

const removePluginProvider = (profile) => {
  if (profile.kind === 'provider') plugin.blockchain.removeProvider(profile.displayName)
}

const setFinalContext = () => {
  // set the final context. Cause it is possible that this is not the one we've originaly selected
  const value = _getProviderDropdownValue()

  setExecEnv(value)
  clearInstances()
}

const _getProviderDropdownValue = (): string => {
  const provider = plugin.blockchain.getProvider()
  const fork = plugin.blockchain.getCurrentFork()

  return provider === 'vm' ? provider + '-' + fork : provider
}

const setExecEnv = (env: string) => {
  dispatch(setExecutionEnvironment(env))
}

export const setNetworkNameFromProvider = (networkName: string) => {
  dispatch(setNetworkName(networkName))
}

const addExternalProvider = (network) => {
  dispatch(addProvider(network))
  dispatch(displayPopUp(`${network.name} provider added`))
}

const removeExternalProvider = (name) => {
  dispatch(removeProvider(name))
}

export const setExecutionContext = (executionContext: { context: string, fork: string }, displayContent: JSX.Element) => {
  plugin.blockchain.changeExecutionContext(executionContext, () => {
    dispatch(displayNotification('External node request', displayContent, 'OK', 'Cancel', () => {
      plugin.blockchain.setProviderFromEndpoint(plugin.REACT_API.externalEndpoint, executionContext, (alertMsg) => {
        if (alertMsg) dispatch(displayPopUp(alertMsg))
        setFinalContext()
      })
    }, () => { setFinalContext() }))
  }, (alertMsg) => {
    dispatch(displayPopUp(alertMsg))
  }, () => { setFinalContext() })
}

export const setWeb3Endpoint = (endpoint: string) => {
  dispatch(setExternalEndpoint(endpoint))
}

export const clearPopUp = async () => {
  dispatch(hidePopUp())
}

export const createNewBlockchainAccount = async (cbMessage: JSX.Element) => {
  plugin.blockchain.newAccount(
    '',
    (cb) => {
      dispatch(displayNotification('Enter Passphrase', cbMessage, 'OK', 'Cancel', async () => {
        if (plugin.REACT_API.passphrase === plugin.REACT_API.matchPassphrase) {
          cb(plugin.REACT_API.passphrase)
        } else {
          dispatch(displayNotification('Error', 'Passphase does not match', 'OK', null))
        }
        setPassphrase('')
        setMatchPassphrase('')
      }, () => {}))
    },
    async (error, address) => {
      if (error) {
        return dispatch(displayPopUp('Cannot create an account: ' + error))
      }
      dispatch(displayPopUp(`account ${address} created`))
      await fillAccountsList()
    }
  )
}

export const setPassphrasePrompt = (passphrase: string) => {
  dispatch(setPassphrase(passphrase))
}

export const setMatchPassphrasePrompt = (passphrase: string) => {
  dispatch(setMatchPassphrase(passphrase))
}

export const signMessageWithAddress = (account: string, message: string, modalContent: (hash: string, data: string) => JSX.Element, passphrase?: string) => {
  plugin.blockchain.signMessage(message, account, passphrase, (err, msgHash, signedData) => {
    if (err) {
      return displayPopUp(err)
    }
    dispatch(displayNotification('Signed Message', modalContent(msgHash, signedData), 'OK', null, () => {}, null))
  })
}

const broadcastCompilationResult = (file, source, languageVersion, data) => {
  // TODO check whether the tab is configured
  const compiler = new CompilerAbstract(languageVersion, data, source)

  plugin.compilersArtefacts[languageVersion] = compiler
  plugin.compilersArtefacts.__last = compiler

  const contracts = getCompiledContracts(compiler).map((contract) => {
    return { name: languageVersion, alias: contract.name, file: contract.file }
  })

  dispatch(fetchContractListSuccess(contracts))
  dispatch(setCurrentFile(file))
}

const loadContractFromAddress = (address, confirmCb, cb) => {
  if (/.(.abi)$/.exec(plugin.config.get('currentFile'))) {
    confirmCb(() => {
      let abi
      try {
        abi = JSON.parse(plugin.editor.currentContent())
      } catch (e) {
        return cb('Failed to parse the current file as JSON ABI.')
      }
      _paq.push(['trackEvent', 'udapp', 'AtAddressLoadWithABI'])
      cb(null, 'abi', abi)
    })
  } else {
    _paq.push(['trackEvent', 'udapp', 'AtAddressLoadWithArtifacts'])
    cb(null, 'instance')
  }
}

const getCompiledContracts = (compiler) => {
  const contracts = []

  compiler.visitContracts((contract) => {
    contracts.push(contract)
  })
  return contracts
}

export const getSelectedContract = (contractName: string, compilerAtributeName: string) => {
  if (!contractName) return null
  const compiler = plugin.compilersArtefacts[compilerAtributeName]

  if (!compiler) return null

  const contract = compiler.getContract(contractName)

  return {
    name: contractName,
    contract: contract,
    compiler: compiler,
    abi: contract.object.abi,
    bytecodeObject: contract.object.evm.bytecode.object,
    bytecodeLinkReferences: contract.object.evm.bytecode.linkReferences,
    object: contract.object,
    deployedBytecode: contract.object.evm.deployedBytecode,
    getConstructorInterface: () => {
      return txHelper.getConstructorInterface(contract.object.abi)
    },
    getConstructorInputs: () => {
      const constructorInteface = txHelper.getConstructorInterface(contract.object.abi)

      return txHelper.inputParametersDeclarationToString(constructorInteface.inputs)
    },
    isOverSizeLimit: () => {
      const deployedBytecode = contract.object.evm.deployedBytecode

      return (deployedBytecode && deployedBytecode.object.length / 2 > 24576)
    },
    metadata: contract.object.metadata
  }
}

const getCompilerContracts = () => {
  return plugin.compilersArtefacts.__last.getData().contracts
}

const terminalLogger = (view: JSX.Element) => {
  plugin.call('terminal', 'logHtml', view)
}

const confirmationHandler = (confirmDialogContent: MainnetPrompt, network, tx, gasEstimation, continueTxExecution, cancelCb) => {
  if (network.name !== 'Main') {
    return continueTxExecution(null)
  }
  const amount = plugin.blockchain.fromWei(tx.value, true, 'ether')
  const content = confirmDialogContent(tx, network, amount, gasEstimation, plugin.blockchain.determineGasFees(tx), plugin.blockchain.determineGasPrice.bind(plugin.blockchain))

  dispatch(displayNotification('Confirm transaction', content, 'Confirm', 'Cancel', () => {
    plugin.blockchain.config.setUnpersistedProperty('doNotShowTransactionConfirmationAgain', plugin.REACT_API.confirmSettings)
    // TODO: check if this is check is still valid given the refactor
    if (!plugin.REACT_API.gasPriceStatus) {
      cancelCb('Given transaction fee is not correct')
    } else {
      continueTxExecution({ maxFee: plugin.REACT_API.maxFee, maxPriorityFee: plugin.REACT_API.maxPriorityFee, baseFeePerGas: plugin.REACT_API.baseFeePerGas, gasPrice: plugin.REACT_API.gasPrice })
    }
  }, () => {
    return cancelCb('Transaction canceled by user.')
  }))
}

const getConfirmationCb = (confirmDialogContent: MainnetPrompt) => {
  // this code is the same as in recorder.js. TODO need to be refactored out
  return (network, tx, gasEstimation, continueTxExecution, cancelCb) => {
    confirmationHandler(confirmDialogContent, network, tx, gasEstimation, continueTxExecution, cancelCb)
  }
}

const continueHandler = (gasEstimationPrompt: (msg: string) => JSX.Element, error, continueTxExecution, cancelCb) => {
  if (error) {
    const msg = typeof error !== 'string' ? error.message : error

    dispatch(displayNotification('Gas estimation failed', gasEstimationPrompt(msg), 'Send Transaction', 'Cancel Transaction', () => {
      continueTxExecution()
    }, () => {
      cancelCb()
    }))
  } else {
    continueTxExecution()
  }
}

const promptHandler = (passphrasePrompt, okCb, cancelCb) => {
  dispatch(displayNotification('Passphrase requested', passphrasePrompt('Personal mode is enabled. Please provide passphrase of account'), 'OK', 'Cancel', okCb, cancelCb))
}

export const createInstance = async (
  selectedContract: ContractData,
  gasEstimationPrompt: (msg: string) => JSX.Element,
  passphrasePrompt: (msg: string) => JSX.Element,
  logBuilder: (msg: string) => JSX.Element,
  publishToStorage: (storage: 'ipfs' | 'swarm',
  contract: ContractData) => void,
  mainnetPrompt: MainnetPrompt,
  isOverSizePrompt: () => JSX.Element,
  args) => {
  const statusCb = (msg: string) => {
    const log = logBuilder(msg)

    return terminalLogger(log)
  }

  const finalCb = (error, contractObject, address) => {
    if (error) {
      const log = logBuilder(error)

      return terminalLogger(log)
    }
    addInstance({ contractData: contractObject, address, name: contractObject.name })

    const data = plugin.compilersArtefacts.getCompilerAbstract(contractObject.contract.file)

    plugin.compilersArtefacts.addResolvedContract(addressToString(address), data)
    if (plugin.REACT_API.ipfsChecked) {
      _paq.push(['trackEvent', 'udapp', 'DeployAndPublish', plugin.REACT_API.networkName])
      publishToStorage('ipfs', selectedContract)
    } else {
      _paq.push(['trackEvent', 'udapp', 'DeployOnly', plugin.REACT_API.networkName])
    }
  }

  let contractMetadata
  try {
    contractMetadata = await plugin.call('compilerMetadata', 'deployMetadataOf', selectedContract.name, selectedContract.contract.file)
  } catch (error) {
    return statusCb(`creation of ${selectedContract.name} errored: ${error.message ? error.message : error}`)
  }

  const compilerContracts = getCompilerContracts()
  const confirmationCb = getConfirmationCb(mainnetPrompt)

  if (selectedContract.isOverSizeLimit()) {
    return dispatch(displayNotification('Contract code size over limit', isOverSizePrompt(), 'Force Send', 'Cancel', () => {
      deployContract(selectedContract, args, contractMetadata, compilerContracts, {
        continueCb: (error, continueTxExecution, cancelCb) => {
          continueHandler(gasEstimationPrompt, error, continueTxExecution, cancelCb)
        },
        promptCb: (okCb, cancelCb) => {
          promptHandler(passphrasePrompt, okCb, cancelCb)
        },
        statusCb,
        finalCb
      }, confirmationCb)
    }, () => {
      const log = logBuilder(`creation of ${selectedContract.name} canceled by user.`)

      return terminalLogger(log)
    }))
  }
  deployContract(selectedContract, args, contractMetadata, compilerContracts, {
    continueCb: (error, continueTxExecution, cancelCb) => {
      continueHandler(gasEstimationPrompt, error, continueTxExecution, cancelCb)
    },
    promptCb: (okCb, cancelCb) => {
      promptHandler(passphrasePrompt, okCb, cancelCb)
    },
    statusCb,
    finalCb
  }, confirmationCb)
}

const deployContract = (selectedContract, args, contractMetadata, compilerContracts, callbacks, confirmationCb) => {
  _paq.push(['trackEvent', 'udapp', 'DeployContractTo', plugin.REACT_API.networkName])
  const { statusCb } = callbacks

  if (!contractMetadata || (contractMetadata && contractMetadata.autoDeployLib)) {
    return plugin.blockchain.deployContractAndLibraries(selectedContract, args, contractMetadata, compilerContracts, callbacks, confirmationCb)
  }
  if (Object.keys(selectedContract.bytecodeLinkReferences).length) statusCb(`linking ${JSON.stringify(selectedContract.bytecodeLinkReferences, null, '\t')} using ${JSON.stringify(contractMetadata.linkReferences, null, '\t')}`)
  plugin.blockchain.deployContractWithLibrary(selectedContract, args, contractMetadata, compilerContracts, callbacks, confirmationCb)
}

export const updateGasPriceStatus = (status: boolean) => {
  dispatch(setGasPriceStatus(status))
}

export const updateConfirmSettings = (confirmation: boolean) => {
  dispatch(setConfirmSettings(confirmation))
}

export const updateMaxFee = (fee: string) => {
  dispatch(setMaxFee(fee))
}

export const updateMaxPriorityFee = (fee: string) => {
  dispatch(setMaxPriorityFee(fee))
}

export const updateBaseFeePerGas = (baseFee: string) => {
  dispatch(setBaseFeePerGas(baseFee))
}

export const updateGasPrice = (price: string) => {
  dispatch(setGasPrice(price))
}

export const updateTxFeeContent = (content: string) => {
  dispatch(setTxFeeContent(content))
}

const addInstance = (instance: { contractData?: ContractData, address: string, name: string, abi?: any, decodedResponse?: Record<number, any> }) => {
  instance.decodedResponse = {}
  dispatch(addNewInstance(instance))
}

export const removeInstance = (index: number) => {
  dispatch(removeExistingInstance(index))
}

export const clearInstances = () => {
  dispatch(clearAllInstances())
  dispatch(clearRecorderCount())
}

export const loadAddress = (contract: ContractData, address: string) => {
  if (!contract) return dispatch(displayPopUp('No compiled contracts found.'))
  loadContractFromAddress(address,
    (cb) => {
      dispatch(displayNotification('At Address', `Do you really want to interact with ${address} using the current ABI definition?`, 'OK', 'Cancel', cb, null))
    },
    (error, loadType, abi) => {
      if (error) {
        return dispatch(displayNotification('Alert', error, 'OK', null))
      }
      const compiler = plugin.REACT_API.contracts.contractList.find(item => item.alias === contract.name)
      const contractData = getSelectedContract(contract.name, compiler.name)

      if (loadType === 'abi') {
        return addInstance({ contractData, address, name: '<at address>' })
      }
      addInstance({ contractData, address, name: contract.name })
    }
  )
}

export const getContext = () => {
  return plugin.blockchain.context()
}

export const runTransactions = (
  instanceIndex: number,
  lookupOnly: boolean,
  funcABI: FuncABI,
  inputsValues: string,
  contractName: string,
  contractABI, contract,
  address,
  logMsg:string,
  logBuilder: (msg: string) => JSX.Element,
  mainnetPrompt: MainnetPrompt,
  gasEstimationPrompt: (msg: string) => JSX.Element,
  passphrasePrompt: (msg: string) => JSX.Element,
  funcIndex?: number) => {
  let callinfo = ''
  if (lookupOnly) callinfo = 'call'
  else if (funcABI.type === 'fallback' || funcABI.type === 'receive') callinfo = 'lowLevelInteracions'
  else callinfo = 'transact'
  _paq.push(['trackEvent', 'udapp', callinfo, plugin.blockchain.getCurrentNetworkStatus().network.name])

  const params = funcABI.type !== 'fallback' ? inputsValues : ''
  plugin.blockchain.runOrCallContractMethod(
    contractName,
    contractABI,
    funcABI,
    contract,
    inputsValues,
    address,
    params,
    lookupOnly,
    logMsg,
    (msg) => {
      const log = logBuilder(msg)

      return terminalLogger(log)
    },
    (returnValue) => {
      const response = txFormat.decodeResponse(returnValue, funcABI)

      dispatch(setDecodedResponse(instanceIndex, response, funcIndex))
    },
    (network, tx, gasEstimation, continueTxExecution, cancelCb) => {
      confirmationHandler(mainnetPrompt, network, tx, gasEstimation, continueTxExecution, cancelCb)
    },
    (error, continueTxExecution, cancelCb) => {
      continueHandler(gasEstimationPrompt, error, continueTxExecution, cancelCb)
    },
    (okCb, cancelCb) => {
      promptHandler(passphrasePrompt, okCb, cancelCb)
    }
  )
}

const saveScenario = (promptCb, cb) => {
  const txJSON = JSON.stringify(plugin.recorder.getAll(), null, 2)
  const path = plugin.fileManager.currentPath()

  promptCb(path, async () => {
    const fileProvider = plugin.fileManager.fileProviderOf(path)

    if (!fileProvider) return
    const newFile = path + '/' + plugin.REACT_API.recorder.pathToScenario
    try {
      const newPath = await createNonClashingNameAsync(newFile, plugin.fileManager)
      if (!fileProvider.set(newPath, txJSON)) return cb('Failed to create file ' + newFile)
      plugin.fileManager.open(newFile)
    } catch (error) {
      if (error) return cb('Failed to create file. ' + newFile + ' ' + error)
    }
  })
}

export const storeScenario = (prompt: (msg: string) => JSX.Element) => {
  saveScenario(
    (path, cb) => {
      dispatch(displayNotification('Save transactions as scenario', prompt('Transactions will be saved in a file under ' + path), 'Ok', 'Cancel', cb, null))
    },
    (error) => {
      if (error) return dispatch(displayNotification('Alert', error, 'Ok', null))
    }
  )
}

const runScenario = (file: string, gasEstimationPrompt: (msg: string) => JSX.Element, passphrasePrompt: (msg: string) => JSX.Element, confirmDialogContent: MainnetPrompt, logBuilder: (msg: string) => JSX.Element) => {
  if (!file) return dispatch(displayNotification('Alert', 'Unable to run scenerio, no specified scenario file', 'Ok', null))

  plugin.fileManager.readFile(file).then((json) => {
    // TODO: there is still a UI dependency to remove here, it's still too coupled at this point to remove easily
    plugin.recorder.runScenario(
      json,
      (error, continueTxExecution, cancelCb) => {
        continueHandler(gasEstimationPrompt, error, continueTxExecution, cancelCb)
      }, (okCb, cancelCb) => {
        promptHandler(passphrasePrompt, okCb, cancelCb)
      }, (msg) => {
        dispatch(displayNotification('Alert', msg, 'Ok', null))
      }, (network, tx, gasEstimation, continueTxExecution, cancelCb) => {
        confirmationHandler(confirmDialogContent, network, tx, gasEstimation, continueTxExecution, cancelCb)
      }, (msg: string) => {
        const log = logBuilder(msg)

        return terminalLogger(log)
      }, (error, abi, address, contractName) => {
        if (error) {
          return dispatch(displayNotification('Alert', error, 'Ok', null))
        }
        addInstance({ name: contractName, address, abi })
      })
  }).catch((error) => dispatch(displayNotification('Alert', error, 'Ok', null)))
}

export const runCurrentScenario = (gasEstimationPrompt: (msg: string) => JSX.Element, passphrasePrompt: (msg: string) => JSX.Element, confirmDialogContent: MainnetPrompt, logBuilder: (msg: string) => JSX.Element) => {
  const file = plugin.config.get('currentFile')

  if (!file) return dispatch(displayNotification('Alert', 'A scenario file has to be selected', 'Ok', null))
  runScenario(file, gasEstimationPrompt, passphrasePrompt, confirmDialogContent, logBuilder)
}

export const updateScenarioPath = (path: string) => {
  dispatch(setPathToScenario(path))
}

export const getFuncABIInputs = (funcABI: FuncABI) => {
  return plugin.blockchain.getInputs(funcABI)
}

export const setSendTransactionValue = (value: string) => {
  dispatch(setSendValue(value))
}

const resetAndInit = () => {
  plugin.blockchain.resetAndInit(plugin.config, {
    getAddress: (cb) => {
      cb(null, plugin.REACT_API.accounts.selectedAccount)
    },
    getValue: (cb) => {
      try {
        const number = plugin.REACT_API.sendValue
        const unit = plugin.REACT_API.sendUnit

        cb(null, Web3.utils.toWei(number, unit))
      } catch (e) {
        cb(e)
      }
    },
    getGasLimit: (cb) => {
      try {
        cb(null, '0x' + new ethJSUtil.BN(plugin.REACT_API.gasLimit, 10).toString(16))
      } catch (e) {
        cb(e.message)
      }
    }
  })
}
