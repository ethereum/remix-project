import React from 'react' // eslint-disable-line
import DropdownPanel from './dropdown-panel' // eslint-disable-line

export const StackPanel = ({ calldata }) => {
  return (
    <div id='stackpanel'>
      <DropdownPanel hexHighlight={true} bodyStyle={{ fontFamily: 'monospace' }} dropdownName='Stack' calldata={calldata || {}} />
    </div>
  )
}

export default StackPanel
