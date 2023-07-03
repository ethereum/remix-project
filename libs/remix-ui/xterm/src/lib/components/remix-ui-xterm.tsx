import React, { useState, useEffect, forwardRef } from 'react' // eslint-disable-line
import { ElectronPlugin } from '@remixproject/engine-electron'
import { Xterm } from './xterm-wrap'
import { FitAddon } from './xterm-fit-addOn';


const fitAddon = new FitAddon()

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
        props.setTerminalRef(pid, xtermRef.current)
    }, [xtermRef.current])

    const onKey = (event: { key: string; domEvent: KeyboardEvent }) => {
        send(event.key, pid)
    }

    return (

        <Xterm
            addons={[fitAddon]}
            options={{ theme: { background: props.theme.backgroundColor, foreground: props.theme.textColor } }}
            onRender={() => fitAddon.fit()}
            ref={xtermRef}
            onKey={onKey}></Xterm>


    )

}

export default RemixUiXterm