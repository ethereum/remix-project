import React from 'react'
import DropdownPanel from './dropdown-panel'

export const StepDetail = ({ stepDetail }) => {
  return (
    <div id='stepdetail' data-id='stepdetail'>
      <DropdownPanel dropdownName='Step details' calldata={stepDetail || {}} />
    </div>
  )
}

export default StepDetail
