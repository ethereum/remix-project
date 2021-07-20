import React, { useState, useEffect, useRef, SyntheticEvent } from 'react' // eslint-disable-line
import { useKeyPress } from './custom-hooks/useKeyPress'
import { useWindowResize } from 'beautiful-react-hooks'

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
  command: any
  version: any

  // blockRenderHtml: any
  // blockRenderLog: any
  // blockRenderInfo: any
  // blockRenderWarn: any
  // blockRenderError: any
}

export interface ClipboardEvent<T = Element> extends SyntheticEvent<T, any> {
  clipboardData: DataTransfer;
}

export const RemixUiTerminal = (props: RemixUiTerminalProps) => {

  const [toggleDownUp, setToggleDownUp] = useState('fa-angle-double-down')
  const [inserted, setInserted] = useState(false)
  const [_cmdIndex, setCmdIndex] = useState(-1)
  const [_cmdTemp, setCmdTemp] = useState('')
  const [_cmdHistory, setCmdHistory] = useState([])
  const [windowHeight, setWindowHeight] = useState(window.innerHeight)

  const [state, setState] = useState({
    journalBlocks: {
      intro: (
        <div>
          <div> - Welcome to Remix {props.version} - </div>
          <br/>
          <div>You can use this terminal to: </div>
          <ul className='ul'>
            <li>Check transactions details and start debugging.</li>
            <li>Execute JavaScript scripts:
              <br />
              <i> - Input a script directly in the command line interface </i>
              <br />
              <i> - Select a Javascript file in the file explorer and then run \`remix.execute()\` or \`remix.exeCurrent()\`  in the command line interface  </i>
              <br />
              <i> - Right click on a JavaScript file in the file explorer and then click \`Run\` </i>
            </li>
          </ul>
          <div>The following libraries are accessible:</div>
          <ul className='ul'>
            <li><a target="_blank" href="https://web3js.readthedocs.io/en/1.0/">web3 version 1.0.0</a></li>
            <li><a target="_blank" href="https://docs.ethers.io">ethers.js</a> </li>
            <li><a target="_blank" href="https://www.npmjs.com/package/swarmgw">swarmgw</a> </li>
            <li>remix (run remix.help() for more info)</li>
          </ul>
        </div>
      ),
      text: (<div>David</div>)
    },
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

  const _scopedCommands = () => {

  }

  useWindowResize(() => {
    setWindowHeight(window.innerHeight)
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

  const placeCaretAtEnd = (el) => {
    el.focus()
    const range = document.createRange()
    range.selectNodeContents(el)
    range.collapse(false)
    const sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)
  }

  // handle events
  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    // Do something
    const selection = window.getSelection()
    if (!selection.rangeCount) return false
    event.preventDefault()
    event.stopPropagation()
    const clipboard = (event.clipboardData) // || window.clipboardData
    let text = clipboard.getData('text/plain')
    text = text.replace(/[^\x20-\xFF]/gi, '') // remove non-UTF-8 characters
    const temp = document.createElement('div')
    temp.innerHTML = text
    const textnode = document.createTextNode(temp.textContent)
    selection.getRangeAt(0).insertNode(textnode)
    selection.empty()
    // self.scroll2bottom()
    placeCaretAtEnd(event.currentTarget)
  }

  const handleMinimizeTerminal = (event) => {
    event.preventDefault()
    event.stopPropagation()
    if (toggleDownUp === 'fa-angle-double-down') {
      console.log('clikced down')
      setToggleDownUp('fa-angle-double-up')
      props.event.trigger('resize', [])
    } else {
      console.log('clikced up')
      props.event.trigger('resize', [118])
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

  const putCursor2End = (editable) => {
    var range = document.createRange()
    console.log({ range })
    range.selectNode(editable)
    var child = editable
    var chars
    console.log({ child })
    while (child) {
      if (child.lastChild) child = child.lastChild
      else break
      if (child.nodeType === Node.TEXT_NODE) {
        chars = child.textContent.length
      } else {
        chars = child.innerHTML.length
      }
    }

    range.setEnd(child, chars)
    var toStart = true
    var toEnd = !toStart
    range.collapse(toEnd)

    var sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)

    editable.focus()
  }

  const wrapScript = (script) => {
    const isKnownScript = ['remix.', 'git'].some(prefix => script.trim().startsWith(prefix))
    if (isKnownScript) return script
    return `
      try {
        const ret = ${script};
        if (ret instanceof Promise) {
          ret.then((result) => { console.log(result) }).catch((error) => { console.log(error) })
        } else {
          console.log(ret)
        }   
      } catch (e) {
        console.log(e.message)
      }`
  }

  const handleKeyDown = (event) => {
    if (props.autoCompletePopup.handleAutoComplete(
      event,
      inputEl.current.innerText)) { return }
    if (inputEl.current.innerText.length === 0) {
      inputEl.current.innerText += '\n'
    }
    if (event.which === 13) {
      if (event.ctrlKey) { // <ctrl+enter>
        // on enter, append the value in the cli input to the journal
        // setState(prevState => ({...prevState.journalBlocks, prevState: inputEl})
        inputEl.current.innerText += '\n'
        inputEl.current.focus()
        // putCursor2End(inputEl.current)
        // scroll2botton () function not implemented
        props.autoCompletePopup.removeAutoComplete()
      } else {
        setCmdIndex(-1)
        setCmdTemp('')
        const script = inputEl.current.innerText.trim()
        console.log({ script })
        inputEl.current.innerText += '\n'
        if (script.length) {
          // self._cmdHistory.unshift(script)
          props.command.script(wrapScript(script))
        }
        props.autoCompletePopup.removeAutoComplete()
      }
    } else if (event.which === 38) { // <arrowUp>
      const len = _cmdHistory.length
      if (len === 0) event.preventDefault()
      if (_cmdHistory.length - 1 > _cmdIndex) {
        setCmdIndex(prevState => prevState++)
      }
      inputEl.current.innerText = _cmdHistory[_cmdIndex]
      inputEl.current.focus()
      // putCursor2End(inputEl.current)
      // self.scroll2bottom()
    }
    else if (event.which === 40) {
      if (_cmdIndex > -1) {
        setCmdIndex(prevState => prevState--)
      }
      inputEl.current.innerText = _cmdIndex >= 0 ? _cmdHistory[_cmdIndex] : _cmdTemp
      inputEl.current.focus()
      // putCursor2End(inputEl.current)
      // self.scroll2bottom()
    } else {
      setCmdTemp(inputEl.current.innerText)
    }
    console.log({ _cmdHistory })
    console.log({ _cmdIndex })
    console.log({ _cmdTemp })
  }

  const moveGhostbar = (event) => {
    return props.api.getPosition(event) + 'px'
  }

  const removeGhostbar = (event) => {
    if (toggleDownUp === 'fa-angle-double-up') {
      console.log('remove event')
      setToggleDownUp('fa-angle-double-down')
    }
    props.event.trigger('resize', [props.api.getPostion(event)])
  }

  const mousedown = (event) => {
    console.log({ windowHeight })
    console.log(event.which === 1, 'event.which === 1')
    event.preventDefault()
    moveGhostbar(event)
    if (event.which === 1) {
      console.log('event .which code 1')
      moveGhostbar(event)
    }
  }

  const cancelGhostbar = (event) => {
    if (event.keyCode === 27) {
      console.log('event .key code 27')
    }
  }

  return (
    <div style={{ height: '323px' }} className='panel_2A0YE0'>
      <div className="bar_2A0YE0">
        {/* ${self._view.dragbar} */}
        <div className="dragbarHorizontal_2A0YE0" onMouseDown={mousedown}></div>
        <div className="menu_2A0YE0 border-top border-dark bg-light" data-id="terminalToggleMenu">
          {/* ${self._view.icon} */}
          <i className={`mx-2 toggleTerminal_2A0YE0 fas ${toggleDownUp}`} data-id="terminalToggleIcon" onClick={ handleMinimizeTerminal }></i>
          <div className="mx-2" id="clearConsole" data-id="terminalClearConsole" >
            <i className="fas fa-ban" aria-hidden="true" title="Clear console"
            ></i>
          </div>
          {/* ${self._view.pendingTxCount} */}
          <div className="mx-2" title='Pending Transactions'>0</div>
          <div className="verticalLine_2A0YE0"></div>
          <div className="pt-1 h-80 mx-3 align-items-center listenOnNetwork_2A0YE0 custom-control custom-checkbox">
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
          <div className="search_2A0YE0">
            <i className="fas fa-search searchIcon_2A0YE0 bg-light" aria-hidden="true"></i>
            {/* ${self._view.inputSearch} */}
            <input
              // spellcheck = "false"
              type="text"
              className="border filter_2A0YE0 form-control"
              id="searchInput"
              // onkeydown=${filter}
              placeholder="Search with transaction hash or address"
              data-id="terminalInputSearch" />
          </div>
        </div>
      </div>
      <div tabIndex={-1} className="terminal_container_2A0YE0" data-id="terminalContainer" >
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
        <div className="terminal_2A0YE0">
          <div id="journal" className="journal_2A0YE0" data-id="terminalJournal">
            <div className="px-4 block_2A0YE0" data-id="block_null">
              {Object.entries(state.journalBlocks).map((x, index) => (
                <div key={index}>
                  {x}
                </div>
              ))}
            </div>
            <div className="anchor">
              {/* ${background} */}
              <div className="overlay background"></div>
              {/* ${text} */}
              <div className="overlay text"></div>
            </div>
          </div>
          <div id="terminalCli" data-id="terminalCli" className="cli_2A0YE0" onClick={focusinput}>
            <span className="prompt">{'>'}</span>
            <span className="input" ref={inputEl} spellCheck="false" contentEditable="true" id="terminalCliInput" data-id="terminalCliInput" onPaste={handlePaste} onKeyDown={ handleKeyDown }></span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RemixUiTerminal
