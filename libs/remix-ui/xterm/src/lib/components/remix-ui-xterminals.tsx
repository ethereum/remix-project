import React, { useState, useEffect } from 'react' // eslint-disable-line
import { ElectronPlugin } from '@remixproject/engine-electron'
import RemixUiXterm from './remix-ui-xterm'

import {
    ImperativePanelGroupHandle,
    Panel,
    PanelGroup,
    PanelResizeHandle,
  } from "react-resizable-panels";

export interface RemixUiXterminalsProps {
    plugin: ElectronPlugin
}

export interface xtermState {
    pid: number
    queue: string
    timeStamp: number
    ref: any
}

export const RemixUiXterminals = (props: RemixUiXterminalsProps) => {
    const [terminals, setTerminals] = useState<xtermState[]>([])
    const [workingDir, setWorkingDir] = useState<string>('')
    const { plugin } = props

    useEffect(() => {
        setTimeout(async () => {
        plugin.on('xterm', 'loaded', async () => {
        })
        plugin.on('xterm', 'data', async (data: string, pid: number) => {
            writeToTerminal(data, pid)
        })

        plugin.on('xterm', 'close', async (pid: number) => {
            setTerminals(prevState => {
                return prevState.filter(xtermState => xtermState.pid !== pid)
            })
        })

        plugin.on('fs', 'workingDirChanged', (path: string) => {
            setWorkingDir(path)
        })
    }, 5000)
    }, [])

    const writeToTerminal = (data: string, pid: number) => {
        setTerminals(prevState => {
            const terminal = prevState.find(xtermState => xtermState.pid === pid)
            if (terminal.ref && terminal.ref.terminal) {
                terminal.ref.terminal.write(data)
            }else {
                terminal.queue += data
            }
            return [...prevState]
        })
    }


    useEffect(() => {
        console.log('terminals', terminals)
    }, [terminals])

    const send = (data: string, pid: number) => {
        plugin.call('xterm', 'keystroke', data, pid)
    }

    const createTerminal = async () => {
        const pid = await plugin.call('xterm', 'createTerminal', workingDir)

        setTerminals(prevState => {
            return [...prevState, {
                pid: pid,
                queue: '',
                timeStamp: Date.now(),
                ref: null
            }]
        })
    }

    const setTerminalRef = (pid: number, ref: any) => {
        console.log('setTerminalRef', pid, ref)
        setTerminals(prevState => {
            const terminal = prevState.find(xtermState => xtermState.pid === pid)
            terminal.ref = ref
            if(terminal.queue) {
                ref.terminal.write(terminal.queue)
                terminal.queue = ''
            }
            return [...prevState]
        })
    }


    return (<>
        <button onClick={() => {
            createTerminal()
        }}>create terminal</button>


        {terminals.map((xtermState) => {
            return (
                <div key={xtermState.pid} data-id={`remixUIXT${xtermState.pid}`}>
                    <RemixUiXterm setTerminalRef={setTerminalRef} timeStamp={xtermState.timeStamp} send={send} pid={xtermState.pid} plugin={plugin}></RemixUiXterm>
                </div>
            )
        })}
    </>)
}

