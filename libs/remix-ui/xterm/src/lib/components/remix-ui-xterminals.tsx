import React, { useState, useEffect } from 'react' // eslint-disable-line
import { ElectronPlugin } from '@remixproject/engine-electron'
import RemixUiXterm from './remix-ui-xterm'
import '../css/index.css'
import { Button, ButtonGroup, Dropdown, Tab, Tabs } from 'react-bootstrap'
import { CustomIconsToggle } from '@remix-ui/helper'
import { RemixUiTerminal } from '@remix-ui/terminal'
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
            plugin.on('xterm', 'loaded', async () => {
                console.log('xterm loaded')
            })

            plugin.on('xterm', 'data', async (data: string, pid: number) => {
                writeToTerminal(data, pid)
            })

            plugin.on('xterm', 'close', async (pid: number) => {
                setTerminals(prevState => {
                    const removed = prevState.filter(xtermState => xtermState.pid !== pid)
                    if (removed.length > 0)
                        removed[removed.length - 1].hidden = false
                    if(removed.length === 0)
                        setShowOutput(true)
                    return [...removed]
                })
            })

            plugin.on('fs', 'workingDirChanged', (path: string) => {
                setWorkingDir(path)
                setTerminalsEnabled(true)
            })

            plugin.on('theme', 'themeChanged', async (theme) => {
                handleThemeChange(theme)
            })

            const theme = await plugin.call('theme', 'currentTheme')
            handleThemeChange(theme)


            const shells = await plugin.call('xterm', 'getShells')
            setShells(shells)
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
            if (terminal.ref && terminal.ref.terminal) {
                terminal.ref.terminal.write(data)
            } else {
                terminal.queue += data
            }
            return [...prevState]
        })
    }

    const send = (data: string, pid: number) => {
        plugin.call('xterm', 'keystroke', data, pid)
    }

    const createTerminal = async () => {
        const pid = await plugin.call('xterm', 'createTerminal', workingDir)
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
            plugin.call('xterm', 'close', pid)
    }

    const selectOutput = () => {
        setShowOutput(true)
    }

    const showTerminal = () => {
        setShowOutput(false)
        if (terminals.length === 0) createTerminal()
    }


    return (<>

        <div className='xterm-panel'>
            <div className='xterm-panel-header bg-light'>
                <div className='xterm-panel-header-left p-1'>
                    <button className={`btn btn-sm btn-secondary mr-2 ${!showOutput ? 'xterm-btn-none' : 'xterm-btn-active'}`} onClick={selectOutput}>ouput</button>
                    <button className={`btn btn-sm btn-secondary ${terminalsEnabled ? '' : 'd-none'} ${showOutput ? 'xterm-btn-none' : 'xterm-btn-active'}`} onClick={showTerminal}><span className="far fa-terminal border-0 ml-1"></span></button>
                </div>
                <div className={`xterm-panel-header-right  ${showOutput ? 'd-none' : ''}`}>

                    <Dropdown as={ButtonGroup}>
                        <button className="btn btn-sm btn-secondary" onClick={createTerminal}><span className="far fa-plus border-0 p-0 m-0"></span></button>


                        <Dropdown.Toggle split variant="secondary" id="dropdown-split-basic" />

                        <Dropdown.Menu className='custom-dropdown-items remixui_menuwidth'>
                            {shells.map((shell, index) => {
                                return (<Dropdown.Item key={index} onClick={createTerminal}>{shell}</Dropdown.Item>)
                            })}
                        </Dropdown.Menu>
                    </Dropdown>
                    <button className="btn ml-2 btn-sm btn-secondary" onClick={closeTerminal}><span className="far fa-trash border-0 ml-1"></span></button>
                </div>
            </div>


            <div className='remix-ui-xterminals-container'>
                <>
                    <div className={`${!showOutput ? 'd-none' : 'd-block w-100'} `}>
                        <RemixUiTerminal
                            plugin={props.plugin}
                            onReady={props.onReady} />
                    </div>
                    <div className={`remix-ui-xterminals-section ${showOutput ? 'd-none' : 'd-flex'} `}>
                        {terminals.map((xtermState) => {
                            return (
                                <div className={`h-100 xterm-terminal ${xtermState.hidden ? 'hide-xterm' : 'show-xterm'}`} key={xtermState.pid} data-id={`remixUIXT${xtermState.pid}`}>
                                    <RemixUiXterm theme={theme} setTerminalRef={setTerminalRef} timeStamp={xtermState.timeStamp} send={send} pid={xtermState.pid} plugin={plugin}></RemixUiXterm>
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
        </div>


    </>)
}

const themeCollection = [
    { themeName: 'HackerOwl', backgroundColor: '#011628', textColor: '#babbcc',
    shapeColor: '#8694a1',fillColor: '#011C32'},
    { themeName: 'Cerulean', backgroundColor: '#ffffff', textColor: '#343a40',
    shapeColor: '#343a40',fillColor: '#f8f9fa'},
    { themeName: 'Cyborg', backgroundColor: '#060606', textColor: '#adafae',
    shapeColor: '#adafae', fillColor: '#222222'},
    { themeName: 'Dark', backgroundColor: '#222336', textColor: '#babbcc',
    shapeColor: '#babbcc',fillColor: '#2a2c3f'},
    { themeName: 'Flatly', backgroundColor: '#ffffff', textColor: '#343a40',
    shapeColor: '#7b8a8b',fillColor: '#ffffff'},
    { themeName: 'Black', backgroundColor: '#1a1a1a', textColor: '#babbcc',
    shapeColor: '#b5b4bc',fillColor: '#1f2020'},
    { themeName: 'Light', backgroundColor: '#eef1f6', textColor: '#3b445e',
    shapeColor: '#343a40',fillColor: '#ffffff'},
    { themeName: 'Midcentury', backgroundColor: '#DBE2E0', textColor: '#11556c',
    shapeColor: '#343a40',fillColor: '#eeede9'},
    { themeName: 'Spacelab', backgroundColor: '#ffffff', textColor: '#343a40',
    shapeColor: '#333333', fillColor: '#eeeeee'},
    { themeName: 'Candy', backgroundColor: '#d5efff', textColor: '#11556c',
    shapeColor: '#343a40',fillColor: '#fbe7f8' },
    { themeName: 'Violet', backgroundColor: '#f1eef6', textColor: '#3b445e',
    shapeColor: '#343a40',fillColor: '#f8fafe' },
    { themeName: 'Pride', backgroundColor: '#f1eef6', textColor: '#343a40',
    shapeColor: '#343a40',fillColor: '#f8fafe' },
  ]