import React from 'react' // eslint-disable-line
import DropdownPanel from './dropdown-panel' // eslint-disable-line

export const CallstackPanel = ({ calldata }) => {
  return (
    <div id='callstackpanel'>
      <DropdownPanel dropdownName='Call Stack' calldata={calldata || {}} />
    </div>
  )
}

export default CallstackPanel
