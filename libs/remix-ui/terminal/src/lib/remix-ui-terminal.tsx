import React, { useState } from 'react' // eslint-disable-line

import './remix-ui-terminal.css'

/* eslint-disable-next-line */
export interface RemixUiTerminalProps {
  propterties: any
}

export const RemixUiTerminal = (props: RemixUiTerminalProps) => {

  const [toggleDownUp, setToggleDownUp] = useState('fa-angle-double-down')

  const handleMinimizeTerminal = (event) => {
    console.log('clikced')
    if (toggleDownUp === 'fa-angle-double-down') {
      console.log('clikced down')
      setToggleDownUp('fa-angle-double-up')
    } else {
      console.log('clikced up')
      // event.trigger('resize', [])
      setToggleDownUp('fa-angle-double-down')
    }
  }
  return (
    <div>
      {console.log({ toggleDownUp })}
      <div className="bar">
        {/* ${self._view.dragbar} */}
        <div className="dragbarHorizontal"></div>
        <div className="menu border-top border-dark bg-light" data-id="terminalToggleMenu">
          {/* ${self._view.icon} */}
          <i className={`mx-2 toggleTerminal fas ${toggleDownUp}`} data-id="terminalToggleIcon" onClick={ handleMinimizeTerminal }></i>
          <div className="mx-2" id="clearConsole" data-id="terminalClearConsole" >
            <i className="fas fa-ban" aria-hidden="true" title="Clear console"
            ></i>
          </div>
          {/* ${self._view.pendingTxCount} */}
          <div className="mx-2" title='Pending Transactions'>0</div>
          <div className="verticalLine"></div>
          <div className="pt-1 h-80 mx-3 align-items-center listenOnNetwork custom-control custom-checkbox">
            <input
              className="custom-control-input"
              id="listenNetworkCheck"
              // onChange=${listenOnNetwork}
              type="checkbox"
              title="If checked Remix will listen on all transactions mined in the current environment and not only transactions created by you"
            />
            <label
              className="pt-1 form-check-label custom-control-label text-nowrap"
              title="If checked Remix will listen on all transactions mined in the current environment and not only transactions created by you"
              htmlFor="listenNetworkCheck"
            >
              listen on network
            </label>
          </div>
          <div className="search">
            <i className="fas fa-search searchIcon bg-light" aria-hidden="true"></i>
            {/* ${self._view.inputSearch} */}
            <input
              // spellcheck = "false"
              type="text"
              className="border filter form-control"
              id="searchInput"
              // onkeydown=${filter}
              placeholder="Search with transaction hash or address"
              data-id="terminalInputSearch" />
          </div>
        </div>
      </div>
      Welcome to remix-ui-terminal {console.log(props.propterties, ' properties david')}
    </div>
  )
}

export default RemixUiTerminal
