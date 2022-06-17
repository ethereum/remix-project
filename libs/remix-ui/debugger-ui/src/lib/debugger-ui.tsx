import React, { useState, useEffect } from 'react' // eslint-disable-line
import TxBrowser from './tx-browser/tx-browser' // eslint-disable-line
import StepManager from './step-manager/step-manager' // eslint-disable-line
import VmDebugger from './vm-debugger/vm-debugger' // eslint-disable-line
import VmDebuggerHead from './vm-debugger/vm-debugger-head' // eslint-disable-line
import { TransactionDebugger as Debugger } from '@remix-project/remix-debug' // eslint-disable-line
import { DebuggerUIProps } from './idebugger-api' // eslint-disable-line
import { Toaster } from '@remix-ui/toaster' // eslint-disable-line
import { isValidHash } from '@remix-ui/helper'
/* eslint-disable-next-line */
import './debugger-ui.css'
const _paq = (window as any)._paq = (window as any)._paq || []

export const DebuggerUI = (props: DebuggerUIProps) => {
  const debuggerModule = props.debuggerAPI
  const [state, setState] = useState({
    isActive: false,
    debugger: null,
    currentReceipt: {
      contractAddress: null,
      to: null
    },
    currentBlock: null,
    currentTransaction: null,
    blockNumber: null,
    txNumber: '',
    debugging: false,
    opt: {
      debugWithGeneratedSources: false,
      debugWithLocalNode: false
    },
    toastMessage: '',
    validationError: '',
    txNumberIsEmpty: true,
    isLocalNodeUsed: false,
    sourceLocationStatus: ''
  })

  useEffect(() => {
    return unLoad()
  }, [])

  debuggerModule.onDebugRequested((hash, web3?) => {
    if (hash) debug(hash, web3)
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

    const providerChanged = () => {
      debuggerModule.onEnvChanged((provider) => {
        setState(prevState => {
          const isLocalNodeUsed = provider !== 'vm' && provider !== 'injected'
          return { ...prevState, isLocalNodeUsed: isLocalNodeUsed }
        })
      })
    }

    providerChanged()
  }, [state.debugger])

  const listenToEvents = (debuggerInstance, currentReceipt) => {
    if (!debuggerInstance) return

    debuggerInstance.event.register('debuggerStatus', async (isActive) => {
      await debuggerModule.discardHighlight()
      setState(prevState => {
        return { ...prevState, isActive }
      })
    })

    debuggerInstance.event.register('locatingBreakpoint', async (isActive) => {
      setState(prevState => {
        return { ...prevState, sourceLocationStatus: 'Locating breakpoint, this might take a while...' }
      })
    })

    debuggerInstance.event.register('noBreakpointHit', async (isActive) => {
      setState(prevState => {
        return { ...prevState, sourceLocationStatus: '' }
      })
    })

    debuggerInstance.event.register('newSourceLocation', async (lineColumnPos, rawLocation, generatedSources, address) => {
      if (!lineColumnPos) {        
        await debuggerModule.discardHighlight()
        setState(prevState => {
          return { ...prevState, sourceLocationStatus: 'Source location not available, neither in Sourcify nor in Etherscan. Please make sure the Etherscan api key is provided in the settings.' }
        })
        return
      }
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
          setState(prevState => {
            return { ...prevState, sourceLocationStatus: '' }
          })
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
    setState(prevState => {
      return {
        ...prevState,
        sourceLocationStatus: ''
      }
    })
  }

  const unLoad = () => {
    if (state.debugger) state.debugger.unload()
    setState(prevState => {
      return {
        ...prevState,
        isActive: false,
        debugger: null,
        currentReceipt: {
          contractAddress: null,
          to: null
        },
        currentBlock: null,
        currentTransaction: null,
        blockNumber: null,
        ready: {
          vmDebugger: false,
          vmDebuggerHead: false
        },
        debugging: false
      }
    })
  }
  const startDebugging = async (blockNumber, txNumber, tx, optWeb3?) => {
    if (state.debugger) unLoad()
    if (!txNumber) return
    setState(prevState => {
      return {
        ...prevState,
        txNumber: txNumber,
        sourceLocationStatus: ''
      }
    })
    if (!isValidHash(txNumber)) {
      setState(prevState => {
        return {
          ...prevState,
          validationError: 'Invalid transaction hash.'
        }
      })
      return
    }

    const web3 = optWeb3 || (state.opt.debugWithLocalNode ? await debuggerModule.web3() : await debuggerModule.getDebugWeb3())
    try {
      const networkId = await web3.eth.net.getId()
      _paq.push(['trackEvent', 'debugger', 'startDebugging', networkId])
      if (networkId === 42) {
        setState(prevState => {
          return {
            ...prevState,
            validationError: 'Unfortunately, the Kovan network is not supported.'
          }
        })
        return
      }
    } catch (e) {
      console.error(e)
    }
    let currentReceipt
    let currentBlock
    let currentTransaction
    try {
      currentReceipt = await web3.eth.getTransactionReceipt(txNumber)
      currentBlock = await web3.eth.getBlock(currentReceipt.blockHash)
      currentTransaction = await web3.eth.getTransaction(txNumber)
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
          // debuggerModule.showMessage('Debugging error', 'Unable to fetch a transaction.')
          console.error(e)
        }
        return null
      },
      debugWithGeneratedSources: state.opt.debugWithGeneratedSources
    })

    setTimeout(async() => {
    try {
      await debuggerInstance.debug(blockNumber, txNumber, tx, () => {
        listenToEvents(debuggerInstance, currentReceipt)
        setState(prevState => {
          return {
            ...prevState,
            blockNumber,
            txNumber,
            debugging: true,
            currentReceipt,
            currentBlock,
            currentTransaction,
            debugger: debuggerInstance,
            toastMessage: `debugging ${txNumber}`,
            validationError: ''
          }
        })
      })
    } catch (error) {
      unLoad()
      setState(prevState => {
        return {
          ...prevState,
          validationError: error.message || error
        }
      })
    }
  }, 300)
  }

  const debug = (txHash, web3?) => {
    setState(prevState => {
      return {
        ...prevState,
        validationError: '',
        txNumber: txHash,
        sourceLocationStatus: ''
      }
    })
    startDebugging(null, txHash, null, web3)
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
          <div className="mt-2 mb-2 debuggerConfig custom-control custom-checkbox">
            <input className="custom-control-input" id="debugGeneratedSourcesInput" onChange={({ target: { checked } }) => {
              setState(prevState => {
                return { ...prevState, opt: { ...prevState.opt, debugWithGeneratedSources: checked } }
              })
            }} type="checkbox" title="Debug with generated sources" />
            <label data-id="debugGeneratedSourcesLabel" className="form-check-label custom-control-label" htmlFor="debugGeneratedSourcesInput">Use generated sources (Solidity {'>='} v0.7.2)</label>
          </div>
          { state.isLocalNodeUsed && <div className="mt-2 mb-2 debuggerConfig custom-control custom-checkbox">
            <input className="custom-control-input" id="debugWithLocalNodeInput" onChange={({ target: { checked } }) => {
              setState(prevState => {
                return { ...prevState, opt: { ...prevState.opt, debugWithLocalNode: checked } }
              })
            }} type="checkbox" title="Force the debugger to use the current local node" />
            <label data-id="debugLocaNodeLabel" className="form-check-label custom-control-label" htmlFor="debugWithLocalNodeInput">Force using local node</label>
          </div>
          }
          { state.validationError && <span className="w-100 py-1 text-danger validationError">{state.validationError}</span> }
        </div>
        <TxBrowser requestDebug={ requestDebug } unloadRequested={ unloadRequested } updateTxNumberFlag={ updateTxNumberFlag } transactionNumber={ state.txNumber } debugging={ state.debugging } />
        { state.debugging && state.sourceLocationStatus && <div className="text-warning"><i className="fas fa-exclamation-triangle" aria-hidden="true"></i> {state.sourceLocationStatus}</div> }
        { !state.debugging && 
        <div>
          <i className="fas fa-info-triangle" aria-hidden="true"></i>
          <span>
            When Debugging with a transaction hash, 
            if the contract is verified, Remix will try to fetch the source code from Sourcify or Etherscan. Put in your Etherscan API key in the Remix settings.
            For supported networks, please see: <a href="https://sourcify.dev" target="__blank" >https://sourcify.dev</a> & <a href="https://sourcify.dev" target="__blank">https://etherscan.io/contractsVerified</a>
          </span>
        </div> }
        { state.debugging && <StepManager stepManager={ stepManager } /> }
        { state.debugging && <VmDebuggerHead vmDebugger={ vmDebugger } /> }
      </div>
      { state.debugging && <VmDebugger vmDebugger={ vmDebugger } currentBlock={ state.currentBlock } currentReceipt={ state.currentReceipt } currentTransaction={ state.currentTransaction } /> }
    </div>
  )
}

export default DebuggerUI
