import React, { useState, useEffect, forwardRef } from 'react' // eslint-disable-line
import { ElectronPlugin } from '../lib/electronPlugin'
import { XTerm } from 'xterm-for-react'


export interface RemixUiXtermProps {
    plugin: ElectronPlugin
    pid: number
    send: (data: string, pid: number) => void
    data: string
    timeStamp: number
    setTerminalRef: (pid: number, ref: any) => void
}

const RemixUiXterm = (props: RemixUiXtermProps) => {
    const { plugin, pid, send, data, timeStamp } = props
    const xtermRef = React.useRef(null)

    useEffect(() => {
        console.log('remix-ui-xterm ref', xtermRef.current)
        props.setTerminalRef(pid, xtermRef.current)
    }, [xtermRef.current])

    const onKey = (event: { key: string; domEvent: KeyboardEvent }) => {
        send(event.key, pid)
    }

    const onData = (data: string) => {
        console.log('onData', data)
    }

    const closeTerminal = () => {
        plugin.call('xterm', 'close', pid)
    }

    return (
        <>
            <XTerm ref={xtermRef} onData={onData} onKey={onKey}></XTerm>
            <button onClick={closeTerminal}>close</button>
        </>
    )

}

export default RemixUiXterm