import React from 'react'
import DropdownPanel from './dropdown-panel'

export const FunctionPanel = ({ calldata }) => {
    return (
        <div id="FunctionPanel">
            <DropdownPanel dropdownName='Function Stack' opts={{ json: true, displayContentOnly: false }} calldata={calldata} />
        </div>
    )
}

export default FunctionPanel
