import React from 'react'
import './ContractDropdown.css'
interface ContractDropdownItem {
  value: string
  name: string
}

interface ContractDropdownProps {
  label: string
  contractNames: ContractDropdownItem[]
  id: string
}

export const ContractDropdown: React.FC<ContractDropdownProps> = ({label, contractNames, id}) => {
  const hasContracts = contractNames && contractNames.length > 0
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>

      <select className={`form-control custom-select pr-4 ${!hasContracts ? 'disabled-cursor' : ''}`} id={id} disabled={!hasContracts}>
        {hasContracts ? (
          contractNames.map((item, index) => (
            <option value={item.value} key={index}>
              {item.name}
            </option>
          ))
        ) : (
          <option>No Compiled Contracts. Please compile and select a contract</option>
        )}
      </select>
    </div>
  )
}
