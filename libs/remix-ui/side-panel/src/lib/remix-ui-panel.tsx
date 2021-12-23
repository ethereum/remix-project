import React, { useEffect, useState } from 'react' // eslint-disable-line
import './panel.css';
import SidePanelHeader from './panel-header';
import PanelPlugin from './panel-plugin';
import { PluginRecord } from './types';

/* eslint-disable-next-line */
export interface RemixPanelProps {
  plugins: Record<string, PluginRecord>;
}

export function RemixPanel(props: RemixPanelProps) {

  return (
    <div className='panel plugin-manager'>
      <SidePanelHeader plugins={props.plugins}></SidePanelHeader>
      <div className="pluginsContainer">
        {Object.values(props.plugins).map((pluginRecord) => {
            return <PanelPlugin key={pluginRecord.profile.name} pluginRecord={pluginRecord} />
        })}
      </div>
    </div>

  );
}

export default RemixPanel;
