import { AppContext } from '@remix-ui/app'
import React, { useContext, useEffect } from 'react' // eslint-disable-line
import { TerminalContext } from '../context'
import { RemixUiTerminalProps, SET_OPEN } from '../types/terminalTypes'
import './remix-ui-terminal-menu-buttons.css'
import { desktopConnextionType } from '@remix-api';

export const RemixUITerminalMenuButtons = (props: RemixUiTerminalProps) => {
  const { xtermState, dispatchXterm, terminalState, dispatch } = useContext(TerminalContext)
  const appContext = useContext(AppContext)

  function selectOutput(event: any): void {
    props.plugin.call('layout', 'minimize', props.plugin.profile.name, false)
    dispatchXterm({ type: 'SET_TERMINAL_TAB', payload: 'output' })
    dispatch({ type: SET_OPEN, payload: true })
  }

  const showTerminal = async (event: any): Promise<void> => {
    props.plugin.call('layout', 'minimize', props.plugin.profile.name, false)
    if (xtermState.terminals.length === 0) {
      const start_time = Date.now()
      const pid = await props.plugin.call('xterm', 'createTerminal', xtermState.workingDir, null)
      const end_time = Date.now()
      console.log(`createTerminal took ${end_time - start_time} ms`)
      dispatchXterm({ type: 'HIDE_ALL_TERMINALS', payload: null })
      dispatchXterm({ type: 'SET_TERMINAL_TAB', payload: 'xterm' })
      dispatchXterm({ type: 'ADD_TERMINAL', payload: { pid, queue: '', timeStamp: Date.now(), ref: null, hidden: false } })
    } else {
      dispatchXterm({ type: 'SET_TERMINAL_TAB', payload: 'xterm' })
    }
    dispatch({ type: SET_OPEN, payload: true })
  }

  const showTransactions = async (event: any): Promise<void> => {
    dispatchXterm({ type: 'SET_TERMINAL_TAB', payload: 'transactions' })
  }

  if (appContext.appState.connectedToDesktop === desktopConnextionType.connected) {

    return (
      <div className='d-flex flex-row align-items-center'>

        <button data-id="tab" id="tabTransactionsDebugger" className={`xtermButton w-100 btn btn-sm border-secondary btn-secondary'}`}
          onClick={async (e) => await showTransactions(e)}
        >
          pending transactions
        </button>
      </div>
    )
  }

  return (
    <div className='d-flex flex-row align-items-center'>
      <button id="tabOutput" data-id="tabOutput" className={`xtermButton btn btn-sm border-secondary mr-2 border ${!(xtermState.selectedTerminalTab === 'output') ? '' : 'd-flex btn-secondary'}`} onClick={selectOutput}>
        Output
      </button>
      <button data-id="tabXTerm" id="tabXTerm" className={`xtermButton mr-2 btn btn-sm border-secondary ${xtermState.terminalsEnabled ? 'd-block' : 'd-none'}  ${xtermState.selectedTerminalTab === 'xterm' ? 'd-none' : 'btn-secondary'}`}
        onClick={async (e) => await showTerminal(e)}>
        <span className="far fa-terminal border-0 ml-1"></span>
      </button>
      <button data-id="tab" id="tabTransactionsDebugger" className={`xtermButton w-100 btn btn-sm border-secondary btn-secondary'}`}
        onClick={async (e) => await showTransactions(e)}
      >
        pending transactions
      </button>
    </div>
  )
}