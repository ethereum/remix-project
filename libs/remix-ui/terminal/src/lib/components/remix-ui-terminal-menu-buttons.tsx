import React, { useContext, useEffect } from 'react' // eslint-disable-line
import { TerminalContext } from '../context'
import { RemixUiTerminalProps, SET_OPEN } from '../types/terminalTypes'
export const RemixUITerminalMenuButtons = (props: RemixUiTerminalProps) => {
  const { xtermState, dispatchXterm, terminalState, dispatch } = useContext(TerminalContext)

  function selectOutput(event: any): void {
    props.plugin.call('layout', 'minimize', props.plugin.profile.name, false)
    dispatchXterm({ type: 'SHOW_OUTPUT', payload: true })
    dispatch({ type: SET_OPEN, payload: true })
  }

  function showTerminal(event: any): void {
    props.plugin.call('layout', 'minimize', props.plugin.profile.name, false)
    dispatchXterm({ type: 'SHOW_OUTPUT', payload: false })
    dispatch({ type: SET_OPEN, payload: true })
  }

  return (
    <div>
      <button className={`btn btn-sm btn-secondary mr-2 ${!xtermState.showOutput ? 'xterm-btn-none' : 'xterm-btn-active'}`} onClick={selectOutput}>output</button>
      <button className={`btn btn-sm btn-secondary ${xtermState.terminalsEnabled ? '' : 'd-none'} ${xtermState.showOutput ? 'xterm-btn-none' : 'xterm-btn-active'}`} onClick={showTerminal}><span className="far fa-terminal border-0 ml-1"></span></button>
    </div>
  )
}