import React from 'react'
import DropdownPanel from './dropdown-panel'

export const MemoryPanel = ({ calldata }) => {
  return (
    <DropdownPanel dropdownName='Memory' calldata={calldata || {}} />
  )
}

export default MemoryPanel
