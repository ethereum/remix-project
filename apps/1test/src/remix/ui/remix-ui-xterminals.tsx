import React, { useState, useEffect } from 'react' // eslint-disable-line
import { ElectronPlugin } from '../lib/electronPlugin'
import RemixUiXterm from './remix-ui-xterm'

export interface RemixUiXterminalsProps {
    plugin: ElectronPlugin
}

export interface xtermState {
    pid: number
    data: string
    timeStamp: number
    ref: any
}

export const RemixUiXterminals = (props: RemixUiXterminalsProps) => {
    const [terminals, setTerminals] = useState<xtermState[]>([]) // eslint-disable-line
    const { plugin } = props

    useEffect(() => {
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
    }, [])

    const writeToTerminal = (data: string, pid: number) => {
        setTerminals(prevState => {
            const terminal = prevState.find(xtermState => xtermState.pid === pid)
            if (terminal.ref && terminal.ref.terminal) {
                terminal.ref.terminal.write(data)
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
        const pid = await plugin.call('xterm', 'createTerminal')

        setTerminals(prevState => {
            return [...prevState, {
                pid: pid,
                data: '',
                timeStamp: Date.now(),
                ref: null
            }]
        })
    }

    const setTerminalRef = (pid: number, ref: any) => {
        setTerminals(prevState => {
            prevState.find(xtermState => xtermState.pid === pid).ref = ref
            return [...prevState]
        })
    }


    return (<>
        <button onClick={() => {
            createTerminal()
        }}>create terminal</button>

        {terminals.map((xtermState) => {
            return (
                <div key={xtermState.pid} data-id={`remixUIXT${xtermState.pid}`}>{xtermState.pid}
                    <RemixUiXterm setTerminalRef={setTerminalRef} timeStamp={xtermState.timeStamp} send={send} pid={xtermState.pid} data={xtermState.data} plugin={plugin}></RemixUiXterm>
                </div>
            )
        })}
    </>)
}

