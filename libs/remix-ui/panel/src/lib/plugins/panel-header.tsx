/* eslint-disable jsx-a11y/anchor-has-content */
import React, { useEffect, useRef, useState } from 'react' // eslint-disable-line
import { PluginRecord } from '../types'
import './panel.css'

export interface RemixPanelProps {
    plugins: Record<string, PluginRecord>;
  }
const RemixUIPanelHeader = (props: RemixPanelProps) => {
  const [plugin, setPlugin] = useState<PluginRecord>()

  useEffect(() => {
    if (props.plugins) {
      const p = Object.values(props.plugins).find((pluginRecord) => {
        return pluginRecord.active === true
      })
      setPlugin(p)
    }
  }, [props])

  return (
    <header className='swapitHeader'><h6 data-id='sidePanelSwapitTitle'>{plugin?.profile.displayName || plugin?.profile.name}</h6>
      {plugin?.profile.documentation ? (<a href={plugin.profile.documentation} className="titleInfo mb-2" title="link to documentation" target="_blank" rel="noreferrer"><i aria-hidden="true" className="fas fa-book"></i></a>) : ''}
    </header>)
}

export default RemixUIPanelHeader
