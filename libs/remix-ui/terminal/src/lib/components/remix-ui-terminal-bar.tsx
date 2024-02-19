import { CustomTooltip } from '@remix-ui/helper'
import React, { useState, useEffect, useReducer, useRef, useContext } from 'react' // eslint-disable-line
import { FormattedMessage, useIntl } from 'react-intl'
import { TerminalContext } from '../context/context'
import { initialState, registerCommandReducer } from '../reducers/terminalReducer'
import { RemixUiTerminalProps } from '../types/terminalTypes'

export const RemixUITerminalBar = (props: RemixUiTerminalProps) => {
  const { newstate: state, dispatch } = useContext(TerminalContext)
  const [isVM, setIsVM] = useState(false)
  const intl = useIntl()
  const terminalMenu = useRef(null)

  function handleToggleTerminal(event: any): void {
    dispatch({ type: 'toggle' })
  }

  useEffect(() => {
    props.plugin.call('layout', 'minimize', props.plugin.profile.name, !state.isOpen)
  }, [state.isOpen])

  useEffect(() => {
    console.log('state change', state)
  }, [state])

  function handleClearConsole(event: any): void {
    dispatch({ type: 'clearconsole', payload: [] })
  }

  function listenOnNetwork(event: any): void {
    throw new Error('Function not implemented.')
  }

  function setSearchInput(arg0: string): void {
    throw new Error('Function not implemented.')
  }

  return (<>
    <div className="remix_ui_terminal_bar d-flex">
      <div className="remix_ui_terminal_menu d-flex w-100 align-items-center position-relative border-top border-dark bg-light" ref={terminalMenu} data-id="terminalToggleMenu">
        <CustomTooltip
          placement="top"
          tooltipId="terminalToggle"
          tooltipClasses="text-nowrap"
          tooltipText={state.isOpen ? <FormattedMessage id="terminal.hideTerminal" /> : <FormattedMessage id="terminal.showTerminal" />}
        >
          <i
            className={`mx-2 remix_ui_terminal_toggleTerminal fas ${state.isOpen ? 'fa-angle-double-down' : 'fa-angle-double-up'}`}
            data-id="terminalToggleIcon"
            onClick={handleToggleTerminal}
          ></i>
        </CustomTooltip>
        <div className="mx-2 remix_ui_terminal_console" id="clearConsole" data-id="terminalClearConsole" onClick={handleClearConsole}>
          <CustomTooltip placement="top" tooltipId="terminalClear" tooltipClasses="text-nowrap" tooltipText={<FormattedMessage id="terminal.clearConsole" />}>
            <i className="fas fa-ban" aria-hidden="true"></i>
          </CustomTooltip>
        </div>
        <CustomTooltip placement="top" tooltipId="terminalClear" tooltipClasses="text-nowrap" tooltipText={<FormattedMessage id="terminal.pendingTransactions" />}>
          <div className="mx-2">0</div>
        </CustomTooltip>
        <CustomTooltip
          placement="top"
          tooltipId="terminalClear"
          tooltipClasses="text-nowrap"
          tooltipText={intl.formatMessage({ id: isVM ? 'terminal.listenVM' : 'terminal.listenTitle' })}
        >
          <div className="h-80 mx-3 align-items-center remix_ui_terminal_listenOnNetwork custom-control custom-checkbox">
            <CustomTooltip placement="top" tooltipId="terminalClear" tooltipClasses="text-nowrap" tooltipText={intl.formatMessage({ id: 'terminal.listenTitle' })}>
              <input
                className="custom-control-input"
                id="listenNetworkCheck"
                onChange={listenOnNetwork}
                type="checkbox"
                disabled={isVM}
              />
            </CustomTooltip>
            <label
              className="form-check-label custom-control-label text-nowrap"
              style={{ paddingTop: '0.125rem' }}
              htmlFor="listenNetworkCheck"
              data-id="listenNetworkCheckInput"
            >
              <FormattedMessage id="terminal.listen" />
            </label>
          </div>
        </CustomTooltip>
        <div className="remix_ui_terminal_search d-flex align-items-center h-100">
          <i className="remix_ui_terminal_searchIcon d-flex align-items-center justify-content-center fas fa-search bg-light" aria-hidden="true"></i>
          <input
            onChange={(event) => setSearchInput(event.target.value.trim())}
            type="text"
            className="remix_ui_terminal_filter border form-control"
            id="searchInput"
            placeholder={intl.formatMessage({ id: 'terminal.search' })}
            data-id="terminalInputSearch"
          />
        </div>
      </div>
    </div></>)
}