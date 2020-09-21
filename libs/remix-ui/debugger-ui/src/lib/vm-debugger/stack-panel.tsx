import React from 'react'
import DropdownPanel from './dropdown-panel'

export const StackPanel = ({ calldata }) => {
    console.log('calldata: ', calldata)
    return (
        <div id="stackpanel">
            <DropdownPanel dropdownName='Stack' opts={{ json: true }} calldata={calldata} />
        </div>
    )
}

export default StackPanel