import React, { useState, useEffect, useContext } from 'react' // eslint-disable-line
import { ElectronPlugin } from '@remixproject/engine-electron'
import RemixUiXterm from './remix-ui-xterm'
import '../css/index.css'
import { Button, ButtonGroup, Dropdown, Tab, Tabs } from 'react-bootstrap'
import { CustomTooltip } from '@remix-ui/helper'
import { RemixUiTerminal, TerminalContext } from '@remix-ui/terminal'
import { FormattedMessage } from 'react-intl'
import { xtermState } from '../types'
import { createTerminal } from '@remix-ui/xterm'
export interface RemixUiXterminalsProps {
  plugin: ElectronPlugin
  onReady: (api: any) => void
}

export const RemixUiXterminals = (props: RemixUiXterminalsProps) => {
  const { xtermState, dispatchXterm } = useContext(TerminalContext)
  const [terminals, setTerminals] = useState<xtermState[]>([])
  //const [workingDir, setWorkingDir] = useState<string>('')

  const [theme, setTheme] = useState<any>(themeCollection[0])

  const { plugin } = props

  useEffect(() => {
    setTimeout(async () => {

      plugin.on('xterm', 'data', async (data: string, pid: number) => {
        writeToTerminal(data, pid)
      })

      plugin.on('xterm', 'close', async (pid: number) => {
        dispatchXterm({ type: 'REMOVE_TERMINAL', payload: pid })
      })

      plugin.on('xterm', 'new', async (pid: number) => {
        console.log('new terminal')
        dispatchXterm({ type: 'SHOW_OUTPUT', payload: false })
        dispatchXterm({ type: 'ADD_TERMINAL', payload: { pid, queue: '', timeStamp: Date.now(), ref: null, hidden: false } })
      })


      plugin.on('fs', 'workingDirChanged', (path: string) => {
        dispatchXterm({ type: 'SET_WORKING_DIR', payload: path })
        dispatchXterm({ type: 'ENABLE_TERMINALS', payload: null })
      })

      const workingDir = await plugin.call('fs', 'getWorkingDir')
      if(workingDir && workingDir !== '') {
        dispatchXterm({ type: 'ENABLE_TERMINALS', payload: null })
        dispatchXterm({ type: 'SET_WORKING_DIR', payload: workingDir })
      }

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

  useEffect(() => {
    setTerminals(xtermState.terminals)
    if(xtermState.terminals.length === 0) {
      dispatchXterm({ type: 'SHOW_OUTPUT', payload: true })
    }
  }, [xtermState.terminals])

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

  useEffect(() => {
    if (!xtermState.showOutput) {
      if (terminals.length === 0) createTerminal('', plugin, xtermState.workingDir, dispatchXterm)
    }
  }, [xtermState.showOutput])

  return (<>
    <div className='remix-ui-xterminals-container'>
      <>

        <div className={`remix-ui-xterminals-section ${xtermState.showOutput ? 'd-none' : 'd-flex'} `}>
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