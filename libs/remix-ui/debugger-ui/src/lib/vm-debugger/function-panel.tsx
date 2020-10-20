import React, { useState, useEffect } from 'react'
import DropdownPanel from './dropdown-panel'

export const FunctionPanel = ({ data }) => {
    const [calldata, setCalldata] = useState(null)

    useEffect(() => {
        setCalldata(data)
    }, [data])

    return (
        <div id="FunctionPanel">
            <DropdownPanel dropdownName='Function Stack' calldata={calldata || {}} />
        </div>
    )
}

export default FunctionPanel
