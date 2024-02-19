import { CustomTooltip } from '@remix-ui/helper';
import { TerminalContext } from '@remix-ui/terminal';
import { createTerminal } from '@remix-ui/xterm';
import React, { useState, useEffect, useRef, useContext } from 'react' // eslint-disable-line
import { Dropdown, ButtonGroup } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { RemixUiTerminalProps } from "../../../../terminal/src/lib/types/terminalTypes";

export const RemixUIXtermMenu = (props: RemixUiTerminalProps) => {
  const { xtermState, dispatchXterm } = useContext(TerminalContext)

  function onClearTerminal(): void | PromiseLike<void> {
    const terminal = xtermState.terminals.find(xtermState => xtermState.hidden === false)
    if (terminal && terminal.ref && terminal.ref.terminal)
      terminal.ref.terminal.clear()
  }

  function onCreateTerminal(shell?: string): void | PromiseLike<void> {
    createTerminal(shell, props.plugin, xtermState.workingDir, dispatchXterm)
  }

  function onCloseTerminal(): void | PromiseLike<void> {
    const pid = xtermState.terminals.find(xtermState => xtermState.hidden === false).pid
    if (pid)
      props.plugin.call('xterm', 'closeTerminal', pid)
  }

  return (<>
    <div className={`${xtermState.showOutput ? 'd-none' : ''}`}>
      <button className="btn btn-sm btn-secondary mr-2" onClick={async () => onClearTerminal()}>
        <CustomTooltip tooltipText={<FormattedMessage id='xterm.clear' defaultMessage='Clear terminal' />}>
          <span className="far fa-ban border-0 p-0 m-0"></span>
        </CustomTooltip>
      </button>
      <button className="btn btn-sm btn-secondary" onClick={async () => onCreateTerminal()}>
        <CustomTooltip tooltipText={<FormattedMessage id='xterm.new' defaultMessage='New terminal' />}>
          <span className="far fa-plus border-0 p-0 m-0"></span>
        </CustomTooltip>
      </button>
      <Dropdown as={ButtonGroup}>
        <Dropdown.Toggle split variant="secondary" id="dropdown-split-basic" />
        <Dropdown.Menu className='custom-dropdown-items remixui_menuwidth'>
          {xtermState.shells.map((shell, index) => {
            return (<Dropdown.Item key={index} onClick={async () => await onCreateTerminal(shell)}>{shell}</Dropdown.Item>)
          })}
        </Dropdown.Menu>
      </Dropdown>
      <button className="btn ml-2 btn-sm btn-secondary" onClick={onCloseTerminal}>
        <CustomTooltip tooltipText={<FormattedMessage id='xterm.close' defaultMessage='Close terminal' />}>
          <span className="far fa-trash border-0 ml-1"></span>
        </CustomTooltip>
      </button>
    </div>
  </>)
}