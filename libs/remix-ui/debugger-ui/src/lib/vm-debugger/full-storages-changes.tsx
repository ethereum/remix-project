import React from 'react' // eslint-disable-line
import { DropdownPanel } from './dropdown-panel' // eslint-disable-line

export const FullStoragesChanges = ({ calldata, className = "" }) => {
  return (
    <div className={className} id='fullstorageschangespanel'>
      <DropdownPanel dropdownName='Full Storage Changes' calldata={ calldata || {}} />
    </div>
  )
}

export default FullStoragesChanges
