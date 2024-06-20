import React, {useEffect, useState, useContext} from 'react'
import './ContractDropdown.css'
import {AppContext} from '../AppContext'
interface ContractDropdownItem {
  value: string
  name: string
}

interface ContractDropdownProps {
  label: string
  id: string
}

// Chooses one contract from the compilation output.
export const ContractDropdown: React.FC<ContractDropdownProps> = ({label, id}) => {
  const {setSelectedContractFileAndName, compilationOutput} = useContext(AppContext)

  useEffect(() => {
    console.log('CompiilationOutput chainged', compilationOutput)
    if (!compilationOutput) return
    const isOnlyOneFileCompiled = Object.keys(compilationOutput).length === 1
    if (isOnlyOneFileCompiled) {
      const onlyFileName = Object.keys(compilationOutput)[0]
      const isOnlyOneContractCompiled = Object.keys(compilationOutput[onlyFileName].data.contracts[onlyFileName]).length === 1
      if (isOnlyOneContractCompiled) {
        const onlyContractName = Object.keys(compilationOutput[onlyFileName].data.contracts[onlyFileName])[0]
        setSelectedContractFileAndName(onlyFileName + ':' + onlyContractName)
      }
    }
  }, [compilationOutput])

  const handleSelectContract = (event: React.ChangeEvent<HTMLSelectElement>) => {
    console.log('selecting ', event.target.value)
    setSelectedContractFileAndName(event.target.value)
  }

  const hasContracts = compilationOutput && Object.keys(compilationOutput).length > 0

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <select className={`form-control custom-select pr-4 ${!hasContracts ? 'disabled-cursor' : ''}`} id={id} disabled={!hasContracts} onChange={handleSelectContract}>
        {hasContracts ? (
          Object.keys(compilationOutput).map((compilationTriggerFileName) => (
            <optgroup key={compilationTriggerFileName} label={`[Compilation Trigger File]: ${compilationTriggerFileName}`}>
              {Object.keys(compilationOutput[compilationTriggerFileName].data.contracts).map((fileName2) => (
                <>
                  <option disabled style={{fontWeight: 'bold'}}>
                    [File]: {fileName2}
                  </option>
                  {Object.keys(compilationOutput[compilationTriggerFileName].data.contracts[fileName2]).map((contractName) => (
                    <option key={fileName2 + ':' + contractName} value={compilationTriggerFileName + ':' + fileName2 + ':' + contractName}>
                      {'\u00A0\u00A0\u00A0' + contractName} {/* Indentation for contract names */}
                    </option>
                  ))}
                </>
              ))}
            </optgroup>
          ))
        ) : (
          <option>No Compiled Contracts. Please compile and select a contract</option>
        )}
      </select>
    </div>
  )
}
