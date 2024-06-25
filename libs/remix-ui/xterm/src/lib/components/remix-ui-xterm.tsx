import React, {useState, useEffect, forwardRef} from 'react' // eslint-disable-line
import { ElectronPlugin } from '@remixproject/engine-electron'
import { Xterm } from './xterm-wrap'
import { FitAddon } from './xterm-fit-addOn'

const config = {
  fontSize: 12,
  fontFamily:
    'Menlo, "DejaVu Sans Mono", Consolas, "Lucida Console", monospace',
  fontWeight: 'normal',
  fontWeightBold: 'bold',
  lineHeight: 1,
  letterSpacing: 0,
}

const fitAddon = new FitAddon()

export interface RemixUiXtermProps {
  plugin: ElectronPlugin
  pid: number
  send: (data: string, pid: number) => void
  resize: (event: { cols: number; rows: number }, pid: number) => void
  timeStamp: number
  setTerminalRef: (pid: number, ref: any) => void
  theme: {
    backgroundColor: string
    textColor: string
    fillColor: string
  }
}

const RemixUiXterm = (props: RemixUiXtermProps) => {
  const { plugin, pid, send, timeStamp, theme, resize } = props
  const xtermRef = React.useRef(null)

  useEffect(() => {
    props.setTerminalRef(pid, xtermRef.current)
  }, [xtermRef.current])

  useEffect(() => {
    xtermRef.current.terminal.options.theme = {
      background: theme.backgroundColor,
      foreground: theme.textColor,
      selection: theme.fillColor,
      cursor: theme.textColor,
    }
  },[theme])

  useEffect(() => {
    fitAddon.fit()
  },[timeStamp])

  const onResize = (event: { cols: number; rows: number }) => {
    resize(event, pid)
  }

  return (
    <Xterm
      addons={[fitAddon]}
      onResize={onResize}
      onRender={() => fitAddon.fit()}
      options={{
        fontFamily: config.fontFamily,
        fontSize: config.fontSize,
        letterSpacing: config.letterSpacing,
        lineHeight: config.lineHeight,
      }}
      ref={xtermRef}
      onData={(data) => {
        send(data, pid)
      }}
    ></Xterm>
  )
}

export default RemixUiXterm
