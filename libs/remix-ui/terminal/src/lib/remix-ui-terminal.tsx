import React, { useState, useEffect, useReducer, useRef, SyntheticEvent, MouseEvent } from 'react' // eslint-disable-line
import { useKeyPress } from './custom-hooks/useKeyPress' // eslint-disable-line
import { useWindowResize } from 'beautiful-react-hooks'
import { registerCommandAction, filterFnAction, registerLogScriptRunnerAction, registerInfoScriptRunnerAction, registerErrorScriptRunnerAction, registerWarnScriptRunnerAction, registerRemixWelcomeTextAction } from './actions/terminalAction'
import { initialState, registerCommandReducer, registerFilterReducer, addCommandHistoryReducer, registerScriptRunnerReducer, remixWelcomeTextReducer } from './reducers/terminalReducer'
import { remixWelcome } from './reducers/remixWelcom'
import {getKeyOf, getValueOf} from './utils/utils'
import {allCommands, allPrograms} from './commands' // eslint-disable-line
import javascriptserialize from 'javascript-serialize'
import jsbeautify from 'js-beautify'

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
  command: any
  version: any
  config: any
  thisState: any
  vm: any
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
  // dragable state
  const [leftHeight, setLeftHeight] = useState<undefined | number>(undefined)
  const [separatorYPosition, setSeparatorYPosition] = useState<undefined | number>(undefined)
  const [dragging, setDragging] = useState(false)

  const [newstate, dispatch] = useReducer(registerCommandReducer, initialState)
  const [filterState, filterDispatch] = useReducer(registerFilterReducer, initialState)
  const [cmdHistory, cmdHistoryDispatch] = useReducer(addCommandHistoryReducer, initialState)
  const [scriptRunnserState, scriptRunnerDispatch] = useReducer(registerScriptRunnerReducer, initialState)
  const [welcomeTextState, welcomTextDispath] = useReducer(remixWelcomeTextReducer, initialState)
  const [autoCompletState, setAutoCompleteState] = useState({
    activeSuggestion: 0,
    data: {
      _options: []
    },
    _startingElement: 0,
    _elementToShow: 4,
    _selectedElement: 0,
    filteredCommands: [],
    filteredPrograms: [],
    showSuggestions: false,
    text: '',
    userInput: '',
    extraCommands: []
  })

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
    registerRemixWelcomeTextAction(remixWelcome, welcomTextDispath)
    registerLogScriptRunnerAction(props.thisState, 'log', newstate.commands, scriptRunnerDispatch)
    registerInfoScriptRunnerAction(props.thisState, 'info', newstate.commands, scriptRunnerDispatch)
    registerWarnScriptRunnerAction(props.thisState, 'warn', newstate.commands, scriptRunnerDispatch)
    registerErrorScriptRunnerAction(props.thisState, 'error', newstate.commands, scriptRunnerDispatch)
    registerCommandAction('html', _blocksRenderer('html'), { activate: true }, dispatch)
    registerCommandAction('log', _blocksRenderer('log'), { activate: true }, dispatch)
    registerCommandAction('info', _blocksRenderer('info'), { activate: true }, dispatch)
    registerCommandAction('warn', _blocksRenderer('warn'), { activate: true }, dispatch)
    registerCommandAction('error', _blocksRenderer('error'), { activate: true }, dispatch)
    registerCommandAction('script', function execute (args, scopedCommands, append) {
      var script = String(args[0])
      _shell(script, scopedCommands, function (error, output) {
        console.log({ error }, 'registerCommand scrpt')
        console.log({ output }, 'registerCommand scrpt 2')
        if (error) scriptRunnerDispatch({ type: 'error', payload: { message: error } })
        else if (output) scriptRunnerDispatch({ type: 'error', payload: { message: output } })
      })
    }, { activate: true }, dispatch)
    filterFnAction('log', basicFilter, filterDispatch)
    filterFnAction('info', basicFilter, filterDispatch)
    filterFnAction('warn', basicFilter, filterDispatch)
    filterFnAction('error', basicFilter, filterDispatch)
    filterFnAction('script', basicFilter, filterDispatch)
    registerLogScriptRunnerAction(props.thisState, 'log', newstate.commands, scriptRunnerDispatch)
    registerInfoScriptRunnerAction(props.thisState, 'info', newstate.commands, scriptRunnerDispatch)
    registerWarnScriptRunnerAction(props.thisState, 'warn', newstate.commands, scriptRunnerDispatch)
    registerErrorScriptRunnerAction(props.thisState, 'error', newstate.commands, scriptRunnerDispatch)
    // console.log({ htmlresullt }, { logresult })
    // dispatch({ type: 'html', payload: { commands: htmlresullt.commands } })
    // dispatch({ type: 'log', payload: { _commands: logresult._commands } })
    // registerCommand('log', _blocksRenderer('log'), { activate: true })
  }, [newstate.journalBlocks, props.thisState.autoCompletePopup, autoCompletState.text])

  const placeCaretAtEnd = (el) => {
    el.focus()
    const range = document.createRange()
    range.selectNodeContents(el)
    range.collapse(false)
    const sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)
  }

  const _shell = async (script, scopedCommands, done) => { // default shell
    if (script.indexOf('remix:') === 0) {
      return done(null, 'This type of command has been deprecated and is not functionning anymore. Please run remix.help() to list available commands.')
    }

    if (script.indexOf('remix.') === 0) {
      // we keep the old feature. This will basically only be called when the command is querying the "remix" object.
      // for all the other case, we use the Code Executor plugin
      var context = props.cmdInterpreter
      try {
        var cmds = props.vm.createContext(context)
        var result = props.vm.runInContext(script, cmds)
        return done(null, result)
      } catch (error) {
        return done(error.message)
      }
    }
    try {
      if (script.trim().startsWith('git')) {
        // result = await this.call('git', 'execute', script)
      } else {
        result = await props.thisState.call('scriptRunner', 'execute', script)
      }
      done()
    } catch (error) {
      done(error.message || error)
    }
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
      const terminalTopOffset = props.config.config.get('terminal-top-offset')
      props.event.trigger('resize', [terminalTopOffset])
      setToggleDownUp('fa-angle-double-down')
    }
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
        }
        `
  }

  const handleKeyDown = (event) => {
    if (event.which === 13) {
      if (event.ctrlKey) { // <ctrl+enter>
        // on enter, append the value in the cli input to the journal
        inputEl.current.focus()
      } else { // <enter>
        event.preventDefault()
        console.log('hit enter')
        setCmdIndex(-1)
        setCmdTemp('')
        const script = autoCompletState.userInput.trim() // inputEl.current.innerText.trim()
        if (script.length) {
          cmdHistoryDispatch({ type: 'cmdHistory', payload: { script } })
          newstate.commands.script(wrapScript(script))
        }
        setAutoCompleteState(prevState => ({ ...prevState, userInput: '' }))
        inputEl.current.innerText = ''
        inputEl.current.focus()
        setAutoCompleteState(prevState => ({ ...prevState, showSuggestions: false }))
      }
    } else if (event.which === 38) { // <arrowUp>
      const len = _cmdHistory.length
      if (len === 0) event.preventDefault()
      if (_cmdHistory.length - 1 > _cmdIndex) {
        setCmdIndex(prevState => prevState++)
      }
      inputEl.current.innerText = _cmdHistory[_cmdIndex]
      inputEl.current.focus()
    }
    else if (event.which === 40) {
      if (_cmdIndex > -1) {
        setCmdIndex(prevState => prevState--)
      }
      inputEl.current.innerText = _cmdIndex >= 0 ? _cmdHistory[_cmdIndex] : _cmdTemp
      inputEl.current.focus()
    } else {
      setCmdTemp(inputEl.current.innerText)
    }
  }

  const moveGhostbar = (event) => {
    return props.api.getPosition(event) + 'px'
  }

  const removeGhostbar = (event) => {
    if (toggleDownUp === 'fa-angle-double-up') {
      console.log('remove event')
      setToggleDownUp('fa-angle-double-down')
    }
    const value = props.event.get('resize')
    console.log({ value })
    props.event.trigger('resize', [value])
  }

  /* start of mouse events */

  const mousedown = (event: MouseEvent) => {
    setSeparatorYPosition(event.clientY)
    setDragging(true)
    // console.log({ windowHeight })
    // console.log(event.which === 1, 'event.which === 1')
    // event.preventDefault()
    // moveGhostbar(event)
    // if (event.which === 1) {
    //   console.log('event .which code 1')
    //   moveGhostbar(event)
    // }
  }

  const onMouseMove: any = (e: MouseEvent) => {
    e.preventDefault()
    if (dragging && leftHeight && separatorYPosition) {
      const newEditorHeight = leftHeight - e.clientY + separatorYPosition
      const newLeftHeight = leftHeight + separatorYPosition - e.clientY
      setSeparatorYPosition(e.clientY)
      setLeftHeight(newLeftHeight)
      props.event.trigger('resize', [newLeftHeight + 32])
      console.log({ newLeftHeight })
    }
  }

  const onMouseUp = () => {
    setDragging(false)
  }


  /* end of mouse event */

  const cancelGhostbar = (event) => {
    if (event.keyCode === 27) {
      console.log('event .key code 27')
    }
  }

  useEffect(() => {
    // document.addEventListener('mousemove', changeBg)
    // function changeBg () {
    //   document.getElementById('dragId').style.backgroundColor = 'skyblue'
    // }
    // document.addEventListener('mouseup', changeBg2)
    // function changeBg2 () {
    //   document.getElementById('dragId').style.backgroundColor = ''
    // }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)

    return () => {
      // document.addEventListener('mousemove', changeBg)
      // function changeBg () {
      //   document.getElementById('dragId').style.backgroundColor = 'skyblue'
      // }
      // document.addEventListener('mouseup', changeBg2)
      // function changeBg2 () {
      //   document.getElementById('dragId').style.backgroundColor = ''
      // }
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  })

  React.useEffect(() => {
    const leftRef = document.getElementById('terminal-view')
    const editorRef = document.getElementById('mainPanelPluginsContainer-id')
    if (leftRef) {
      if (!leftHeight) {
        setLeftHeight(leftRef.offsetHeight)
        return
      }
      leftRef.style.height = `${leftHeight}px`
    }
  }, [leftHeight, setLeftHeight, inputEl])

  /* block contents that gets rendered from scriptRunner */

  const _blocksRenderer = (mode) => {
    if (mode === 'html') {
      return function logger (args) {
        console.log({ args })
        if (args.length) {
          return args[0]
        }
      }
    }
    mode = {
      log: 'text-log',
      info: 'text-info',
      warn: 'text-warning',
      error: 'text-danger'
    }[mode] // defaults

    if (mode) {
      const filterUndefined = (el) => el !== undefined && el !== null
      return function logger (args) {
        var types = args.filter(filterUndefined).map(type => type)
        var values = javascriptserialize.apply(null, args.filter(filterUndefined)).map(function (val, idx) {
          if (typeof args[idx] === 'string') {
            const el = document.createElement('div')
            el.innerHTML = args[idx].replace(/(\r\n|\n|\r)/gm, '<br>')
            val = el.children.length === 0 ? el.firstChild : el
          }
          if (types[idx] === 'element') val = jsbeautify.html(val)
          return val
        })
        if (values.length) {
          console.log({ values })
          return `<span class="${mode}" >${values}</span>`
        }
      }
    } else {
      throw new Error('mode is not supported')
    }
  }

  function basicFilter (value, query) { try { return value.indexOf(query) !== -1 } catch (e) { return false } }

  const registerCommand = (name, command, opts) => {
    // setState((prevState) => ({ ...prevState, _commands[name]: command }))
  }

  /* end of block content that gets rendered from script Runner */

  /* start of autoComplete */
  const handleSelect = (text) => {
    props.thisState.event.trigger('handleSelect', [text])
  }

  const onChange = (event: any) => {
    event.preventDefault()
    const inputString = event.target.value
    console.log(event)
    console.log({ inputString })
    setAutoCompleteState(prevState => ({ ...prevState, showSuggestions: true, userInput: inputString }))
    const textList = inputString.split(' ')
    const autoCompleteInput = textList.length > 1 ? textList[textList.length - 1] : textList[0]
    allPrograms.forEach(item => {
      const program = getKeyOf(item)
      console.log({ program })
      if (program.substring(0, program.length - 1).includes(autoCompleteInput.trim())) {
        setAutoCompleteState(prevState => ({ ...prevState, data: { _options: [item] } }))
      } else if (autoCompleteInput.trim().includes(program) || (program === autoCompleteInput.trim())) {
        allCommands.forEach(item => {
          console.log({ item })
          const command = getKeyOf(item)
          if (command.includes(autoCompleteInput.trim())) {
            setAutoCompleteState(prevState => ({ ...prevState, data: { _options: [item] } }))
          }
        })
      }
    })
    autoCompletState.extraCommands.forEach(item => {
      const command = getKeyOf(item)
      if (command.includes(autoCompleteInput.trim())) {
        setAutoCompleteState(prevState => ({ ...prevState, data: { _options: [item] } }))
      }
    })
    if (autoCompletState.data._options.length === 1 && event.which === 9) {
      // if only one option and tab is pressed, we resolve it
      event.preventDefault()
      textList.pop()
      textList.push(getKeyOf(autoCompletState.data._options[0]))
      handleSelect(`${textList}`.replace(/,/g, ' '))
    }
  }

  const handleAutoComplete = () => (
    <div className="popup alert alert-secondary">
      <div>
          ${autoCompletState.data._options.map((item, index) => {
          return (
            <div key={index}>auto complete here</div>
            // <div data-id="autoCompletePopUpAutoCompleteItem" className={`autoCompleteItem listHandlerHide item ${_selectedElement === index ? 'border border-primary' : ''}`}>
            //   <div value={index} onClick={(event) => { handleSelect(event.srcElement.innerText) }}>
            //     {getKeyOf(item)}
            //   </div>
            //   <div>
            //     {getValueOf(item)}
            //   </div>
            // </div>
          )
        })}
      </div>
      {/* <div className="listHandlerHide">
        <div className="pageNumberAlignment">Page ${(self._startingElement / self._elementsToShow) + 1} of ${Math.ceil(data._options.length / self._elementsToShow)}</div>
      </div> */}
    </div>
  )
  /* end of autoComplete */

  return (
    <div style={{ height: '323px' }} className='panel_2A0YE0'>
      {console.log({ newstate })}
      {console.log({ props })}
      {console.log({ autoCompletState })}
      <div className="bar_2A0YE0">
        {/* ${self._view.dragbar} */}
        <div className="dragbarHorizontal" onMouseDown={mousedown} id='dragId'></div>
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
        {
          (autoCompletState.showSuggestions && autoCompletState.userInput) && handleAutoComplete()
        }
        <div data-id="terminalContainerDisplay" style = {{
          position: 'absolute',
          height: '100',
          width: '100',
          opacity: '0.1',
          zIndex: -1
        }}></div>
        <div className="terminal_2A0YE0">
          <div id="journal" className="journal_2A0YE0" data-id="terminalJournal">
            {(newstate.journalBlocks).map((x, index) => (
              <div className="px-4 block_2A0YE0" data-id="block_null" key={index}>
                <span className={x.style}>{x.message}</span>
              </div>
            ))}
            <div className="anchor">
              {/* ${background} */}
              <div className="overlay background"></div>
              {/* ${text} */}
              <div className="overlay text"></div>
            </div>
          </div>
          <div id="terminalCli" data-id="terminalCli" className="cli_2A0YE0" onClick={focusinput}>
            <span className="prompt_2A0YE0">{'>'}</span>
            <input className="input_2A0YE0" ref={inputEl} spellCheck="false" contentEditable="true" id="terminalCliInput" data-id="terminalCliInput" onChange={(event) => onChange(event)} onKeyDown={(event) => handleKeyDown(event) } value={autoCompletState.userInput}></input>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RemixUiTerminal
