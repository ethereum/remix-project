import React from 'react'
import DropdownPanel from './dropdown-panel'

export const CallstackPanel = ({ calldata }) => {
  return (
    <div id='callstackpanel'>
      <DropdownPanel dropdownName='Call Stack' calldata={calldata || {}} />
    </div>
  )
}

export default CallstackPanel