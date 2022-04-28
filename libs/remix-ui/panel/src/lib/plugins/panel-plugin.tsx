/* eslint-disable no-undef */
import React, { forwardRef, useEffect, useRef, useState } from 'react' // eslint-disable-line
import { PluginRecord } from '../types'
import './panel.css'
interface panelPLuginProps {
  pluginRecord: PluginRecord
}

const RemixUIPanelPlugin = (props: panelPLuginProps, panelRef: any) => {
  const localRef = useRef<HTMLDivElement>(null)
  const [view, setView] = useState<JSX.Element | HTMLDivElement>()
  useEffect(() => {
    
    const ref:any = panelRef || localRef
    if (ref.current) {
      if (props.pluginRecord.view) {
        if (React.isValidElement(props.pluginRecord.view)) {
          setView(props.pluginRecord.view)
        } else {
          ref.current.appendChild(props.pluginRecord.view)
        }
      }
    }
  }, [])

  return (
    <div
      className={
        props.pluginRecord.active ? `${props.pluginRecord.class}` : 'd-none'
      }
      ref={panelRef || localRef}
    >
      {view}
    </div>
  )
}

export default forwardRef(RemixUIPanelPlugin)
