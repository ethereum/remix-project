import React, { useState, useEffect, useReducer, useRef, SyntheticEvent, MouseEvent } from 'react' // eslint-disable-line
import { useWindowResize } from 'beautiful-react-hooks'
import { registerCommandAction, registerLogScriptRunnerAction, registerInfoScriptRunnerAction, registerErrorScriptRunnerAction, registerWarnScriptRunnerAction, listenOnNetworkAction, initListeningOnNetwork } from './actions/terminalAction'
import { initialState, registerCommandReducer, addCommandHistoryReducer, registerScriptRunnerReducer } from './reducers/terminalReducer'
import { getKeyOf, getValueOf, Objectfilter, matched } from './utils/utils'
import {allCommands, allPrograms} from './commands' // eslint-disable-line
import TerminalWelcomeMessage from './terminalWelcome' // eslint-disable-line

import './remix-ui-terminal.css'
import vm from 'vm'
import javascriptserialize from 'javascript-serialize'
import jsbeautify from 'js-beautify'
import RenderUnKnownTransactions from './components/RenderUnknownTransactions' // eslint-disable-line
import RenderCall from './components/RenderCall' // eslint-disable-line
import RenderKnownTransactions from './components/RenderKnownTransactions' // eslint-disable-line
import parse from 'html-react-parser'
import { RemixUiTerminalProps } from './types/terminalTypes'
import { wrapScript } from './utils/wrapScript'

/* eslint-disable-next-line */

export interface ClipboardEvent<T = Element> extends SyntheticEvent<T, any> {
  clipboardData: DataTransfer;
}

export const RemixUiTerminal = (props: RemixUiTerminalProps) => {
  const { call, _deps, on, config, event, gistHandler, logHtml, logResponse, version } = props.plugin
  const [toggleDownUp, setToggleDownUp] = useState('fa-angle-double-down')
  const [_cmdIndex, setCmdIndex] = useState(-1)
  const [_cmdTemp, setCmdTemp] = useState('')
  const [, setWindowHeight] = useState(window.innerHeight)
  // dragable state
  const [leftHeight, setLeftHeight] = useState<undefined | number>(undefined)
  const [separatorYPosition, setSeparatorYPosition] = useState<undefined | number>(undefined)
  const [dragging, setDragging] = useState(false)

  const [newstate, dispatch] = useReducer(registerCommandReducer, initialState)
  const [cmdHistory, cmdHistoryDispatch] = useReducer(addCommandHistoryReducer, initialState)
  const [, scriptRunnerDispatch] = useReducer(registerScriptRunnerReducer, initialState)
  const [, setIsListeningOnNetwork] = useState(false)
  const [clearConsole, setClearConsole] = useState(false)
  const [paste, setPaste] = useState(false)
  const [autoCompletState, setAutoCompleteState] = useState({
    activeSuggestion: 0,
    data: {
      _options: []
    },
    _startingElement: 0,
    autoCompleteSelectedItem: {},
    _elementToShow: 4,
    _selectedElement: 0,
    filteredCommands: [],
    filteredPrograms: [],
    showSuggestions: false,
    text: '',
    userInput: '',
    extraCommands: [],
    commandHistoryIndex: 0
  })

  const [searchInput, setSearchInput] = useState('')
  const [showTableHash, setShowTableHash] = useState([])

  useWindowResize(() => {
    setWindowHeight(window.innerHeight)
  })

  // terminal inputRef
  const inputEl = useRef(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scriptRunnerDispatch({ type: 'html', payload: { message: logHtml } })
  }, [logHtml])

  useEffect(() => {
    scriptRunnerDispatch({ type: 'log', payload: { message: logResponse } })
  }, [logResponse])

  // events
  useEffect(() => {
    initListeningOnNetwork(props.plugin, scriptRunnerDispatch)
    registerLogScriptRunnerAction(on, 'log', newstate.commands, scriptRunnerDispatch)
    registerInfoScriptRunnerAction(on, 'info', newstate.commands, scriptRunnerDispatch)
    registerWarnScriptRunnerAction(on, 'warn', newstate.commands, scriptRunnerDispatch)
    registerErrorScriptRunnerAction(on, 'error', newstate.commands, scriptRunnerDispatch)
    registerCommandAction('html', _blocksRenderer('html'), { activate: true }, dispatch)
    registerCommandAction('log', _blocksRenderer('log'), { activate: true }, dispatch)
    registerCommandAction('info', _blocksRenderer('info'), { activate: true }, dispatch)
    registerCommandAction('warn', _blocksRenderer('warn'), { activate: true }, dispatch)
    registerCommandAction('error', _blocksRenderer('error'), { activate: true }, dispatch)

    registerCommandAction('script', function execute (args, scopedCommands) {
      var script = String(args[0])
      _shell(script, scopedCommands, function (error, output) {
        if (error) scriptRunnerDispatch({ type: 'error', payload: { message: error } })
        if (output) scriptRunnerDispatch({ type: 'script', payload: { message: '5' } })
      })
    }, { activate: true }, dispatch)
  }, [autoCompletState.text])

  useEffect(() => {
    scrollToBottom()
  }, [newstate.journalBlocks.length, logHtml.length])

  function execute (file, cb) {
    function _execute (content, cb) {
      if (!content) {
      //  toolTip('no content to execute')
        if (cb) cb()
        return
      }
      newstate.commands.script(content)
    }

    if (typeof file === 'undefined') {
      var content = _deps.editor.currentContent()
      _execute(content, cb)
      return
    }

    var provider = _deps.fileManager.fileProviderOf(file)

    if (!provider) {
      // toolTip(`provider for path ${file} not found`)
      if (cb) cb()
      return
    }

    provider.get(file, (error, content) => {
      if (error) {
        // toolTip(error)
        // TODO: pop up
        if (cb) cb()
        return
      }

      _execute(content, cb)
    })
    return ''
  }

  function loadgist (id, cb) {
    gistHandler.loadFromGist({ gist: id }, _deps.fileManager)
    if (cb) cb()
  }

  const _shell = async (script, scopedCommands, done) => { // default shell
    if (script.indexOf('remix:') === 0) {
      return done(null, 'This type of command has been deprecated and is not functionning anymore. Please run remix.help() to list available commands.')
    }
    if (script.indexOf('remix.') === 0) {
      // we keep the old feature. This will basically only be called when the command is querying the "remix" object.
      // for all the other case, we use the Code Executor plugin
      const context = { remix: { exeCurrent: (script: any) => { return execute(undefined, script) }, loadgist: (id: any) => { return loadgist(id, () => {}) }, execute: (fileName, callback) => { return execute(fileName, callback) } } }
      try {
        const cmds = vm.createContext(context)
        const result = vm.runInContext(script, cmds)
        return done(null, result)
      } catch (error) {
        return done(error.message)
      }
    }
    try {
      let result: any // eslint-disable-line
      if (script.trim().startsWith('git')) {
        // result = await this.call('git', 'execute', script) code might be used in the future
      } else {
        result = await call('scriptRunner', 'execute', script)
      }
      done()
    } catch (error) {
      done(error.message || error)
    }
  }

  const handleMinimizeTerminal = (event) => {
    event.preventDefault()
    event.stopPropagation()
    if (toggleDownUp === 'fa-angle-double-down') {
      setToggleDownUp('fa-angle-double-up')
      event.trigger('resize', [])
    } else {
      const terminalTopOffset = config.get('terminal-top-offset')
      event.trigger('resize', [terminalTopOffset])
      setToggleDownUp('fa-angle-double-down')
    }
  }

  const focusinput = () => {
    inputEl.current.focus()
  }

  const handleKeyDown = (event) => {
    const suggestionCount = autoCompletState.activeSuggestion
    if (autoCompletState.userInput !== '' && (event.which === 27 || event.which === 8 || event.which === 46)) {
      // backspace or any key that should remove the autocompletion
      setAutoCompleteState(prevState => ({ ...prevState, showSuggestions: false }))
    }
    if (autoCompletState.showSuggestions && (event.which === 13 || event.which === 9)) {
      if (autoCompletState.userInput.length === 1) {
        setAutoCompleteState(prevState => ({ ...prevState, activeSuggestion: 0, showSuggestions: false, userInput: Object.keys(autoCompletState.data._options[0]).toString() }))
      } else {
        if (autoCompletState.showSuggestions && (event.which === 13 || event.which === 9)) {
          setAutoCompleteState(prevState => ({ ...prevState, activeSuggestion: 0, showSuggestions: false, userInput: autoCompletState.data._options[autoCompletState.activeSuggestion] ? Object.keys(autoCompletState.data._options[autoCompletState.activeSuggestion]).toString() : inputEl.current.value }))
        } else {
          setAutoCompleteState(prevState => ({ ...prevState, activeSuggestion: 0, showSuggestions: false, userInput: autoCompletState.data._options.length === 1 ? Object.keys(autoCompletState.data._options[0]).toString() : inputEl.current.value }))
        }
      }
    }
    if (event.which === 13 && !autoCompletState.showSuggestions) {
      if (event.ctrlKey) { // <ctrl+enter>
        // on enter, append the value in the cli input to the journal
        inputEl.current.focus()
      } else { // <enter>
        event.preventDefault()
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
    } else if (newstate._commandHistory.length && event.which === 38 && !autoCompletState.showSuggestions && (autoCompletState.userInput === '')) {
      event.preventDefault()
      setAutoCompleteState(prevState => ({ ...prevState, userInput: newstate._commandHistory[0] }))
    } else if (event.which === 38 && autoCompletState.showSuggestions) {
      event.preventDefault()
      if (autoCompletState.activeSuggestion === 0) {
        return
      }
      setAutoCompleteState(prevState => ({ ...prevState, activeSuggestion: suggestionCount - 1, userInput: Object.keys(autoCompletState.data._options[autoCompletState.activeSuggestion]).toString() }))
    } else if (event.which === 38 && !autoCompletState.showSuggestions) { // <arrowUp>
      if (cmdHistory.length - 1 > _cmdIndex) {
        setCmdIndex(prevState => prevState++)
      }
      inputEl.current.innerText = cmdHistory[_cmdIndex]
      inputEl.current.focus()
    } else if (event.which === 40 && autoCompletState.showSuggestions) {
      event.preventDefault()
      if ((autoCompletState.activeSuggestion + 1) === autoCompletState.data._options.length) {
        return
      }
      setAutoCompleteState(prevState => ({ ...prevState, activeSuggestion: suggestionCount + 1, userInput: Object.keys(autoCompletState.data._options[autoCompletState.activeSuggestion + 1]).toString() }))
    } else if (event.which === 40 && !autoCompletState.showSuggestions) {
      if (_cmdIndex > -1) {
        setCmdIndex(prevState => prevState--)
      }
      inputEl.current.innerText = _cmdIndex >= 0 ? cmdHistory[_cmdIndex] : _cmdTemp
      inputEl.current.focus()
    } else {
      setCmdTemp(inputEl.current.innerText)
    }
  }

  /* start of mouse events */

  const mousedown = (event: MouseEvent) => {
    setSeparatorYPosition(event.clientY)
    const leftRef = document.getElementById('dragId')
    leftRef.style.backgroundColor = '#007AA6'
    leftRef.style.border = '2px solid #007AA6'
    setDragging(true)
  }

  const onMouseMove: any = (e: MouseEvent) => {
    e.preventDefault()
    if (dragging && leftHeight && separatorYPosition) {
      const newLeftHeight = leftHeight + separatorYPosition - e.clientY
      setSeparatorYPosition(e.clientY)
      setLeftHeight(newLeftHeight)
      event.trigger('resize', [newLeftHeight + 32])
    }
  }

  const onMouseUp = () => {
    const leftRef = document.getElementById('dragId')
    leftRef.style.backgroundColor = ''
    leftRef.style.border = ''
    setDragging(false)
  }

  /* end of mouse event */

  useEffect(() => {
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  })

  React.useEffect(() => {
    const leftRef = document.getElementById('terminal-view')
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
          return `<span class="${mode}" >${values}</span>`
        }
      }
    } else {
      throw new Error('mode is not supported')
    }
  }

  /* end of block content that gets rendered from script Runner */

  const handleClearConsole = () => {
    setClearConsole(true)
    dispatch({ type: 'clearconsole', payload: [] })
    inputEl.current.focus()
  }
  /* start of autoComplete */

  const listenOnNetwork = (e: any) => {
    const isListening = e.target.checked
    setIsListeningOnNetwork(isListening)
    listenOnNetworkAction(event, isListening)
  }

  const onChange = (event: any) => {
    event.preventDefault()
    const inputString = event.target.value
    if (matched(allPrograms, inputString) || inputString.includes('.')) {
      if (paste) {
        setPaste(false)
        setAutoCompleteState(prevState => ({ ...prevState, showSuggestions: false, userInput: inputString }))
      } else {
        setAutoCompleteState(prevState => ({ ...prevState, showSuggestions: true, userInput: inputString }))
      }
      const textList = inputString.split('.')
      if (textList.length === 1) {
        setAutoCompleteState(prevState => ({ ...prevState, data: { _options: [] } }))
        const result = Objectfilter(allPrograms, autoCompletState.userInput)
        setAutoCompleteState(prevState => ({ ...prevState, data: { _options: result } }))
      } else {
        setAutoCompleteState(prevState => ({ ...prevState, data: { _options: [] } }))
        const result = Objectfilter(allCommands, autoCompletState.userInput)
        setAutoCompleteState(prevState => ({ ...prevState, data: { _options: result } }))
      }
    } else {
      setAutoCompleteState(prevState => ({ ...prevState, showSuggestions: false, userInput: inputString }))
    }
  }

  const handleSelect = (event) => {
    const suggestionCount = autoCompletState.activeSuggestion
    if (event.keyCode === 38) {
      if (autoCompletState.activeSuggestion === 0) {
        return
      }
      setAutoCompleteState(prevState => ({ ...prevState, activeSuggestion: suggestionCount - 1 }))
    } else if (event.keyCode === 40) {
      if (autoCompletState.activeSuggestion - 1 === autoCompletState.data._options.length) {
        return
      }
      setAutoCompleteState(prevState => ({ ...prevState, activeSuggestion: suggestionCount + 1 }))
    }
  }

  const txDetails = (event, tx) => {
    if (showTableHash.includes(tx.hash)) {
      const index = showTableHash.indexOf(tx.hash)
      if (index > -1) {
        setShowTableHash((prevState) => prevState.filter((x) => x !== tx.hash))
      }
    } else {
      setShowTableHash((prevState) => ([...prevState, tx.hash]))
    }
  }

  const handleAutoComplete = () => (
    <div className='popup alert alert-secondary' style={{ display: autoCompletState.showSuggestions && autoCompletState.userInput !== '' ? 'block' : 'none' }}>
      <div>
        {autoCompletState.data._options.map((item, index) => {
          return (
            <div key={index} data-id="autoCompletePopUpAutoCompleteItem" className={`autoCompleteItem listHandlerShow item ${autoCompletState.data._options[autoCompletState.activeSuggestion] === item ? 'border border-primary ' : ''}`} onKeyDown={ handleSelect } >
              <div>
                {getKeyOf(item)}
              </div>
              <div>
                {getValueOf(item)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
  /* end of autoComplete */

  const handlePaste = () => {
    setPaste(true)
    setAutoCompleteState(prevState => ({ ...prevState, activeSuggestion: 0, showSuggestions: false }))
  }

  return (
    <div style={{ height: '323px', flexGrow: 1 }} className='panel'>
      <div className="bar">
        <div className="dragbarHorizontal" onMouseDown={mousedown} id='dragId'></div>
        <div className="menu border-top border-dark bg-light" data-id="terminalToggleMenu">
          {/* ${self._view.icon} */}
          <i className={`mx-2 toggleTerminal fas ${toggleDownUp}`} data-id="terminalToggleIcon" onClick={ handleMinimizeTerminal }></i>
          <div className="mx-2 console" id="clearConsole" data-id="terminalClearConsole" onClick={handleClearConsole} >
            <i className="fas fa-ban" aria-hidden="true" title="Clear console"
            ></i>
          </div>
          {/* ${self._view.pendingTxCount} */}
          <div className="mx-2" title='Pending Transactions'>0</div>
          <div className="pt-1 h-80 mx-3 align-items-center listenOnNetwork custom-control custom-checkbox">
            <input
              className="custom-control-input"
              id="listenNetworkCheck"
              onChange={listenOnNetwork}
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
              onChange={(event) => setSearchInput(event.target.value.trim()) }
              type="text"
              className="border filter form-control"
              id="searchInput"
              // onkeydown=${filter}
              placeholder="Search with transaction hash or address"
              data-id="terminalInputSearch" />
          </div>
        </div>
      </div>
      <div tabIndex={-1} className="terminal_container" data-id="terminalContainer" >
        {
          handleAutoComplete()
        }
        <div data-id='terminalContainerDisplay' style = {{
          position: 'relative',
          height: '100%',
          width: '100%',
          opacity: '0.1',
          zIndex: -1
        }}></div>
        <div className="terminal">
          <div id='journal' className='journal' data-id='terminalJournal'>
            {!clearConsole && <TerminalWelcomeMessage packageJson={version}/>}
            {newstate.journalBlocks && newstate.journalBlocks.map((x, index) => {
              if (x.name === 'emptyBlock') {
                return (
                  <div className="px-4 block" data-id='block_null' key={index}>
                    <span className='txLog'>
                      <span className='tx'><div className='txItem'>[<span className='txItemTitle'>block:{x.message} - </span> 0 {'transactions'} ] </div></span></span>
                  </div>
                )
              } else if (x.name === 'unknownTransaction') {
                return x.message.filter(x => x.tx.hash.includes(searchInput) || x.tx.from.includes(searchInput) || (x.tx.to.includes(searchInput))).map((trans) => {
                  return (<div className='px-4 block' data-id={`block_tx${trans.tx.hash}`} key={index}> { <RenderUnKnownTransactions tx={trans.tx} receipt={trans.receipt} index={index} plugin={props.plugin} showTableHash={showTableHash} txDetails={txDetails} />} </div>)
                })
              } else if (x.name === 'knownTransaction') {
                return x.message.map((trans) => {
                  return (<div className='px-4 block' data-id={`block_tx${trans.tx.hash}`} key={index}> { trans.tx.isCall ? <RenderCall tx={trans.tx} resolvedData={trans.resolvedData} logs={trans.logs} index={index} plugin={props.plugin} showTableHash={showTableHash} txDetails={txDetails} /> : (<RenderKnownTransactions tx = { trans.tx } receipt = { trans.receipt } resolvedData = { trans.resolvedData } logs = {trans.logs } index = { index } plugin = { props.plugin } showTableHash = { showTableHash } txDetails = { txDetails } />) } </div>)
                })
              } else if (Array.isArray(x.message)) {
                return x.message.map((msg, i) => {
                  if (typeof msg === 'object') {
                    return (
                      <div className="px-4 block" data-id="block_null" key={i}><span className={x.style}>{ msg.value ? parse(msg.value) : JSON.stringify(msg) } </span></div>
                    )
                  } else {
                    return (
                      <div className="px-4 block" data-id="block_null" key={i}>{ msg ? msg.toString().replace(/,/g, '') : msg }</div>
                    )
                  }
                })
              } else {
                return (
                  <div className="px-4 block" data-id="block_null" key={index}> <span className={x.style}> {x.message}</span></div>
                )
              }
            })}
            <div ref={messagesEndRef} />
          </div>
          <div id="terminalCli" data-id="terminalCli" className="cli" onClick={focusinput}>
            <span className="prompt">{'>'}</span>
            <input className="input" ref={inputEl} spellCheck="false" contentEditable="true" id="terminalCliInput" data-id="terminalCliInput" onChange={(event) => onChange(event)} onKeyDown={(event) => handleKeyDown(event) } value={autoCompletState.userInput} onPaste={handlePaste}></input>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RemixUiTerminal
