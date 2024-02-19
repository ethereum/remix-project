import React, { useReducer } from 'react' // eslint-disable-line
import { RemixUITerminalBar } from './components/remix-ui-terminal-bar'
import { TerminalContext } from './context/context'
import { initialState, registerCommandReducer } from './reducers/terminalReducer'
import RemixUiTerminal from './remix-ui-terminal'
import { RemixUiTerminalProps } from './types/terminalTypes'

export const RemixUITerminalWrapper = (props: RemixUiTerminalProps) => {
    const [newstate, dispatch] = useReducer(registerCommandReducer, initialState)

    const providerState = {
        newstate,
        dispatch
    }

    return (<>
        <TerminalContext.Provider value={providerState}>
            <RemixUITerminalBar {...props} />
            <RemixUiTerminal {...props} />
        </TerminalContext.Provider>
    </>)
}