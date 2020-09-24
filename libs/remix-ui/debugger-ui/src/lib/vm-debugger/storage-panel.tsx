import React from 'react'
import DropdownPanel from './dropdown-panel'

export const StoragePanel = ({ storage, header }) => {
    return (
        <div id='storagepanel'>
            <DropdownPanel dropdownName='Storage' calldata={storage} header={header} />
        </div>
    )
}

export default StoragePanel