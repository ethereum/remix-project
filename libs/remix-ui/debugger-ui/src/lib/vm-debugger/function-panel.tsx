import { useState, useEffect } from 'react'
import DropdownPanel from './dropdown-panel' // eslint-disable-line
import { default as deepequal } from 'deep-equal' // eslint-disable-line

export const FunctionPanel = ({ data }) => {
  const [calldata, setCalldata] = useState(null)

  useEffect(() => {
    if (!deepequal(calldata, data)) setCalldata(data)
  }, [data])

  return (
    <div id='FunctionPanel' data-id='functionPanel'>
      <DropdownPanel dropdownName='Function Stack' calldata={calldata || {}} />
    </div>
  )
}

export default FunctionPanel
