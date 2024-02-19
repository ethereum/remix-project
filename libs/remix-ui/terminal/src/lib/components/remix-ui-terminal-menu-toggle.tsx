import { CustomTooltip } from '@remix-ui/helper'
import React, { useContext, useEffect } from 'react' // eslint-disable-line
import { FormattedMessage } from 'react-intl'
import { TerminalContext } from '../context'
import { RemixUiTerminalProps, TOGGLE } from '../types/terminalTypes'
export const RemixUITerminalMenuToggle = (props: RemixUiTerminalProps) => {

  const { terminalState, dispatch } = useContext(TerminalContext)

  function handleToggleTerminal(event: any): void {
    dispatch({ type: TOGGLE })
  }

  return (
    <>
      <CustomTooltip
        placement="top"
        tooltipId="terminalToggle"
        tooltipClasses="text-nowrap"
        tooltipText={terminalState.isOpen ? <FormattedMessage id="terminal.hideTerminal" /> : <FormattedMessage id="terminal.showTerminal" />}
      >
        <i
          className={`mx-2 remix_ui_terminal_toggleTerminal fas ${terminalState.isOpen ? 'fa-angle-double-down' : 'fa-angle-double-up'}`}
          data-id="terminalToggleIcon"
          onClick={handleToggleTerminal}
        ></i>
      </CustomTooltip>
    </>
  )
}