import React from 'react' // eslint-disable-line
import './remix-ui-main-panel.module.css';

/* eslint-disable-next-line */
export interface RemixUiMainPanelProps {
  plugin: any
}

export const RemixUiMainPanel = (props: RemixUiMainPanelProps) =>  {
  return (
    <div>
      {console.log( props.plugin.view)}
      <h1>Remix UI Main Panel</h1>
      {/* { props.plugin.view }  */}
    </div>
  );
}

export default RemixUiMainPanel;
