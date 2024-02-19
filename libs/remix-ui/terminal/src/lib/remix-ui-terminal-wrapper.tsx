import React, { useState, useEffect, useReducer, useRef} from 'react' // eslint-disable-line
import { initialState, registerCommandReducer } from './reducers/terminalReducer'

export const RemixUITerminalWrapper = () => {
    const [newstate, dispatch] = useReducer(registerCommandReducer, initialState)
    return (<>terminal</>)
}