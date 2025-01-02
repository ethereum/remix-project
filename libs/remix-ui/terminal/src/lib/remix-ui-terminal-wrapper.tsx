import { AppContext, appPlatformTypes, platformContext } from '@remix-ui/app'
import { RemixUiXterminals, xTerminInitialState, xtermReducer } from '@remix-ui/xterm'
import { TerminalTransactions } from 'libs/remix-ui/terminal-transactions/src'
import React, { useContext, useEffect, useReducer } from 'react' // eslint-disable-line
import { RemixUITerminalBar } from './components/remix-ui-terminal-bar'
import { TerminalContext } from './context'
import { initialState, registerCommandReducer } from './reducers/terminalReducer'
import RemixUiTerminal from './remix-ui-terminal'
import { RemixUiTerminalProps } from './types/terminalTypes'
import { desktopConnextionType } from '@remix-api'

export const RemixUITerminalWrapper = (props: RemixUiTerminalProps) => {
  const [terminalState, dispatch] = useReducer(registerCommandReducer, initialState)
  const [xtermState, dispatchXterm] = useReducer(xtermReducer, xTerminInitialState)
  const platform = useContext(platformContext)
  const appContext = useContext(AppContext)
  const providerState = {
    terminalState,
    dispatch,
    xtermState,
    dispatchXterm
  }

  useEffect(() => {
    if (appContext.appState.connectedToDesktop === desktopConnextionType.connected) {
      dispatchXterm({ type: 'SET_TERMINAL_TAB', payload: 'transactions' })
    }
  }, [appContext.appState.connectedToDesktop])

  if (appContext.appState.connectedToDesktop === desktopConnextionType.disconnected) {
    return <></>
  }

  if (appContext.appState.connectedToDesktop === desktopConnextionType.connected) {
    return <>
      <TerminalContext.Provider value={providerState}>
        <RemixUITerminalBar {...props} />
        {platform !== appPlatformTypes.desktop && <RemixUiTerminal {...props} />}
      </TerminalContext.Provider>
    </>
  }

  return (<>
    <TerminalContext.Provider value={providerState}>
      <RemixUITerminalBar {...props} />
      {platform !== appPlatformTypes.desktop && <RemixUiTerminal {...props} />}
      {platform === appPlatformTypes.desktop &&
        <>
          <RemixUiTerminal visible={xtermState.selectedTerminalTab === 'output'} plugin={props.plugin} onReady={props.onReady} />
          <RemixUiXterminals {...props} />
          {/* <TerminalTransactions plugin={props.plugin} /> */}
        </>
      }
    </TerminalContext.Provider>
  </>)
}