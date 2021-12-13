// eslint-disable-next-line no-unused-vars
import React from 'react'
import * as ethJSUtil from 'ethereumjs-util'
import Web3 from 'web3'
import { shortenAddress } from '@remix-ui/helper'
import { addProvider, displayNotification, displayPopUp, fetchAccountsListFailed, fetchAccountsListRequest, fetchAccountsListSuccess, fetchContractListSuccess, hidePopUp, removeProvider, setCurrentFile, setExecutionEnvironment, setExternalEndpoint, setGasLimit, setLoadType, setMatchPassphrase, setNetworkName, setPassphrase, setSelectedAccount, setSendUnit, setSendValue } from './payload'
import { RunTab } from '../types/run-tab'
import { CompilerAbstract } from '@remix-project/remix-solidity'
import * as remixLib from '@remix-project/remix-lib'
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
  setupEvents()
  // setInterval(() => {
  //   fillAccountsList()
  // }, 1000)
  // fillAccountsList()
  setTimeout(async () => {
    await fillAccountsList()
  }, 0)
}

const setupEvents = () => {
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

  plugin.blockchain.events.on('newTransaction', (tx, receipt) => {
    plugin.emit('newTransaction', tx, receipt)
  })

  plugin.blockchain.event.register('transactionExecuted', (error, from, to, data, lookupOnly, txResult) => {
    if (!lookupOnly) dispatch(setSendValue(0))
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
    const netUI = (networkProvider() !== 'vm') ? `${network.name} (${network.id || '-'}) network` : ''

    setNetworkNameFromProvider(netUI)
  })

  plugin.blockchain.event.register('addProvider', provider => addExternalProvider(provider))

  plugin.blockchain.event.register('removeProvider', name => removeExternalProvider(name))

  plugin.on('manager', 'pluginActivated', addPluginProvider.bind(plugin))

  plugin.on('manager', 'pluginDeactivated', removePluginProvider.bind(plugin))

  plugin.on('solidity', 'compilationFinished', (file, source, languageVersion, data) =>
    broadcastCompilationResult(file, source, languageVersion, data)
  )
  plugin.on('vyper', 'compilationFinished', (file, source, languageVersion, data) =>
    broadcastCompilationResult(file, source, languageVersion, data)
  )
  plugin.on('lexon', 'compilationFinished', (file, source, languageVersion, data) =>
    broadcastCompilationResult(file, source, languageVersion, data)
  )
  plugin.on('yulp', 'compilationFinished', (file, source, languageVersion, data) =>
    broadcastCompilationResult(file, source, languageVersion, data)
  )
  plugin.on('optimism-compiler', 'compilationFinished', (file, source, languageVersion, data) =>
    broadcastCompilationResult(file, source, languageVersion, data)
  )
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
      await (Promise as any).allSettled(accounts.map((account) => {
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
  // this.event.trigger('clearInstance', []) //check cleaIinstance event in run-tab.js
}

const _getProviderDropdownValue = (): string => {
  const provider = plugin.blockchain.getProvider()
  const fork = plugin.blockchain.getCurrentFork()

  return provider === 'vm' ? provider + '-' + fork : provider
}

const setExecEnv = (env: string) => {
  dispatch(setExecutionEnvironment(env))
}

const setNetworkNameFromProvider = (networkName: string) => {
  dispatch(setNetworkName(networkName))
}

const addExternalProvider = (network) => {
  dispatch(addProvider(network))
  dispatch(displayPopUp(`${network.name} provider added`))
}

const removeExternalProvider = (name) => {
  dispatch(removeProvider(name))
}

// eslint-disable-next-line no-undef
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
  }, setFinalContext())
}

export const setWeb3Endpoint = (endpoint: string) => {
  dispatch(setExternalEndpoint(endpoint))
}

export const clearPopUp = async () => {
  dispatch(hidePopUp())
}

// eslint-disable-next-line no-undef
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

// eslint-disable-next-line no-undef
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
  // this.enableAtAddress(success)
  // this.enableContractNames(success)
  // this.setInputParamsPlaceHolder()

  // if (success) {
  //   this.compFails.style.display = 'none'
  // } else {
  //   this.compFails.style.display = 'block'
  // }
}

const loadContractFromAddress = (address, confirmCb, cb) => {
  if (/.(.abi)$/.exec(plugin.config.get('currentFile'))) {
    confirmCb(() => {
      let abi
      try {
        abi = JSON.parse(plugin.editor.currentContent())
      } catch (e) {
        // return cb('Failed to parse the current file as JSON ABI.')
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
