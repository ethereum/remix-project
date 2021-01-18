import React, { useState, useEffect } from 'react'
import DropdownPanel from './dropdown-panel'
import { default as deepequal } from 'deep-equal'

export const FunctionPanel = ({ data }) => {
  const [calldata, setCalldata] = useState(null)

  useEffect(() => {
    if (!deepequal(calldata, data)) setCalldata(data)
  }, [data])

  return (
    <div id='FunctionPanel'>
      <DropdownPanel dropdownName='Function Stack' calldata={calldata || {}} />
    </div>
  )
}

export default FunctionPanel
