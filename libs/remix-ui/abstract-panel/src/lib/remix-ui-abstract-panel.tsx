import React from 'react' // eslint-disable-line
import './remix-ui-abstract-panel.module.css';

/* eslint-disable-next-line */
export interface RemixUiAbstractPanelProps {
  reactView: any
  plugin: any
}

export function RemixUiAbstractPanel(props: RemixUiAbstractPanelProps) {
  return (
    <div id="plugins" className="plugins">
      {console.log({ view: props.plugin })}
      good
    </div>
  );
}

export default RemixUiAbstractPanel;
