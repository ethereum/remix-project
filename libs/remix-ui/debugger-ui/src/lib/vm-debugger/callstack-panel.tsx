import React from 'react' // eslint-disable-line
import DropdownPanel from './dropdown-panel' // eslint-disable-line

export const CallstackPanel = ({ calldata, className }) => {
  return (
    <div id='callstackpanel' className={className}>
      <DropdownPanel dropdownName='Call Stack' calldata={calldata || {}} />
    </div>
  )
}

export default CallstackPanel
