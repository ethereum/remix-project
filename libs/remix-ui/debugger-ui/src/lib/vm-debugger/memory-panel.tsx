import React from 'react'
import DropdownPanel from './dropdown-panel'

export const MemoryPanel = ({ calldata }) => {
    return (
        <DropdownPanel  dropdownName='Memory' opts={{
            json: true,
            css: {
              'font-family': 'monospace'
            }}} 
            calldata={calldata}
        />
    )
}

export default MemoryPanel