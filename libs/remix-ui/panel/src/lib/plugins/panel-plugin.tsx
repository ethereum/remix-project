import React, { useEffect, useRef, useState } from 'react' // eslint-disable-line
import { PluginRecord } from '../types'
import './panel.css'
interface panelPLuginProps {
    pluginRecord: PluginRecord
}

const RemixUIPanelPlugin = (props: panelPLuginProps) => {
  const PanelRef = useRef<HTMLDivElement>(null)
  const [view, setView] = useState<JSX.Element | HTMLDivElement>()
  useEffect(() => {
    if (PanelRef.current) {
      if (props.pluginRecord.view) {
        if (React.isValidElement(props.pluginRecord.view)) {
          setView(props.pluginRecord.view)
        } else {
          PanelRef.current.appendChild(props.pluginRecord.view)
        }
      }
    }
  }, [])

  return <div className={props.pluginRecord.active ? `${props.pluginRecord.class} active` : 'd-none'} ref={PanelRef}>{view}</div>
}

export default RemixUIPanelPlugin
