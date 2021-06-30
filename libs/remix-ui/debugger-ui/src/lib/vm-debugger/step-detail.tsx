import React from 'react' // eslint-disable-line
import DropdownPanel from './dropdown-panel' // eslint-disable-line

export const StepDetail = ({ stepDetail }) => {
  return (
    <div id='stepdetail' data-id='stepdetail'>
      <DropdownPanel hexHighlight={false} dropdownName='Step details' calldata={stepDetail || {}} />
    </div>
  )
}

export default StepDetail
