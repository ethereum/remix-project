import React from 'react' // eslint-disable-line
import DropdownPanel from './dropdown-panel' // eslint-disable-line

export const CalldataPanel = ({ calldata, className = "" }) => {
  return (
    <div id='calldatapanel' className={className}>
      <DropdownPanel dropdownName='Call Data' calldata={calldata || {}} />
    </div>
  )
}

export default CalldataPanel
