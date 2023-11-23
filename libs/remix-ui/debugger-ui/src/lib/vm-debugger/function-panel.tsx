import React, {useState, useEffect} from 'react' // eslint-disable-line
import DropdownPanel from './dropdown-panel' // eslint-disable-line

export const FunctionPanel = ({data, className, stepManager}) => {
  const [functionData, setFunctionData] = useState(null)

  useEffect(() => {
    console.log("est", data)
    setFunctionData(data)
  }, [data])

  const handleExpandFunc = (keyPath) => {
    stepManager.jumpTo(data[parseInt(keyPath)].function.firstStep)
  }

  const formatClassNamesFunc = (keyPath, data) => {
    return 'jumpToFunctionClick'
  }

  const formatSelf = (key: string, data: any) => {
    return (
      <label
        className="mb-0"
        style={{
          color: data.isProperty ? 'var(--info)' : '',
          whiteSpace: 'pre-wrap'
        }}
      >
        {' ' + key}:
        <label className="mb-0">
          {' ' + data}
        </label>
      </label>
    )
  }

  function extractData (item, parent): any {  
    return item
  }



  return (
    
    <div id="FunctionPanel" className={className} data-id="functionPanel">
      <DropdownPanel extractFunc={extractData} formatSelfFunc={formatSelf} dropdownName="Function Stack" calldata={(functionData && functionData.scopesTree) || {}} formatClassNamesFunc={formatClassNamesFunc} handleExpandFunc={handleExpandFunc} />
    </div>
  )
}

export default FunctionPanel
