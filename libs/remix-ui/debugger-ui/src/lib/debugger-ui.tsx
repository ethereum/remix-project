import React, { useState, useEffect } from 'react' // eslint-disable-line
import TxBrowser from './tx-browser/tx-browser' // eslint-disable-line
import StepManager from './step-manager/step-manager' // eslint-disable-line
import VmDebugger from './vm-debugger/vm-debugger' // eslint-disable-line
import VmDebuggerHead from './vm-debugger/vm-debugger-head' // eslint-disable-line
import { TransactionDebugger as Debugger } from '@remix-project/remix-debug' // eslint-disable-line
import { DebuggerUIProps } from './idebugger-api' // eslint-disable-line
import { Toaster } from '@remix-ui/toaster' // eslint-disable-line
/* eslint-disable-next-line */
import './debugger-ui.css'
const helper = require('../../../../../apps/remix-ide/src/lib/helper')

export const DebuggerUI = (props: DebuggerUIProps) => {
  const debuggerModule = props.debuggerAPI
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
    debugging: false,
    opt: {
      debugWithGeneratedSources: false
    },
    toastMessage: '',
    validationError: '',
    txNumberIsEmpty: true
  })

  useEffect(() => {
    return unLoad()
  }, [])

  debuggerModule.onDebugRequested((hash) => {
    if (hash) debug(hash)
  })

  debuggerModule.onRemoveHighlights(async () => {
    await debuggerModule.discardHighlight()
  })

  useEffect(() => {
    const setEditor = () => {
      debuggerModule.onBreakpointCleared((fileName, row) => {
        if (state.debugger) state.debugger.breakPointManager.remove({ fileName: fileName, row: row })
      })

      debuggerModule.onBreakpointAdded((fileName, row) => {
        if (state.debugger) state.debugger.breakPointManager.add({ fileName: fileName, row: row })
      })

      debuggerModule.onEditorContentChanged(() => {
        if (state.debugger) unLoad()
      })
    }

    setEditor()
  }, [state.debugger])

  const listenToEvents = (debuggerInstance, currentReceipt) => {
    if (!debuggerInstance) return

    debuggerInstance.event.register('debuggerStatus', async (isActive) => {
      await debuggerModule.discardHighlight()
      setState(prevState => {
        return { ...prevState, isActive }
      })
    })

    debuggerInstance.event.register('newSourceLocation', async (lineColumnPos, rawLocation, generatedSources, address) => {
      if (!lineColumnPos) return
      const contracts = await debuggerModule.fetchContractAndCompile(
        address || currentReceipt.contractAddress || currentReceipt.to,
        currentReceipt)
      if (contracts) {
        let path = contracts.getSourceName(rawLocation.file)
        if (!path) {
          // check in generated sources
          for (const source of generatedSources) {
            if (source.id === rawLocation.file) {
              path = `browser/.debugger/generated-sources/${source.name}`
              let content
              try {
                content = await debuggerModule.getFile(path)
              } catch (e) {
                const message = 'Unable to fetch generated sources, the file probably doesn\'t exist yet.'
                console.log(message, ' ', e)
              }
              if (content !== source.contents) {
                await debuggerModule.setFile(path, source.contents)
              }
              break
            }
          }
        }
        if (path) {
          await debuggerModule.discardHighlight()
          await debuggerModule.highlight(lineColumnPos, path)
        }
      }
    })

    debuggerInstance.event.register('debuggerUnloaded', () => unLoad())
  }

  const requestDebug = (blockNumber, txNumber, tx) => {
    startDebugging(blockNumber, txNumber, tx)
  }

  const updateTxNumberFlag = (empty: boolean) => {
    setState(prevState => {
      return {
        ...prevState,
        txNumberIsEmpty: empty,
        validationError: ''
      }
    })
  }

  const unloadRequested = (blockNumber, txIndex, tx) => {
    unLoad()
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
    if (!txNumber) return
    setState(prevState => {
      return {
        ...prevState,
        txNumber: txNumber
      }
    })
    if (!helper.isValidHash(txNumber)) {
      setState(prevState => {
        return {
          ...prevState,
          validationError: 'Invalid transaction hash.'
        }
      })
      return
    }

    const web3 = await debuggerModule.getDebugWeb3()
    let currentReceipt
    try {
      currentReceipt = await web3.eth.getTransactionReceipt(txNumber)
    } catch (e) {
      setState(prevState => {
        return {
          ...prevState,
          validationError: e.message
        }
      })
      console.log(e.message)
    }

    const debuggerInstance = new Debugger({
      web3,
      offsetToLineColumnConverter: debuggerModule.offsetToLineColumnConverter,
      compilationResult: async (address) => {
        try {
          const ret = await debuggerModule.fetchContractAndCompile(address, currentReceipt)
          return ret
        } catch (e) {
          debuggerModule.showMessage('Debugging error', 'Unable to fetch a transaction.')
          console.error(e)
        }
        return null
      },
      debugWithGeneratedSources: state.opt.debugWithGeneratedSources
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
          debugger: debuggerInstance,
          toastMessage: `debugging ${txNumber}`,
          validationError: ''
        }
      })
    }).catch((error) => {
      if (JSON.stringify(error) !== '{}') {
        let message = 'Error: ' + JSON.stringify(error)
        message = message.split('\\"').join('\'')
        setState(prevState => {
          return {
            ...prevState,
            validationError: message
          }
        })
      }
      unLoad()
    })
  }

  const debug = (txHash) => {
    setState(prevState => {
      return {
        ...prevState,
        validationError: '',
        txNumber: txHash
      }
    })
    startDebugging(null, txHash, null)
  }

  const stepManager = {
    jumpTo: state.debugger && state.debugger.step_manager ? state.debugger.step_manager.jumpTo.bind(state.debugger.step_manager) : null,
    stepOverBack: state.debugger && state.debugger.step_manager ? state.debugger.step_manager.stepOverBack.bind(state.debugger.step_manager) : null,
    stepIntoBack: state.debugger && state.debugger.step_manager ? state.debugger.step_manager.stepIntoBack.bind(state.debugger.step_manager) : null,
    stepIntoForward: state.debugger && state.debugger.step_manager ? state.debugger.step_manager.stepIntoForward.bind(state.debugger.step_manager) : null,
    stepOverForward: state.debugger && state.debugger.step_manager ? state.debugger.step_manager.stepOverForward.bind(state.debugger.step_manager) : null,
    jumpOut: state.debugger && state.debugger.step_manager ? state.debugger.step_manager.jumpOut.bind(state.debugger.step_manager) : null,
    jumpPreviousBreakpoint: state.debugger && state.debugger.step_manager ? state.debugger.step_manager.jumpPreviousBreakpoint.bind(state.debugger.step_manager) : null,
    jumpNextBreakpoint: state.debugger && state.debugger.step_manager ? state.debugger.step_manager.jumpNextBreakpoint.bind(state.debugger.step_manager) : null,
    jumpToException: state.debugger && state.debugger.step_manager ? state.debugger.step_manager.jumpToException.bind(state.debugger.step_manager) : null,
    traceLength: state.debugger && state.debugger.step_manager ? state.debugger.step_manager.traceLength : null,
    registerEvent: state.debugger && state.debugger.step_manager ? state.debugger.step_manager.event.register.bind(state.debugger.step_manager.event) : null
  }
  const vmDebugger = {
    registerEvent: state.debugger && state.debugger.vmDebuggerLogic ? state.debugger.vmDebuggerLogic.event.register.bind(state.debugger.vmDebuggerLogic.event) : null,
    triggerEvent: state.debugger && state.debugger.vmDebuggerLogic ? state.debugger.vmDebuggerLogic.event.trigger.bind(state.debugger.vmDebuggerLogic.event) : null
  }
  return (
    <div>
      <Toaster message={state.toastMessage} />
      <div className="px-2">
        <div>
          <p className="my-2 debuggerLabel">Debugger Configuration</p>
          <div className="mt-2 debuggerConfig custom-control custom-checkbox">
            <input className="custom-control-input" id="debugGeneratedSourcesInput" onChange={({ target: { checked } }) => {
              setState(prevState => {
                return { ...prevState, opt: { debugWithGeneratedSources: checked } }
              })
            }} type="checkbox" title="Debug with generated sources" />
            <label data-id="debugGeneratedSourcesLabel" className="form-check-label custom-control-label" htmlFor="debugGeneratedSourcesInput">Use generated sources (from Solidity v0.7.2)</label>
          </div>
          { (state.validationError && !state.txNumberIsEmpty) && <span className="w-100 py-1 text-danger validationError">{state.validationError}</span> }
        </div>
        <TxBrowser requestDebug={ requestDebug } unloadRequested={ unloadRequested } updateTxNumberFlag={ updateTxNumberFlag } transactionNumber={ state.txNumber } debugging={ state.debugging } />
        { state.debugging && <StepManager stepManager={ stepManager } /> }
        { state.debugging && <VmDebuggerHead vmDebugger={ vmDebugger } /> }
      </div>
      { state.debugging && <div className="statusMessage">{ state.statusMessage }</div> }
      { state.debugging && <VmDebugger vmDebugger={ vmDebugger } /> }
    </div>
  )
}

export default DebuggerUI
