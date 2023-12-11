import React, { useState, useEffect } from 'react' // eslint-disable-line
import { ElectronPlugin } from '@remixproject/engine-electron'
import RemixUiXterm from './remix-ui-xterm'
import '../css/index.css'
import { Button, ButtonGroup, Dropdown, Tab, Tabs } from 'react-bootstrap'
import { CustomTooltip } from '@remix-ui/helper'
import { RemixUiTerminal } from '@remix-ui/terminal'
import { FormattedMessage } from 'react-intl'
export interface RemixUiXterminalsProps {
  plugin: ElectronPlugin
  onReady: (api: any) => void
}

export interface xtermState {
  pid: number
  queue: string
  timeStamp: number
  ref: any
  hidden: boolean
}

export const RemixUiXterminals = (props: RemixUiXterminalsProps) => {
  const [terminals, setTerminals] = useState<xtermState[]>([])
  const [workingDir, setWorkingDir] = useState<string>('')
  const [showOutput, setShowOutput] = useState<boolean>(true)
  const [theme, setTheme] = useState<any>(themeCollection[0])
  const [terminalsEnabled, setTerminalsEnabled] = useState<boolean>(false)
  const [shells, setShells] = useState<string[]>([])
  const { plugin } = props

  useEffect(() => {
    setTimeout(async () => {

      plugin.on('xterm', 'data', async (data: string, pid: number) => {
        writeToTerminal(data, pid)
      })

      plugin.on('xterm', 'close', async (pid: number) => {
        setTerminals(prevState => {
          const removed = prevState.filter(xtermState => xtermState.pid !== pid)
          if (removed.length > 0)
            removed[removed.length - 1].hidden = false
          if (removed.length === 0)
            setShowOutput(true)
          return [...removed]
        })
      })

      plugin.on('xterm', 'new', async (pid: number) => {
        setShowOutput(false)
        setTerminals(prevState => {
          // set all to hidden
          prevState.forEach(xtermState => {
            xtermState.hidden = true
          })
          return [...prevState, {
            pid: pid,
            queue: '',
            timeStamp: Date.now(),
            ref: null,
            hidden: false
          }]
        })
      })


      plugin.on('fs', 'workingDirChanged', (path: string) => {
        setWorkingDir(path)
        setTerminalsEnabled(true)
      })

      plugin.on('theme', 'themeChanged', async (theme) => {
        handleThemeChange(theme)
      })

      plugin.on('layout', 'resize', async (height: number) => {
        setTerminals(prevState => {
          const terminal = prevState.find(xtermState => xtermState.hidden === false)
          if (terminal) {
            if (terminal.ref && terminal.ref.terminal) {
              terminal.timeStamp = Date.now()
            }
          }
          return [...prevState]
        })
      })

      const theme = await plugin.call('theme', 'currentTheme')
      handleThemeChange(theme)

    }, 2000)
  }, [])


  const handleThemeChange = (theme: any) => {
    themeCollection.forEach((themeItem) => {
      if (themeItem.themeName === theme.name) {
        setTheme(themeItem)
      }
    })
  }


  const writeToTerminal = (data: string, pid: number) => {
    setTerminals(prevState => {
      const terminal = prevState.find(xtermState => xtermState.pid === pid)
      if (terminal) {
        if (terminal.ref && terminal.ref.terminal) {
          terminal.ref.terminal.write(data)
        } else {
          terminal.queue += data
        }
      }
      return [...prevState]
    })
  }

  const send = (data: string, pid: number) => {
    plugin.call('xterm', 'keystroke', data, pid)
  }

  const resize = (event: { cols: number; rows: number }, pid: number) => {
    plugin.call('xterm', 'resize', event, pid)
  }


  const createTerminal = async (shell?: string) => {
    const shells = await plugin.call('xterm', 'getShells')
    setShells(shells)
    const pid = await plugin.call('xterm', 'createTerminal', workingDir, shell)
    setShowOutput(false)
    setTerminals(prevState => {
      // set all to hidden
      prevState.forEach(xtermState => {
        xtermState.hidden = true
      })
      return [...prevState, {
        pid: pid,
        queue: '',
        timeStamp: Date.now(),
        ref: null,
        hidden: false
      }]
    })
  }

  const setTerminalRef = (pid: number, ref: any) => {
    setTerminals(prevState => {
      const terminal = prevState.find(xtermState => xtermState.pid === pid)
      terminal.ref = ref
      if (terminal.queue) {
        ref.terminal.write(terminal.queue)
        terminal.queue = ''
      }
      return [...prevState]
    })
  }

  const selectTerminal = (state: xtermState) => {
    setTerminals(prevState => {
      // set all to hidden
      prevState.forEach(xtermState => {
        xtermState.hidden = true
      })
      const terminal = prevState.find(xtermState => xtermState.pid === state.pid)
      terminal.hidden = false
      return [...prevState]
    })
  }

  const closeTerminal = () => {
    const pid = terminals.find(xtermState => xtermState.hidden === false).pid
    if (pid)
      plugin.call('xterm', 'closeTerminal', pid)
  }

  const selectOutput = () => {
    props.plugin.call('layout', 'minimize', props.plugin.profile.name, false)
    setShowOutput(true)
  }

  const showTerminal = () => {
    setShowOutput(false)
    props.plugin.call('layout', 'minimize', props.plugin.profile.name, false)
    if (terminals.length === 0) createTerminal()
  }

  const clearTerminal = () => {
    const terminal = terminals.find(xtermState => xtermState.hidden === false)
    if (terminal && terminal.ref && terminal.ref.terminal)
      terminal.ref.terminal.clear()
  }

  return (<>
    <div className='xterm-panel-header bg-light'>
      <div className='xterm-panel-header-left p-1'>
        <button className={`btn btn-sm btn-secondary mr-2 ${!showOutput ? 'xterm-btn-none' : 'xterm-btn-active'}`} onClick={selectOutput}>ouput</button>
        <button className={`btn btn-sm btn-secondary ${terminalsEnabled ? '' : 'd-none'} ${showOutput ? 'xterm-btn-none' : 'xterm-btn-active'}`} onClick={showTerminal}><span className="far fa-terminal border-0 ml-1"></span></button>
      </div>
      <div className={`xterm-panel-header-right  ${showOutput ? 'd-none' : ''}`}>

        <Dropdown as={ButtonGroup}>
          <button className="btn btn-sm btn-secondary mr-2" onClick={async () => clearTerminal()}>
            <CustomTooltip tooltipText={<FormattedMessage id='xterm.clear' defaultMessage='Clear terminal' />}>
              <span className="far fa-ban border-0 p-0 m-0"></span>
            </CustomTooltip>
          </button>
          <button className="btn btn-sm btn-secondary" onClick={async () => createTerminal()}>
            <CustomTooltip tooltipText={<FormattedMessage id='xterm.new' defaultMessage='New terminal' />}>
              <span className="far fa-plus border-0 p-0 m-0"></span>
            </CustomTooltip>
          </button>


          <Dropdown.Toggle split variant="secondary" id="dropdown-split-basic" />

          <Dropdown.Menu className='custom-dropdown-items remixui_menuwidth'>
            {shells.map((shell, index) => {
              return (<Dropdown.Item key={index} onClick={async () => await createTerminal(shell)}>{shell}</Dropdown.Item>)
            })}
          </Dropdown.Menu>
        </Dropdown>
        <button className="btn ml-2 btn-sm btn-secondary" onClick={closeTerminal}>
          <CustomTooltip tooltipText={<FormattedMessage id='xterm.close' defaultMessage='Close terminal' />}>
            <span className="far fa-trash border-0 ml-1"></span>
          </CustomTooltip>
        </button>
      </div>
    </div>

    <RemixUiTerminal
      plugin={props.plugin}
      onReady={props.onReady}
      visible={showOutput}
    />

    <div className='remix-ui-xterminals-container'>
      <>

        <div className={`remix-ui-xterminals-section ${showOutput ? 'd-none' : 'd-flex'} `}>
          {terminals.map((xtermState) => {
            return (
              <div className={`h-100 xterm-terminal ${xtermState.hidden ? 'hide-xterm' : 'show-xterm'}`} key={xtermState.pid} data-id={`remixUIXT${xtermState.pid}`}>
                <RemixUiXterm theme={theme} setTerminalRef={setTerminalRef} timeStamp={xtermState.timeStamp} send={send} resize={resize} pid={xtermState.pid} plugin={plugin}></RemixUiXterm>
              </div>
            )
          })}
          <div className='remix-ui-xterminals-buttons border-left'>
            {terminals.map((xtermState, index) => {
              return (<button key={index} onClick={async () => selectTerminal(xtermState)} className={`btn btn-sm mt-2 btn-secondary ${xtermState.hidden ? 'xterm-btn-none' : 'xterm-btn-active'}`}><span className="fa fa-terminal border-0 p-0 m-0"></span></button>)
            })}
          </div>
        </div>
      </>
    </div>


  </>)
}

const themeCollection = [
  {
    themeName: 'HackerOwl', backgroundColor: '#011628', textColor: '#babbcc',
    shapeColor: '#8694a1', fillColor: '#011C32'
  },
  {
    themeName: 'Cerulean', backgroundColor: '#ffffff', textColor: '#343a40',
    shapeColor: '#343a40', fillColor: '#f8f9fa'
  },
  {
    themeName: 'Cyborg', backgroundColor: '#060606', textColor: '#adafae',
    shapeColor: '#adafae', fillColor: '#222222'
  },
  {
    themeName: 'Dark', backgroundColor: '#222336', textColor: '#babbcc',
    shapeColor: '#babbcc', fillColor: '#2a2c3f'
  },
  {
    themeName: 'Flatly', backgroundColor: '#ffffff', textColor: '#343a40',
    shapeColor: '#7b8a8b', fillColor: '#ffffff'
  },
  {
    themeName: 'Black', backgroundColor: '#1a1a1a', textColor: '#babbcc',
    shapeColor: '#b5b4bc', fillColor: '#1f2020'
  },
  {
    themeName: 'Light', backgroundColor: '#eef1f6', textColor: '#3b445e',
    shapeColor: '#343a40', fillColor: '#ffffff'
  },
  {
    themeName: 'Midcentury', backgroundColor: '#DBE2E0', textColor: '#11556c',
    shapeColor: '#343a40', fillColor: '#eeede9'
  },
  {
    themeName: 'Spacelab', backgroundColor: '#ffffff', textColor: '#343a40',
    shapeColor: '#333333', fillColor: '#eeeeee'
  },
  {
    themeName: 'Candy', backgroundColor: '#d5efff', textColor: '#11556c',
    shapeColor: '#343a40', fillColor: '#fbe7f8'
  },
  {
    themeName: 'Violet', backgroundColor: '#f1eef6', textColor: '#3b445e',
    shapeColor: '#343a40', fillColor: '#f8fafe'
  },
  {
    themeName: 'Pride', backgroundColor: '#f1eef6', textColor: '#343a40',
    shapeColor: '#343a40', fillColor: '#f8fafe'
  },
]