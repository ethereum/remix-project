import React, { useEffect, useState } from 'react' // eslint-disable-line
import './panel.css';
import RemixUIPanelHeader from './panel-header';
import RemixUIPanelPlugin from './panel-plugin';
import { PluginRecord } from './types';

/* eslint-disable-next-line */
export interface RemixPanelProps {
  plugins: Record<string, PluginRecord>;
}

export function RemixPanel(props: RemixPanelProps) {

  return (
    <div className='panel plugin-manager'>
      <RemixUIPanelHeader plugins={props.plugins}></RemixUIPanelHeader>
      <div className="pluginsContainer">
        {Object.values(props.plugins).map((pluginRecord) => {
            return <RemixUIPanelPlugin key={pluginRecord.profile.name} pluginRecord={pluginRecord} />
        })}
      </div>
    </div>

  );
}

export default RemixPanel;
