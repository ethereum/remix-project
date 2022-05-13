import { ContractData, FuncABI } from "@remix-project/core-plugin"
import { RunTab } from "../types/run-tab"
import { CompilerAbstract as CompilerAbstractType } from '@remix-project/remix-solidity-ts'
import * as remixLib from '@remix-project/remix-lib'
import { DeployMode, MainnetPrompt } from "../types"
import { displayNotification, displayPopUp, setDecodedResponse } from "./payload"
import { addInstance } from "./actions"
import { addressToString, logBuilder } from "@remix-ui/helper"

declare global {
  interface Window {
    _paq: any
  }
}

const _paq = window._paq = window._paq || []  //eslint-disable-line
const txHelper = remixLib.execution.txHelper
const txFormat = remixLib.execution.txFormat

const loadContractFromAddress = (plugin: RunTab, address, confirmCb, cb) => {
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

export const getSelectedContract = (contractName: string, compiler: CompilerAbstractType): ContractData => {
  if (!contractName) return null
  // const compiler = plugin.compilersArtefacts[compilerAtributeName]

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

const getCompilerContracts = (plugin: RunTab) => {
  return plugin.compilersArtefacts.__last.getData().contracts
}

export const terminalLogger = (plugin: RunTab, view: JSX.Element) => {
  plugin.call('terminal', 'logHtml', view)
}

export const confirmationHandler = (plugin: RunTab, dispatch: React.Dispatch<any>, confirmDialogContent: MainnetPrompt, network, tx, gasEstimation, continueTxExecution, cancelCb) => {
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

const getConfirmationCb = (plugin: RunTab, dispatch: React.Dispatch<any>, confirmDialogContent: MainnetPrompt) => {
  // this code is the same as in recorder.js. TODO need to be refactored out
  return (network, tx, gasEstimation, continueTxExecution, cancelCb) => {
    confirmationHandler(plugin, dispatch, confirmDialogContent, network, tx, gasEstimation, continueTxExecution, cancelCb)
  }
}

export const continueHandler = (dispatch: React.Dispatch<any>, gasEstimationPrompt: (msg: string) => JSX.Element, error, continueTxExecution, cancelCb) => {
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

export const promptHandler = (dispatch: React.Dispatch<any>, passphrasePrompt, okCb, cancelCb) => {
  dispatch(displayNotification('Passphrase requested', passphrasePrompt('Personal mode is enabled. Please provide passphrase of account'), 'OK', 'Cancel', okCb, cancelCb))
}

export const createInstance = async (
  plugin: RunTab,
  dispatch: React.Dispatch<any>,
  selectedContract: ContractData,
  gasEstimationPrompt: (msg: string) => JSX.Element,
  passphrasePrompt: (msg: string) => JSX.Element,
  publishToStorage: (storage: 'ipfs' | 'swarm',
  contract: ContractData) => void,
  mainnetPrompt: MainnetPrompt,
  isOverSizePrompt: () => JSX.Element,
  args,
  deployMode: DeployMode[]) => {
  const isProxyDeployment = (deployMode || []).find(mode => mode === 'Deploy with Proxy')
  const statusCb = (msg: string) => {
    const log = logBuilder(msg)

    return terminalLogger(plugin, log)
  }

  const finalCb = (error, contractObject, address) => {
    if (error) {
      const log = logBuilder(error)

      return terminalLogger(plugin, log)
    }
    addInstance(dispatch, { contractData: contractObject, address, name: contractObject.name })
    const data = plugin.compilersArtefacts.getCompilerAbstract(contractObject.contract.file)

    plugin.compilersArtefacts.addResolvedContract(addressToString(address), data)
    if (plugin.REACT_API.ipfsChecked) {
      _paq.push(['trackEvent', 'udapp', 'DeployAndPublish', plugin.REACT_API.networkName])
      publishToStorage('ipfs', selectedContract)
    } else {
      _paq.push(['trackEvent', 'udapp', 'DeployOnly', plugin.REACT_API.networkName])
    }
    if (isProxyDeployment) {
      const initABI = contractObject.abi.find(abi => abi.name === 'initialize')

      plugin.call('openzeppelin-proxy', 'execute', addressToString(address), args, initABI, contractObject)
    }
  }

  let contractMetadata
  try {
    contractMetadata = await plugin.call('compilerMetadata', 'deployMetadataOf', selectedContract.name, selectedContract.contract.file)
  } catch (error) {
    return statusCb(`creation of ${selectedContract.name} errored: ${error.message ? error.message : error}`)
  }

  const compilerContracts = getCompilerContracts(plugin)
  const confirmationCb = getConfirmationCb(plugin, dispatch, mainnetPrompt)

  if (selectedContract.isOverSizeLimit()) {
    return dispatch(displayNotification('Contract code size over limit', isOverSizePrompt(), 'Force Send', 'Cancel', () => {
      deployContract(plugin, selectedContract, !isProxyDeployment ? args : '', contractMetadata, compilerContracts, {
        continueCb: (error, continueTxExecution, cancelCb) => {
          continueHandler(dispatch, gasEstimationPrompt, error, continueTxExecution, cancelCb)
        },
        promptCb: (okCb, cancelCb) => {
          promptHandler(dispatch, passphrasePrompt, okCb, cancelCb)
        },
        statusCb,
        finalCb
      }, confirmationCb)
    }, () => {
      const log = logBuilder(`creation of ${selectedContract.name} canceled by user.`)

      return terminalLogger(plugin, log)
    }))
  }
  deployContract(plugin, selectedContract, !isProxyDeployment ? args : '', contractMetadata, compilerContracts, {
    continueCb: (error, continueTxExecution, cancelCb) => {
      continueHandler(dispatch, gasEstimationPrompt, error, continueTxExecution, cancelCb)
    },
    promptCb: (okCb, cancelCb) => {
      promptHandler(dispatch, passphrasePrompt, okCb, cancelCb)
    },
    statusCb,
    finalCb
  }, confirmationCb)
}

const deployContract = (plugin: RunTab, selectedContract, args, contractMetadata, compilerContracts, callbacks, confirmationCb) => {
  _paq.push(['trackEvent', 'udapp', 'DeployContractTo', plugin.REACT_API.networkName])
  const { statusCb } = callbacks

  if (!contractMetadata || (contractMetadata && contractMetadata.autoDeployLib)) {
    return plugin.blockchain.deployContractAndLibraries(selectedContract, args, contractMetadata, compilerContracts, callbacks, confirmationCb)
  }
  if (Object.keys(selectedContract.bytecodeLinkReferences).length) statusCb(`linking ${JSON.stringify(selectedContract.bytecodeLinkReferences, null, '\t')} using ${JSON.stringify(contractMetadata.linkReferences, null, '\t')}`)
  plugin.blockchain.deployContractWithLibrary(selectedContract, args, contractMetadata, compilerContracts, callbacks, confirmationCb)
}

export const loadAddress = (plugin: RunTab, dispatch: React.Dispatch<any>, contract: ContractData, address: string) => {
  loadContractFromAddress(plugin, address,
     (cb) => {
       dispatch(displayNotification('At Address', `Do you really want to interact with ${address} using the current ABI definition?`, 'OK', 'Cancel', cb, null))
     },
     (error, loadType, abi) => {
       if (error) {
         return dispatch(displayNotification('Alert', error, 'OK', null))
       }
       if (loadType === 'abi') {
         return addInstance(dispatch, { abi, address, name: '<at address>' })
       } else if (loadType === 'instance') {
         if (!contract) return dispatch(displayPopUp('No compiled contracts found.'))
         const currentFile = plugin.REACT_API.contracts.currentFile
         const compiler = plugin.REACT_API.contracts.contractList[currentFile].find(item => item.alias === contract.name)
         const contractData = getSelectedContract(contract.name, compiler.compiler)
         return addInstance(dispatch, { contractData, address, name: contract.name })
       }
     }
   )
 }

export const getContext = (plugin: RunTab) => {
  return plugin.blockchain.context()
}

export const runTransactions = (
  plugin: RunTab,
  dispatch: React.Dispatch<any>,
  instanceIndex: number,
  lookupOnly: boolean,
  funcABI: FuncABI,
  inputsValues: string,
  contractName: string,
  contractABI, contract,
  address,
  logMsg:string,
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

      return terminalLogger(plugin, log)
    },
    (returnValue) => {
      const response = txFormat.decodeResponse(returnValue, funcABI)

      dispatch(setDecodedResponse(instanceIndex, response, funcIndex))
    },
    (network, tx, gasEstimation, continueTxExecution, cancelCb) => {
      confirmationHandler(plugin, dispatch, mainnetPrompt, network, tx, gasEstimation, continueTxExecution, cancelCb)
    },
    (error, continueTxExecution, cancelCb) => {
      continueHandler(dispatch, gasEstimationPrompt, error, continueTxExecution, cancelCb)
    },
    (okCb, cancelCb) => {
      promptHandler(dispatch, passphrasePrompt, okCb, cancelCb)
    }
  )
}

export const getFuncABIInputs = (plugin: RunTab, funcABI: FuncABI) => {
  return plugin.blockchain.getInputs(funcABI)
}