import React from 'react' // eslint-disable-line
import DropdownPanel from './dropdown-panel' // eslint-disable-line

export const StackPanel = ({ calldata, className }) => {
  return (
    <div id='stackpanel' className={className}>
      <DropdownPanel hexHighlight={true} bodyStyle={{ fontFamily: 'monospace' }} dropdownName='Stack' calldata={calldata || {}} />
    </div>
  )
}

export default StackPanel
