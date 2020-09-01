import React from 'react'
import Dropdown, { DropdownPanel } from './dropdown-panel'

export const FullStoragesChanges = ({ storageData }) => {
    return (
        <div id='fullstorageschangespanel'>
            <DropdownPanel dropdownName='Full Storages Changes' opts={{ json: true }} calldata={ storageData } />
        </div>
    )
}

export default FullStoragesChanges