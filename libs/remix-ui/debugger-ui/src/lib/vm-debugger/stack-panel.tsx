import React from 'react'
import DropdownPanel from './dropdown-panel'

export const StackPanel = ({ calldata }) => {
    return (
        <div id="stackpanel">
            <DropdownPanel dropdownName='Stack' opts={{ json: true, displayContentOnly: false }} calldata={calldata} />
        </div>
    )
}

export default StackPanel