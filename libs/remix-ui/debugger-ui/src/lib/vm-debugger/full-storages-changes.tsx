import React from 'react'
import { DropdownPanel } from './dropdown-panel'

export const FullStoragesChanges = ({ calldata }) => {
  return (
    <div id='fullstorageschangespanel'>
      <DropdownPanel dropdownName='Full Storages Changes' calldata={ calldata || {}} />
    </div>
  )
}

export default FullStoragesChanges