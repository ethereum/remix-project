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
  xTerminalAPI: xTerminalAPIType
}

export type xTerminalAPIType = {
  clearTerminal: () => any
  createTerminal: (shell?: string) => any
  closeTerminal: () => void
  shells: () => Promise<any>
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
  const [switchToRemixTerminal, setSwitchToRemixTerminal] = useState<boolean>(true)
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
            setSwitchToRemixTerminal(true)
          return [...removed]
        })
      })

      plugin.on('xterm', 'new', async (pid: number) => {
        setSwitchToRemixTerminal(false)
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

      const workingDir = await plugin.call('fs', 'getWorkingDir')
      if (workingDir && workingDir !== '') {
        setTerminalsEnabled(true)
        setWorkingDir(workingDir)
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

  props.xTerminalAPI.createTerminal = async (shell?: string) => {
    console.log('shells ')
    const shells = await plugin.call('xterm', 'getShells')
    console.log('shells ', shells)
    setShells(shells)
    const pid = await plugin.call('xterm', 'createTerminal', workingDir, shell)
    setSwitchToRemixTerminal(false)
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

  props.xTerminalAPI.closeTerminal = () => {
    const pid = terminals.find(xtermState => xtermState.hidden === false).pid
    if (pid)
      plugin.call('xterm', 'closeTerminal', pid)
  }
  props.xTerminalAPI.shells = async() => {
    return await plugin.call('xterm', 'getShells')
  }

  const selectOutput = () => {
    props.plugin.call('layout', 'minimize', props.plugin.profile.name, false)
    setSwitchToRemixTerminal(true)
  }

  const showTerminal = () => {
    setSwitchToRemixTerminal(false)
    props.plugin.call('layout', 'minimize', props.plugin.profile.name, false)
    if (terminals.length === 0) props.xTerminalAPI.createTerminal()
  }

  props.xTerminalAPI.clearTerminal = () => {
    const terminal = terminals.find(xtermState => xtermState.hidden === false)
    if (terminal && terminal.ref && terminal.ref.terminal)
      terminal.ref.terminal.clear()
  }

  return (<>
    <div className='remix-ui-xterminals-container'>
      <div className={`remix-ui-xterminals-section ${switchToRemixTerminal ? 'd-none' : 'd-flex'} `}>
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