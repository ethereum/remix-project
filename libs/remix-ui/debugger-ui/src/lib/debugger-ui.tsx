import React, { useState, useEffect } from 'react'
import TxBrowser from './tx-browser/tx-browser'
import StepManager from './step-manager/step-manager'
import VmDebugger from './vm-debugger/vm-debugger'
import VmDebuggerHead from './vm-debugger/vm-debugger-head'
import remixDebug, { TransactionDebugger as Debugger } from '@remix-project/remix-debug'
/* eslint-disable-next-line */
import globalRegistry from '../../../../../apps/remix-ide/src/global/registry'
import './debugger-ui.css'

export const DebuggerUI = ({ debuggerModule, fetchContractAndCompile, debugHash, getTraceHash, removeHighlights }) => {
  const init = remixDebug.init
  const [state, setState] = useState({
    isActive: false,
    statusMessage: '',
    debugger: null,
    currentReceipt: {
      contractAddress: null,
      to: null
    },
    blockNumber: null,
    txNumber: '',
    ready: {
      vmDebugger: false,
      vmDebuggerHead: false
    },
    debugging: false
  })

  useEffect(() => {
    const setEditor = () => {
      const editor = globalRegistry.get('editor').api

      editor.event.register('breakpointCleared', (fileName, row) => {
        if (state.debugger) state.debugger.breakPointManager.remove({fileName: fileName, row: row})
      })
  
      editor.event.register('breakpointAdded', (fileName, row) => {
        if (state.debugger) state.debugger.breakPointManager.add({fileName: fileName, row: row})
      })
  
      editor.event.register('contentChanged', () => {
        unLoad()
      })
    }

    setEditor()
    return unLoad()
  }, [])

  useEffect(() => {
    debug(debugHash)
  }, [debugHash])

  useEffect(() => {
    getTrace(getTraceHash)
  }, [getTraceHash])

  useEffect(() => {
    if (removeHighlights) deleteHighlights()
  }, [removeHighlights])

  const listenToEvents = (debuggerInstance, currentReceipt) => {
    if (!debuggerInstance) return

    debuggerInstance.event.register('debuggerStatus', async (isActive) => {
      await debuggerModule.call('editor', 'discardHighlight')
      setState( prevState => {
        return { ...prevState, isActive }
      })
    })

    debuggerInstance.event.register('newSourceLocation', async (lineColumnPos, rawLocation) => {
      const contracts = await fetchContractAndCompile(
        currentReceipt.contractAddress || currentReceipt.to,
        currentReceipt)

      if (contracts) {
        const path = contracts.getSourceName(rawLocation.file)

        if (path) {
          await debuggerModule.call('editor', 'discardHighlight')
          await debuggerModule.call('editor', 'highlight', lineColumnPos, path)
        }
      }
    })

    debuggerInstance.event.register('debuggerUnloaded', () => unLoad())
  }

  const requestDebug = (blockNumber, txNumber, tx) => {
    startDebugging(blockNumber, txNumber, tx)
  }

  const unloadRequested = (blockNumber, txIndex, tx) => {
    unLoad()
  }

  const isDebuggerActive = () => {
    return state.isActive
  }

  const getDebugWeb3 = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      debuggerModule.blockchain.detectNetwork((error, network) => {
        let web3
        if (error || !network) {
          web3 = init.web3DebugNode(debuggerModule.blockchain.web3())
        } else {
          const webDebugNode = init.web3DebugNode(network.name)
          web3 = !webDebugNode ? debuggerModule.blockchain.web3() : webDebugNode
        }
        init.extendWeb3(web3)
        resolve(web3)
      })
    })
  }

  const unLoad = () => {
    if (state.debugger) state.debugger.unload()
    setState(prevState => {
      return {
        ...prevState,
        isActive: false,
        statusMessage: '',
        debugger: null,
        currentReceipt: {
          contractAddress: null,
          to: null
        },
        blockNumber: null,
        ready: {
          vmDebugger: false,
          vmDebuggerHead: false
        },
        debugging: false
      }
    })
  }

  const startDebugging = async (blockNumber, txNumber, tx) => {
    if (state.debugger) unLoad()
    const web3 = await getDebugWeb3()
    const currentReceipt = await web3.eth.getTransactionReceipt(txNumber)
    const debuggerInstance = new Debugger({
      web3,
      offsetToLineColumnConverter: globalRegistry.get('offsettolinecolumnconverter').api,
      compilationResult: async (address) => {
        try {
          return await fetchContractAndCompile(address, currentReceipt)
        } catch (e) {
          console.error(e)
        }
        return null
      }
    })
    debuggerInstance.debug(blockNumber, txNumber, tx, () => {
      listenToEvents(debuggerInstance, currentReceipt)
      setState(prevState => {
        return {
          ...prevState,
          blockNumber,
          txNumber,
          debugging: true,
          currentReceipt,
          debugger: debuggerInstance
        }
      })
    }).catch((error) => {
      // toaster(error, null, null)
      unLoad()
    })
}

const debug = (txHash) => {
  startDebugging(null, txHash, null)
}

const getTrace = (hash) => {
  if (!hash) return
  return new Promise(async (resolve, reject) => { /* eslint-disable-line */
    const web3 = await getDebugWeb3()
    const currentReceipt = await web3.eth.getTransactionReceipt(hash)
    const debug = new Debugger({
      web3,
      offsetToLineColumnConverter: globalRegistry.get('offsettolinecolumnconverter').api,
      compilationResult: async (address) => {
        try {
          return await fetchContractAndCompile(address, currentReceipt)
        } catch (e) {
          console.error(e)
        }
        return null
      }
    })

    setState(prevState => {
      return { ...prevState, currentReceipt }
    })

    debug.debugger.traceManager.traceRetriever.getTrace(hash, (error, trace) => {
      if (error) return reject(error)
      resolve(trace)
    })
  })
}

const deleteHighlights = async () => {
  await debuggerModule.call('editor', 'discardHighlight')
}

const vmDebuggerReady = () => {
  setState(prevState => {
    return {
      ...prevState,
      ready: {
        ...prevState.ready,
        vmDebugger: true
      }
    }
  })
}

const vmDebuggerHeadReady = () => {
  setState(prevState => {
    return {
      ...prevState,
      ready: {
        ...prevState.ready,
        vmDebuggerHead: true
      }
    }
  })
}

if (state.ready.vmDebugger && state.ready.vmDebuggerHead) {
  state.debugger.vmDebuggerLogic.start()
}

  return (
      <div>
        <div className="px-2">
          <TxBrowser requestDebug={ requestDebug } unloadRequested={ unloadRequested } transactionNumber={ state.txNumber } debugging={ state.debugging } />
  { state.debugging && <StepManager stepManager={ state.debugger ? state.debugger.step_manager : null } /> }
  { state.debugging && <VmDebuggerHead vmDebuggerLogic={ state.debugger ? state.debugger.vmDebuggerLogic : null } ready={vmDebuggerHeadReady} /> }
        </div>
  { state.debugging && <div className="statusMessage">{ state.statusMessage }</div> }
  { state.debugging && <VmDebugger vmDebuggerLogic={ state.debugger ? state.debugger.vmDebuggerLogic : null } ready={vmDebuggerReady} /> }
      </div>
  )
}

export default DebuggerUI
