import React, { useEffect, useState } from 'react' // eslint-disable-line
import './remix-ui-abstract-panel.module.css';
import parse from 'html-react-parser'

/* eslint-disable-next-line */
export interface RemixUiAbstractPanelProps {
  reactView: any,
  plugin: any
}

export function RemixUiAbstractPanel(props: RemixUiAbstractPanelProps) {

  const [loading, setLoading] = useState(false);

  return (
    <div id="plugins">
      
    </div>
  )
}

export default RemixUiAbstractPanel;
