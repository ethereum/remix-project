import React from 'react' // eslint-disable-line
import DropdownPanel from './dropdown-panel' // eslint-disable-line

export const MemoryPanel = ({ calldata }) => {
  return (
    <DropdownPanel hexHighlight={true} bodyStyle={{ fontFamily: 'monospace' }} dropdownName='Memory' calldata={calldata || {}} />
  )
}

export default MemoryPanel
