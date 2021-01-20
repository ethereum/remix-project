import React from 'react' // eslint-disable-line
import DropdownPanel from './dropdown-panel' // eslint-disable-line

export const CalldataPanel = ({ calldata }) => {
  return (
    <div id='calldatapanel'>
      <DropdownPanel dropdownName='Call Data' calldata={calldata || {}} />
    </div>
  )
}

export default CalldataPanel
