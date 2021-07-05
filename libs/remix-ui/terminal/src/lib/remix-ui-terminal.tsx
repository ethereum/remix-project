import React, { useState, useEffect } from 'react' // eslint-disable-line

import './remix-ui-terminal.css'

/* eslint-disable-next-line */
export interface RemixUiTerminalProps {
  propterties: any
  event: any
  autoCompletePopupEvent: any
  autoCompletePopup: any
  blockchain: any
  api: any
  options: any
  data: any
  cmdInterpreter: any
}

export const RemixUiTerminal = (props: RemixUiTerminalProps) => {

  const [toggleDownUp, setToggleDownUp] = useState('fa-angle-double-down')
  const [inserted, setInserted] = useState(false)
  // events
  useEffect(() => {
    // window.addEventListener('resize', function () {
    //   props.event.trigger('resize', [])
    //   props.event.trigger('resize', [])
    // })
    // return () => {
    //   window.removeEventListener('resize', function () {
    //     props.event.trigger('resize', [])
    //     props.event.trigger('resize', [])
    //   })
    // }
  }, [])

  const handleMinimizeTerminal = (event) => {
    console.log('clikced', props.event)
    if (toggleDownUp === 'fa-angle-double-down') {
      console.log('clikced down')
      setToggleDownUp('fa-angle-double-up')
      props.event.trigger.resize('resize', [])
    } else {
      console.log('clikced up')
      // event.trigger('resize', [])
      setToggleDownUp('fa-angle-double-down')
    }
    console.log(props.event, 'event.trigger')
  }

  const reattached = (event) => {
    let el = event.currentTarget
    var isBottomed = el.scrollHeight - el.scrollTop - el.clientHeight < 30
    if (isBottomed) {

    }
  }


  return (
    <div>
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
      <div className="terminal_container" data-id="terminalContainer" >
        {/* onScroll=${throttle(reattach, 10)} onkeydown=${focusinput} */}
        {/* {props.autoCompletePopup.render()} */}
        {console.log({ props })}
        <div data-id="terminalContainerDisplay" style = {{
          position: 'absolute',
          height: '100',
          width: '100',
          opacity: '0.1',
          zIndex: -1
        }}></div>
        <div className="terminal">
          <div id="journal" className="journal" data-id="terminalJournal">
          </div>
        </div>
      </div>
    </div>
  )
}

export default RemixUiTerminal
