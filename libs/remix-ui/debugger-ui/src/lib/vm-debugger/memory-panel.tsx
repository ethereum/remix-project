import React from 'react' // eslint-disable-line
import DropdownPanel from './dropdown-panel' // eslint-disable-line

export const MemoryPanel = ({ calldata, className}) => {
  return (
    <div className={className} >
      <DropdownPanel hexHighlight={true} bodyStyle={{ fontFamily: 'monospace' }} dropdownName='Memory' calldata={calldata || {}} />
    </div>
  )
}

export default MemoryPanel
