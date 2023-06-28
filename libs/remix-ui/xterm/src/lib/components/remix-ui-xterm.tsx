import React, { useState, useEffect, forwardRef } from 'react' // eslint-disable-line
import { ElectronPlugin } from '@remixproject/engine-electron'
import { XTerm } from 'xterm-for-react'


export interface RemixUiXtermProps {
    plugin: ElectronPlugin
    pid: number
    send: (data: string, pid: number) => void
    timeStamp: number
    setTerminalRef: (pid: number, ref: any) => void
    theme: {
        backgroundColor: string
        textColor: string
    }
}

const RemixUiXterm = (props: RemixUiXtermProps) => {
    const { plugin, pid, send, timeStamp } = props
    const xtermRef = React.useRef(null)

    useEffect(() => {
        console.log('render remix-ui-xterm')
    }, [])

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
            <button className='btn d-none' onClick={closeTerminal}>close</button>
            <XTerm 
            options={{theme: {background: props.theme.backgroundColor , foreground: props.theme.textColor}}}
            ref={xtermRef} onData={onData} 
            onKey={onKey}></XTerm>

        </>
    )

}

export default RemixUiXterm