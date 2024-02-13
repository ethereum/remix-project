import React, {useState, useEffect} from 'react' // eslint-disable-line
import DropdownPanel from './dropdown-panel' // eslint-disable-line
import {default as deepequal} from 'deep-equal' // eslint-disable-line

export const FunctionPanel = ({data, className, stepManager}) => {
  const [functionData, setFunctionData] = useState(null)

  useEffect(() => {
    if (!deepequal(functionData, data)) {
      setFunctionData(data.map(el => el.label))
    }
  }, [data])

  const formatSelfFunc = (key, data) => {
    return data.self
  }

  const handleExpandFunc = (keyPath) => {
    stepManager.jumpTo(data[parseInt(keyPath)].function.firstStep)
  }

  const formatClassNamesFunc = (keyPath, data) => {
    return 'jumpToFunctionClick'
  }

  return (
    
    <div id="FunctionPanel" className={className} data-id="functionPanel">
      <DropdownPanel dropdownName="Function Stack" calldata={functionData || {}} formatSelfFunc={formatSelfFunc} formatClassNamesFunc={formatClassNamesFunc} handleExpandFunc={handleExpandFunc} />
    </div>
  )
}

export default FunctionPanel
