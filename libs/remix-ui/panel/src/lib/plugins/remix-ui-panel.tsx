/* eslint-disable no-undef */
import React, { useEffect, useState } from 'react' // eslint-disable-line
import './panel.css'
import RemixUIPanelPlugin from './panel-plugin'
import { PluginRecord } from '../types'

/* eslint-disable-next-line */
export interface RemixPanelProps {
  plugins: Record<string, PluginRecord>
  header: JSX.Element
}

export function RemixPluginPanel (props: RemixPanelProps) {
  return (
    <>
      {props.header}
      <div className="pluginsContainer">
        <div className='plugins' id='plugins'>
          {Object.values(props.plugins).map((pluginRecord) => {
            return <RemixUIPanelPlugin key={pluginRecord.profile.name} pluginRecord={pluginRecord} />
          })}
        </div>
      </div>
    </>

  )
}

export default RemixPluginPanel
