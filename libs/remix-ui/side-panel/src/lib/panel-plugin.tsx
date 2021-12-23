import React, { useEffect, useRef, useState } from 'react' // eslint-disable-line
import { PluginRecord } from './types'
import './side/panel.css';
interface panelPLuginProps {
    pluginRecord: PluginRecord
}

const PanelPlugin = (props: panelPLuginProps) => {
    const sidePanelRef = useRef(null)
    const [view, setView] = useState<JSX.Element | HTMLDivElement>()
    useEffect(() => {
        if (sidePanelRef.current) {
          if (props.pluginRecord.view) {
            if (React.isValidElement(props.pluginRecord.view)) {
              setView(props.pluginRecord.view)
            }else{
              sidePanelRef.current.appendChild(props.pluginRecord.view)
            }
          }
        }
      }, [])

      return <div className={props.pluginRecord.active? 'plugItIn active':'d-none'} ref={sidePanelRef}>{view}</div>
}

export default PanelPlugin