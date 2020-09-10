import React, { useState, useEffect } from 'react'
import TxBrowser from './tx-browser/tx-browser'
import StepManager from './step-manager/step-manager'
import VmDebugger from './vm-debugger/vm-debugger'
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

const DebuggerUI = ({ debuggerModule, component, fetchContractAndCompile }) => {
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
    txNumber: null
  })

  useEffect(() => {
    const setEditor = () => {
      const editor = globalRegistry.get('editor').api

      editor.event.register('breakpointCleared', (fileName, row) => {
        if (state.debugger) state.debugger.breakPointManager.remove({fileName: fileName, row: row})
      })
  
      this.editor.event.register('breakpointAdded', (fileName, row) => {
        if (state.debugger) state.debugger.breakPointManager.add({fileName: fileName, row: row})
      })
  
      this.editor.event.register('contentChanged', () => {
        if (state.debugger) state.debugger.unload()
      })
    }

    setEditor()
  }, [])

  const listenToEvents = () => {
    if (!state.debugger) return

    state.debugger.event.register('debuggerStatus', async (isActive) => {
      await debuggerModule.call('editor', 'discardHighlight')
      setState(prevState => {
        return {
          ...prevState,
          isActive
        }
      })
    })

    state.debugger.event.register('newSourceLocation', async (lineColumnPos, rawLocation) => {
      const contracts = await fetchContractAndCompile(
        state.currentReceipt.contractAddress || state.currentReceipt.to,
        state.currentReceipt)

      if (contracts) {
        const path = contracts.getSourceName(rawLocation.file)

        if (path) {
          await debuggerModule.call('editor', 'discardHighlight')
          await debuggerModule.call('editor', 'highlight', lineColumnPos, path)
        }
      }
    })

    // state.debugger.event.register('debuggerUnloaded', () => this.unLoad())
  }

  const requestDebug = (blockNumber, txNumber, tx) => {
    if (state.debugger) state.debugger.unload()
    startDebugging(blockNumber, txNumber, tx)
  }

  const unloadRequested = (blockNumber, txIndex, tx) => {
    if (state.debugger) state.debugger.unload()
  }

  const getDebugWeb3 = () => {
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

  const unLoad  = async () => {
    // yo.update(this.debuggerHeadPanelsView, yo`<div></div>`)
    // yo.update(this.debuggerPanelsView, yo`<div></div>`)
    // yo.update(this.stepManagerView, yo`<div></div>`)
    if (this.vmDebugger) this.vmDebugger.remove()
    if (this.stepManager) this.stepManager.remove()
    if (this.txBrowser) this.txBrowser.setState({debugging: false})
    this.vmDebugger = null
    this.stepManager = null
    if (this.debugger) delete this.debugger
    this.event.trigger('traceUnloaded')
  }

  const startDebugging = async (blockNumber, txNumber, tx) => {
    if (state.debugger) unLoad()

    const web3 = await this.getDebugWeb3()
    setState({
      ...state,
      currentReceipt: await web3.eth.getTransactionReceipt(txNumber),
      debugger: new Debugger({
        web3,
        offsetToLineColumnConverter: globalRegistry.get('offsettolinecolumnconverter').api,
        compilationResult: async (address) => {
          try {
            return await fetchContractAndCompile(address, this.currentReceipt)
          } catch (e) {
            console.error(e)
          }
          return null
        }
      })
    })
    listenToEvents()
    state.debugger.debug(blockNumber, txNumber, tx, () => {
      // this.stepManager = new StepManagerUI(this.debugger.step_manager)
      // this.vmDebugger = new VmDebugger(this.debugger.vmDebuggerLogic)
      setState(prevState => {
        return {
          ...prevState,
          blockNumber,
          txNumber,
          debugging: true
        }
      })
      this.renderDebugger()
    }).catch((error) => {
      toaster(error, null, null)
      unLoad()
    })
}

  return (
    <div>
      <h1>Welcome to debugger-ui!</h1>
    </div>
  )
}

export default DebuggerUI
