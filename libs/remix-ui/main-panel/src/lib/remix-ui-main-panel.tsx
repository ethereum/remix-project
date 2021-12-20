import React, { useEffect, useState, useRef } from 'react' // eslint-disable-line
import './remix-ui-main-panel.module.css';

/* eslint-disable-next-line */
export interface RemixUiMainPanelProps {
  plugin: any
  contents: [any]
}

export const RemixUiMainPanel = (props: RemixUiMainPanelProps) =>  {
  const dom = useRef(null)
  return (
   <div className="pluginsContainer" data-id="mainPanelPluginsContainer" id='mainPanelPluginsContainer-id' ref={dom} >
   </div>
  )
}

export default RemixUiMainPanel;
