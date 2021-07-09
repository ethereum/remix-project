import React, { useState, useEffect, useRef, SyntheticEvent } from 'react' // eslint-disable-line

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
  registerCommand: any
}

export interface ClipboardEvent<T = Element> extends SyntheticEvent<T, any> {
  clipboardData: DataTransfer;
}

export const RemixUiTerminal = (props: RemixUiTerminalProps) => {

  const [toggleDownUp, setToggleDownUp] = useState('fa-angle-double-down')
  const [inserted, setInserted] = useState(false)

  const [state, setState] = useState({
    data: {
      // lineLength: props.options.lineLength || 80,
      session: [],
      activeFilters: { commands: {}, input: '' },
      filterFns: {}
    },
    _commands: {},
    commands: {},
    _JOURNAL: [],
    _jobs: [],
    _INDEX: {},
    _INDEXall: [],
    _INDEXallMain: [],
    _INDEXcommands: {},
    _INDEXcommandsMain: {}
  })

  // terminal inputRef
  const inputEl = useRef(null)
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

  // handle events
  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    // Do something
    const selection = window.getSelection()
    if (!selection.rangeCount) return false
    event.preventDefault()
    event.stopPropagation()
    var clipboard = (event.clipboardData) // || window.clipboardData
    var text = clipboard.getData('text/plain')
    text = text.replace(/[^\x20-\xFF]/gi, '') // remove non-UTF-8 characters
    var temp = document.createElement('div')
    temp.innerHTML = text
    var textnode = document.createTextNode(temp.textContent)
    selection.getRangeAt(0).insertNode(textnode)
    selection.empty()
    // self.scroll2bottom()
    // placeCaretAtEnd(event.currentTarget)
  }

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

  // const reattached = (event) => {
  //   let el = event.currentTarget
  //   var isBottomed = el.scrollHeight - el.scrollTop - el.clientHeight < 30
  //   if (isBottomed) {

  //   } else {
  //     // if (!inserted)  
  //   }
  // }

  const registerCommand = (name, command, opts) => {
    const { _commands, _INDEXcommands, _INDEXallMain, _INDEXcommandsMain, _INDEXall, commands } = state
    // TODO if no _commands[name] throw an error

    // TODO if typeof command !== 'function' throw error

    _commands[name] = command
    _INDEXcommands[name] = []
    _INDEXallMain[name] = []

    // TODO _command function goes here
    commands[name] = function _command () {
      const steps = []
      const args = [...arguments]
      const gidx = 0
      const idx = 0
      const step = 0
      const root = { steps, cmd: name, gidx, idx }
      const ITEM = { root, cmd: name, el: {} }
      root.gidx = _INDEXallMain.push(ITEM) - 1
      root.idx = _INDEXcommandsMain[name].push(ITEM) - 1
      function append (cmd, params, el) {
        let item = { el, cmd, root, gidx, idx, step, args: [...arguments] }
        if (cmd) {
          item = { el, cmd, root, gidx, idx, step, args }
        } else {
          // item = ITEM
          item.el = el
          cmd = name
        }
        item.gidx = _INDEXall.push(item) - 1
        item.idx = _INDEXcommands[cmd].push(item) - 1
        item.step = steps.push(item) - 1
        item.args = params
        _appendItem(item)
      }
    }

    return commands[name]
  }

  const _appendItem = (item: any) => {
    let { _JOURNAL, _jobs, data } = state
    const self = props
    const { el, gidx } = item
    _JOURNAL[gidx] = item
    if (!_jobs.length) {
      // requestAnimationFrame(function updateTerminal () {
      //   self._jobs.forEach(el => self._view.journal.appendChild(el))
      //   self.scroll2bottom()
      _jobs = []
    }
    if (data.activeFilters.commands[item.cmd]) _jobs.push(el)
  }

  const focusinput = () => {
    inputEl.current.focus()
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
            <div className="anchor">
              {/* ${background} */}
              <div className="overlay background"></div>
              {/* ${text} */}
              <div className="overlay text"></div>
            </div>
          </div>
          <div id="terminalCli" data-id="terminalCli" className="cli" onClick={focusinput}>
            <span className="prompt">{'>'}</span>
            <span className="input" ref={inputEl} spellCheck="false" contentEditable="true" id="terminalCliInput" data-id="terminalCliInput" onPaste={handlePaste}></span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RemixUiTerminal
