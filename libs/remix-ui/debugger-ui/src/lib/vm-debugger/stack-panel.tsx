import React from 'react'
import DropdownPanel from './dropdown-panel'

export const StackPanel = ({ calldata }) => {
  return (
    <div id='stackpanel'>
      <DropdownPanel dropdownName='Stack' calldata={calldata || {}} />
    </div>
  )
}

export default StackPanel
