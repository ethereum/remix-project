import React, { useState, useEffect } from 'react'
import TxBrowser from './tx-browser/tx-browser'
import StepManager from './step-manager/step-manager'
import VmDebugger from './vm-debugger/vm-debugger'
import VmDebuggerHead from './vm-debugger/vm-debugger-head'
import remixDebug, { TransactionDebugger as Debugger } from '@remix-project/remix-debug'
/* eslint-disable-next-line */
import toaster from '../../../../../apps/remix-ide/src/app/ui/tooltip'
/* eslint-disable-next-line */
import SourceHighlighter from '../../../../../apps/remix-ide/src/app/editor/sourceHighlighter'
/* eslint-disable-next-line */
import EventManager from '../../../../../apps/remix-ide/src/lib/events'
/* eslint-disable-next-line */
import globalRegistry from '../../../../../apps/remix-ide/src/global/registry'
import './debugger-ui.css'

export const DebuggerUI = ({ debuggerModule, fetchContractAndCompile, debugHash, getTraceHash, removeHighlights }) => {
  const event = new EventManager()
  const sourceHighlighter = new SourceHighlighter()
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
    visibility: {
      vmDebugger: false,
      stepManager: false,
      txBrowser: false
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
        if (state.debugger) state.debugger.unload()
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
    if (state.debugger) state.debugger.unload()
    startDebugging(blockNumber, txNumber, tx)
  }

  const unloadRequested = (blockNumber, txIndex, tx) => {
    if (state.debugger) state.debugger.unload()
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
    // yo.update(this.debuggerHeadPanelsView, yo`<div></div>`)
    // yo.update(this.debuggerPanelsView, yo`<div></div>`)
    // yo.update(this.stepManagerView, yo`<div></div>`)
    setState(prevState => {
      const { visibility } = prevState

      return {
        ...prevState,
        debugger: null,
        debugging: false,
        visibility: {
          ...visibility,
          vmDebugger: false,
          stepManager: false
        }
      }
    })
    event.trigger('traceUnloaded', [])
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
      // this.stepManager = new StepManagerUI(this.debugger.step_manager)
      // this.vmDebugger = new VmDebugger(this.debugger.vmDebuggerLogic)
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
      // this.renderDebugger()
    }).catch((error) => {
      toaster(error, null, null)
      unLoad()
    })
}

const debug = (txHash) => {
  startDebugging(null, txHash, null)
}

const getTrace = (hash) => {
  return new Promise(async (resolve, reject) => { /* eslint-disable-line */
    const web3 = await getDebugWeb3()
    const currentReceipt = await web3.eth.getTransactionReceipt(hash)

    setState(prevState => {
      return { ...prevState, currentReceipt }
    })

    const debug = new Debugger({
      web3,
      offsetToLineColumnConverter: globalRegistry.get('offsettolinecolumnconverter').api,
      compilationResult: async (address) => {
        try {
          return await fetchContractAndCompile(address, state.currentReceipt)
        } catch (e) {
          console.error(e)
        }
        return null
      }
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

// this.debuggerPanelsView = yo`<div class="px-2"></div>`
// this.debuggerHeadPanelsView = yo`<div class="px-2"></div>`
// this.stepManagerView = yo`<div class="px-2"></div>`

  return (
      <div>
        <div className="px-2">
          <TxBrowser requestDebug={requestDebug} unloadRequested={unloadRequested} transactionNumber={state.txNumber} debugging={state.debugging} />
          <StepManager stepManager={state.debugger ? state.debugger.step_manager : null} />
          {/*<VmDebuggerHead vmDebuggerLogic={state.debugger.vmDebuggerLogic} /> */}
        </div>
        {/* <div className="statusMessage">{state.statusMessage}</div>
        <VmDebugger vmDebuggerLogic={state.debugger.vmDebuggerLogic} /> */}
      </div>
  )
}

export default DebuggerUI
