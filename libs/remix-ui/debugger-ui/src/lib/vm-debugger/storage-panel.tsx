import React from 'react'
import DropdownPanel from './dropdown-panel'

export const StoragePanel = ({ calldata, header }) => {
    return (
        <div id='storagepanel'>
            <DropdownPanel dropdownName='Storage' calldata={calldata || {}} header={header} />
        </div>
    )
}

export default StoragePanel