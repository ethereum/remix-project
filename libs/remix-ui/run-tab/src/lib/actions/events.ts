import { envChangeNotification } from "@remix-ui/helper"
import { RunTab } from "../types/run-tab"
import { setExecutionContext, setFinalContext, updateAccountBalances } from "./account"
import { addExternalProvider, addInstance, removeExternalProvider, setNetworkNameFromProvider } from "./actions"
import { clearAllInstances, clearRecorderCount, fetchContractListSuccess, resetUdapp, setCurrentContract, setCurrentFile, setDeployOptions, setLoadType, setRecorderCount, setSendValue } from "./payload"
import { CompilerAbstract } from '@remix-project/remix-solidity'
import * as ethJSUtil from 'ethereumjs-util'
import Web3 from 'web3'

export const setupEvents = (plugin: RunTab, dispatch: React.Dispatch<any>) => {
  plugin.blockchain.events.on('newTransaction', (tx, receipt) => {
    plugin.emit('newTransaction', tx, receipt)
  })

  plugin.blockchain.event.register('transactionExecuted', (error, from, to, data, lookupOnly, txResult) => {
    if (!lookupOnly) dispatch(setSendValue('0'))
    if (error) return
    updateAccountBalances(plugin, dispatch)
  })

  plugin.blockchain.event.register('contextChanged', (context, silent) => {
    setFinalContext(plugin, dispatch)
  })

  plugin.blockchain.event.register('networkStatus', ({ error, network }) => {
    if (error) {
      const netUI = 'can\'t detect network '
      setNetworkNameFromProvider(dispatch, netUI)

      return
    }
    const networkProvider = plugin.networkModule.getNetworkProvider.bind(plugin.networkModule)
    const netUI = (networkProvider() !== 'vm') ? `${network.name} (${network.id || '-'}) network` : 'VM'

    setNetworkNameFromProvider(dispatch, netUI)
  })

  plugin.blockchain.event.register('addProvider', provider => addExternalProvider(dispatch, provider))

  plugin.blockchain.event.register('removeProvider', name => removeExternalProvider(dispatch, name))

  plugin.on('solidity', 'compilationFinished', (file, source, languageVersion, data, input, version) => broadcastCompilationResult(plugin, dispatch, file, source, languageVersion, data, input))

  plugin.on('vyper', 'compilationFinished', (file, source, languageVersion, data) => broadcastCompilationResult(plugin, dispatch, file, source, languageVersion, data))

  plugin.on('lexon', 'compilationFinished', (file, source, languageVersion, data) => broadcastCompilationResult(plugin, dispatch, file, source, languageVersion, data))

  plugin.on('yulp', 'compilationFinished', (file, source, languageVersion, data) => broadcastCompilationResult(plugin, dispatch, file, source, languageVersion, data))

  plugin.on('nahmii-compiler', 'compilationFinished', (file, source, languageVersion, data) => broadcastCompilationResult(plugin, dispatch, file, source, languageVersion, data))

  plugin.on('udapp', 'setEnvironmentModeReducer', (env: { context: string, fork: string }, from: string) => {
    plugin.call('notification', 'toast', envChangeNotification(env, from))
    setExecutionContext(plugin, dispatch, env)
  })

  plugin.on('udapp', 'clearAllInstancesReducer', () => {
    dispatch(clearAllInstances())
  })

  plugin.on('udapp', 'addInstanceReducer', (address, abi, name) => {
    addInstance(dispatch, { abi, address, name })
  })

  plugin.on('filePanel', 'setWorkspace', () => {
    dispatch(resetUdapp())
    resetAndInit(plugin)
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
    dispatch(setCurrentFile(currentFile))
  })

  plugin.recorder.event.register('recorderCountChange', (count) => {
    dispatch(setRecorderCount(count))
  })

  plugin.event.register('cleared', () => {
    dispatch(clearRecorderCount())
  })
}

const broadcastCompilationResult = async (plugin: RunTab, dispatch: React.Dispatch<any>, file, source, languageVersion, data, input?) => {
  // TODO check whether the tab is configured
  const compiler = new CompilerAbstract(languageVersion, data, source, input)

  plugin.compilersArtefacts[languageVersion] = compiler
  plugin.compilersArtefacts.__last = compiler

  const contracts = getCompiledContracts(compiler).map((contract) => {
    return { name: languageVersion, alias: contract.name, file: contract.file, compiler }
  })
  const index = contracts.findIndex(contract => contract.alias === plugin.REACT_API.contracts.currentContract)

  if ((index < 0) && (contracts.length > 0)) dispatch(setCurrentContract(contracts[0].alias))
  const isUpgradeable = await plugin.call('openzeppelin-proxy', 'isConcerned', data.sources[file] ? data.sources[file].ast : {})

  if (isUpgradeable) {
    const options = await plugin.call('openzeppelin-proxy', 'getDeployOptions', data.contracts[file])
  
    dispatch(setDeployOptions({ options: [{ title: 'Deploy with Proxy', active: false }], initializeOptions: options }))
  }
  else dispatch(setDeployOptions({} as any))
  dispatch(fetchContractListSuccess({ [file]: contracts }))
  dispatch(setCurrentFile(file))
  // TODO: set current contract
}

const getCompiledContracts = (compiler) => {
  const contracts = []

  compiler.visitContracts((contract) => {
    contracts.push(contract)
  }) 
  return contracts
}

export const resetAndInit = (plugin: RunTab) => {
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
        const gasLimit = '0x' + new ethJSUtil.BN(plugin.REACT_API.gasLimit, 10).toString(16)

        cb(null, gasLimit)
      } catch (e) {
        cb(e.message)
      }
    }
  })
}